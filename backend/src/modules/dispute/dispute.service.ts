import crypto from 'crypto';
import { eq, and, isNull, inArray, asc } from 'drizzle-orm';
import { invoices, tenantSettings, replyTokens, emailIntegrations, emailIntegrationSendgrid, emailIntegrationResend, paymentPlanInstallments, paymentPlanRequests } from '../../db/index.js';
import type { DatabaseClient, Invoice } from '../../db/index.js';
import type { DisputeRepository } from './dispute.repository.js';
import type { AimlService } from '../agent/aiml.service.js';
import type { CommunicationService } from '../communication/communication.service.js';
import type { CommunicationRepository } from '../communication/communication.repository.js';
import type { EventService, ActorContext } from '../event/event.service.js';
import { logger } from '../../shared/logger.js';
import type { RedisClientType } from 'redis';
import { config } from '../../config/index.js';
import { ValidationError, ForbiddenError, NotFoundError, ExternalServiceError } from '../../shared/errors/index.js';

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = crypto.createHash('sha256').update(a).digest();
  const bBuf = crypto.createHash('sha256').update(b).digest();
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function extractEmail(rawHeader: string | undefined): string | null {
  if (!rawHeader) return null;
  let emailStr = rawHeader;
  const match = rawHeader.match(/<([^>]+)>/);
  if (match && match[1]) {
    emailStr = match[1].trim();
  } else {
    emailStr = rawHeader.split(',')[0].trim();
  }
  const atIndex = emailStr.lastIndexOf('@');
  if (atIndex === -1) return emailStr.toLowerCase();
  const localPart = emailStr.slice(0, atIndex);
  const domainPart = emailStr.slice(atIndex + 1).toLowerCase();
  return `${localPart}@${domainPart}`;
}

export function getEmailDomain(email: string): string {
  const index = email.lastIndexOf('@');
  return index !== -1 ? email.slice(index + 1) : email;
}

export class DisputeService {
  constructor(
    private readonly disputeRepo: DisputeRepository,
    private readonly aimlService: AimlService,
    private readonly db: DatabaseClient,
    private readonly communicationRepo: CommunicationRepository,
    private readonly communicationService: CommunicationService,
    private readonly eventService: EventService,
    private readonly redisClient?: RedisClientType | null
  ) { }

  // NOTE (v1 limitation): No rate limiting exists on inbound processing volume per tenant/sender.
  async processInboundEmail(params: {
    from: string;
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<void> {
    const senderEmail = extractEmail(params.from);
    const recipientEmail = extractEmail(params.to);

    if (!senderEmail || !recipientEmail) {
      logger.warn(`Inbound email headers missing sender or recipient: from=${params.from}, to=${params.to}`);
      return;
    }

    let invoice: Invoice | undefined;
    let extractedId: string | undefined;

    const tokenMatch = recipientEmail.match(/^r_([a-zA-Z0-9_-]+)@/);
    if (tokenMatch && tokenMatch[1]) {
      const rawToken = tokenMatch[1].toLowerCase();
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

      const [replyTokenRecord] = await this.db
        .select()
        .from(replyTokens)
        .where(
          and(
            eq(replyTokens.tokenHash, tokenHash),
            isNull(replyTokens.revokedAt)
          )
        )
        .limit(1);

      if (!replyTokenRecord) {
        logger.warn(`Inbound email to ${recipientEmail} matched token pattern but active token hash was not found — dropping`);
        return;
      }

      if (replyTokenRecord.expiresAt && replyTokenRecord.expiresAt < new Date()) {
        logger.warn(`Inbound email to ${recipientEmail} matched token hash but token is expired — dropping`);
        return;
      }

      // Update token usage analytics
      await this.db
        .update(replyTokens)
        .set({
          lastUsedAt: new Date(),
          replyCount: (replyTokenRecord.replyCount || 0) + 1,
        })
        .where(eq(replyTokens.tokenHash, tokenHash));

      if (replyTokenRecord.invoiceId) {
        extractedId = replyTokenRecord.invoiceId;
        const [foundInvoice] = await this.db
          .select()
          .from(invoices)
          .where(and(eq(invoices.id, extractedId), isNull(invoices.deletedAt)))
          .limit(1);
        invoice = foundInvoice;
      }
    } else {
      // Legacy fallback: sub-addressing reply+<uuid>@domain
      const subAddressMatch = recipientEmail.match(/reply\+([0-9a-fA-F-]{36})@/);
      if (!subAddressMatch || !subAddressMatch[1]) {
        logger.warn(`Inbound email to ${recipientEmail} did not match tracking sub-address or token pattern — dropping`);
        return;
      }

      extractedId = subAddressMatch[1];
      const [foundInvoice] = await this.db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, extractedId), isNull(invoices.deletedAt)))
        .limit(1);
      invoice = foundInvoice;
    }

    if (!invoice) {
      logger.warn(`Inbound email matched tracking sub-address pattern but invoice ID ${extractedId || 'unknown'} was not found — dropping`);
      return;
    }

    const isTokenAuth = !!tokenMatch;
    if (!isTokenAuth) {
      const contactEmail = invoice.contactEmail;
      const expectedDomain = getEmailDomain(contactEmail).trim().toLowerCase();
      const actualDomain = getEmailDomain(senderEmail).trim().toLowerCase();
      if (actualDomain !== expectedDomain) {
        logger.warn(
          `Security Warning: Inbound email sender domain (${actualDomain}) does not match expected contact email domain (${expectedDomain}) for invoice ID ${invoice.id} — dropping`
        );
        return;
      }
    }

    const invoiceId = invoice.id;
    const tenantId = invoice.tenantId;

    // Rate Limiting checks
    if (this.redisClient && this.redisClient.isOpen) {
      try {
        const tenantLimit = config.DISPUTE_LIMIT_PER_TENANT_HOURLY;
        const senderLimit = config.DISPUTE_LIMIT_PER_SENDER_HOURLY;

        const tenantKey = `dispute_rate_limit:tenant:${tenantId}`;
        const senderKey = `dispute_rate_limit:tenant:${tenantId}:sender:${senderEmail}`;

        // 1. Check if either limit is already exceeded
        const [tenantCountStr, senderCountStr] = await Promise.all([
          this.redisClient.get(tenantKey),
          this.redisClient.get(senderKey),
        ]);

        const tenantCount = tenantCountStr ? parseInt(tenantCountStr, 10) : 0;
        const senderCount = senderCountStr ? parseInt(senderCountStr, 10) : 0;
        const senderDomain = getEmailDomain(senderEmail);

        if (tenantCount >= tenantLimit) {
          logger.warn(
            `Inbound email rate-limited for tenant ${tenantId} and sender domain ${senderDomain}: count ${tenantCount} exceeded threshold ${tenantLimit} — dropping`
          );
          return;
        }

        if (senderCount >= senderLimit) {
          logger.warn(
            `Inbound email rate-limited for tenant ${tenantId} and sender domain ${senderDomain}: count ${senderCount} exceeded threshold ${senderLimit} — dropping`
          );
          return;
        }

        // 2. Increment counters
        const [newTenantCount, newSenderCount] = await Promise.all([
          this.redisClient.incr(tenantKey),
          this.redisClient.incr(senderKey),
        ]);

        // 3. Set TTL of 1 hour on new keys
        const promises: Promise<unknown>[] = [];
        if (newTenantCount === 1) {
          promises.push(this.redisClient.expire(tenantKey, 3600));
        }
        if (newSenderCount === 1) {
          promises.push(this.redisClient.expire(senderKey, 3600));
        }
        await Promise.all(promises);

      } catch (err) {
        // Fail-open: log warning and proceed with processing the email
        logger.warn({
          err: err instanceof Error ? err.message : String(err),
          tenantId,
        }, 'Redis error during dispute rate limiting — failing open');
      }
    } else {
      // Redis is not configured or not open.
      // Log degraded state and fail-open.
      logger.warn(
        { tenantId },
        'Redis unavailable for dispute rate limiting — failing open and allowing inbound email'
      );
    }

    logger.info(`Matched inbound reply to invoice ${invoiceId} via sub-addressing`);

    const emailBody = params.text || params.html || '';
    await this.createDisputeRecord({
      tenantId,
      invoiceId,
      sender: senderEmail,
      subject: params.subject,
      body: emailBody,
      source: 'email',
    }, invoice);

    // Auto-forward copy to real tenant mailbox if configured and verified
    try {
      const [sendgridConfig] = await this.db
        .select({
          replyMode: emailIntegrationSendgrid.replyMode,
          replyMailboxVerified: emailIntegrationSendgrid.replyMailboxVerified,
          replyMailboxEmail: emailIntegrationSendgrid.replyMailboxEmail,
        })
        .from(emailIntegrations)
        .innerJoin(emailIntegrationSendgrid, eq(emailIntegrations.id, emailIntegrationSendgrid.integrationId))
        .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.isActive, true)))
        .limit(1);

      const [resendConfig] = await this.db
        .select({
          replyMode: emailIntegrationResend.replyMode,
          replyMailboxVerified: emailIntegrationResend.replyMailboxVerified,
          replyMailboxEmail: emailIntegrationResend.replyMailboxEmail,
        })
        .from(emailIntegrations)
        .innerJoin(emailIntegrationResend, eq(emailIntegrations.id, emailIntegrationResend.integrationId))
        .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.isActive, true)))
        .limit(1);

      const activeConfig = sendgridConfig || resendConfig;

      if (
        activeConfig?.replyMode === 'real_mailbox' &&
        activeConfig?.replyMailboxVerified &&
        activeConfig?.replyMailboxEmail &&
        this.communicationService
      ) {
        logger.info(`Auto-forwarding inbound email for invoice ${invoiceId} to verified tenant mailbox: ${activeConfig.replyMailboxEmail}`);
        await this.communicationService.forwardInboundEmail({
          tenantId,
          to: activeConfig.replyMailboxEmail,
          from: senderEmail,
          subject: params.subject,
          text: params.text,
          html: params.html,
        });
      }
    } catch (fwdErr) {
      logger.error(`Failed to execute auto-forwarding for tenant ${tenantId}:`, fwdErr);
    }
  }

  async createDisputeRecord(
    params: {
      tenantId: string;
      invoiceId: string;
      sender: string;
      subject: string;
      body: string;
      source: 'email' | 'portal';
    },
    preFetchedInvoice?: Invoice
  ): Promise<void> {
    const invoice = preFetchedInvoice || (await this.db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, params.invoiceId), isNull(invoices.deletedAt)))
      .limit(1)
      .then((rows) => rows[0]));

    if (!invoice) {
      throw new ValidationError('Invoice not found.');
    }

    // 1. Check Paid/Written Off state (portal-specific constraint)
    if (params.source === 'portal' && (invoice.paymentStatus === 'Paid' || invoice.paymentStatus === 'Written Off')) {
      throw new ValidationError('Cannot submit a dispute for a paid or written off invoice.');
    }

    // 2. Check admin kill-switch settings
    const [settings] = await this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, params.tenantId))
      .limit(1);

    if (settings?.inboundBlockedByAdmin) {
      if (params.source === 'portal') {
        throw new ForbiddenError('Dispute submissions are temporarily disabled.');
      }
      logger.warn(`Inbound email matched invoice ${params.invoiceId} but tenant ${params.tenantId} is blocked by admin — dropping`);
      return;
    }

    // Fetch prior communication history for context
    const comms = await this.communicationRepo.findByInvoiceId(params.invoiceId);
    const priorHistory = comms.map((c) => ({
      subject: c.subject,
      body: c.body,
      sentAt: c.sentAt,
    }));

    // Call AI service to classify and generate suggested response
    let classification = 'unclear';
    let confidence = 0.0;
    let reasoning = 'AI classification failed';
    let aiSummary = '';

    let effectiveDueDate = invoice.dueDate;
    if (invoice.hasActivePaymentPlan) {
      const [nextInst] = await this.db
        .select({ dueDate: paymentPlanInstallments.dueDate })
        .from(paymentPlanInstallments)
        .innerJoin(paymentPlanRequests, eq(paymentPlanInstallments.planRequestId, paymentPlanRequests.id))
        .where(and(
          eq(paymentPlanInstallments.invoiceId, invoice.id),
          eq(paymentPlanRequests.status, 'approved'),
          inArray(paymentPlanInstallments.status, ['pending', 'overdue'])
        ))
        .orderBy(asc(paymentPlanInstallments.dueDate))
        .limit(1);
      if (nextInst) {
        effectiveDueDate = nextInst.dueDate;
      }
    }

    try {
      const aiResult = await this.aimlService.analyzeDispute({
        inboundText: params.body,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        clientName: invoice.clientName,
        invoiceAmount: String(invoice.invoiceAmount),
        dueDate: effectiveDueDate,
        priorCommunications: priorHistory,
      });

      classification = aiResult.classification;
      confidence = aiResult.confidence;
      reasoning = aiResult.reasoning;
      if (aiResult.summary) {
        aiSummary = aiResult.summary;
      }
    } catch (err: unknown) {
      logger.error(`AI dispute analysis failed: ${err instanceof Error ? err.message : String(err)}`);
      reasoning = `AI analysis failed: ${err instanceof Error ? err.message : String(err)}`;
    }

    if (!aiSummary) {
      try {
        const sumRes = await this.aimlService.summarizeEmail({
          emailText: params.body,
          subject: params.subject,
          direction: 'inbound',
        });
        if (sumRes.summary) {
          aiSummary = sumRes.summary;
        }
      } catch (err) {
        logger.warn('Failed to generate AI summary for inbound email:', err);
      }
    }

    // Save review queue item with default status 'pending'
    await this.disputeRepo.create({
      tenantId: params.tenantId,
      invoiceId: params.invoiceId,
      sender: params.sender,
      subject: params.subject,
      body: params.body,
      classification,
      confidence: confidence.toFixed(3),
      reasoning,
      aiSummary: aiSummary || null,
      status: 'pending',
      source: params.source,
    });

    // Log dispute received audit event
    if (this.eventService) {
      await this.eventService.emitEvent(
        'invoice',
        params.invoiceId,
        params.tenantId,
        'dispute.received',
        {
          source: params.source,
          name: params.source === 'portal' ? 'Customer Portal' : 'Inbound Email',
        },
        {
          description: `Dispute email received from ${params.sender}`,
          payload: {
            sender: params.sender,
            subject: params.subject,
            body: params.body,
            classification,
            confidence,
            summary: aiSummary,
          },
        }
      ).catch((err: unknown) => {
        logger.error('Failed to emit dispute.received event', err);
      });
    }
  }

  async listDisputes(
    tenantId: string,
    params: {
      status: 'pending' | 'resolved' | 'archived';
      classification?: string;
      page: number;
      limit: number;
    }
  ): Promise<ReturnType<DisputeRepository['listDisputes']>> {
    return this.disputeRepo.listDisputes(tenantId, params);
  }

  async listPending(
    tenantId: string,
    params: { page: number; limit: number }
  ): Promise<ReturnType<DisputeRepository['listDisputes']>> {
    return this.disputeRepo.listPending(tenantId, params);
  }

  async sendReply(id: string, tenantId: string, responseBody: string, actor: ActorContext): Promise<void> {
    const dispute = await this.disputeRepo.findById(id);
    if (!dispute || dispute.tenantId !== tenantId) {
      throw new NotFoundError(`Dispute record not found: ${id}`);
    }

    // Send the reply email to customer
    if (dispute.invoiceId) {
      await this.communicationService.send({
        tenantId,
        to: dispute.sender,
        subject: dispute.subject ? `Re: ${dispute.subject}` : 'Re: Invoice Follow-up',
        html: responseBody.replace(/\n/g, '<br />'),
        bodyText: responseBody,
        channel: 'email',
        invoiceId: dispute.invoiceId,
        source: 'dispute_agent',
      });
    } else {
      logger.warn(`Dispute record ${id} has no invoiceId associated. Skipping send.`);
    }

    // Note: Per requirements, sending a reply email does NOT mark dispute as resolved.
    // Dispute remains active in Pending so future customer replies group under the same thread.

    // Log reply sent audit event
    if (this.eventService && dispute.invoiceId) {
      await this.eventService.emitEvent(
        'invoice',
        dispute.invoiceId,
        tenantId,
        'dispute.reply_sent',
        actor,
        {
          description: 'Dispute reply email sent to customer by Dispute Agent',
        }
      ).catch((err: unknown) => {
        logger.error('Failed to emit dispute.reply_sent event', err);
      });
    }
  }

  async changeStatus(
    id: string,
    tenantId: string,
    targetStatus: 'pending' | 'resolved' | 'archived',
    actor: ActorContext
  ): Promise<void> {
    const dispute = await this.disputeRepo.findById(id);
    if (!dispute || dispute.tenantId !== tenantId) {
      throw new NotFoundError(`Dispute record not found: ${id}`);
    }

    await this.disputeRepo.update(id, {
      status: targetStatus,
      reviewedBy: ('userId' in actor && actor.userId) || null,
      reviewedAt: new Date(),
    });

    if (this.eventService && dispute.invoiceId) {
      const actionName = targetStatus === 'resolved' ? 'dispute.resolved' : targetStatus === 'archived' ? 'dispute.archived' : 'dispute.reopened';
      await this.eventService.emitEvent(
        'invoice',
        dispute.invoiceId,
        tenantId,
        actionName,
        actor,
        {
          description: `Dispute item moved to ${targetStatus}.`,
        }
      ).catch((err: unknown) => {
        logger.error(`Failed to emit ${actionName} event`, err);
      });
    }
  }

  // Backward compatibility alias methods
  async approveDispute(id: string, tenantId: string, approvedBody: string, actor: ActorContext): Promise<void> {
    await this.sendReply(id, tenantId, approvedBody, actor);
    await this.changeStatus(id, tenantId, 'resolved', actor);
  }

  async discardDispute(id: string, tenantId: string, actor: ActorContext): Promise<void> {
    await this.changeStatus(id, tenantId, 'archived', actor);
  }

  async generateDraftResponse(
    id: string,
    tenantId: string,
    tenantInstruction: string
  ): Promise<{ suggestedResponse: string }> {
    const dispute = await this.disputeRepo.findById(id);
    if (!dispute || dispute.tenantId !== tenantId) {
      throw new NotFoundError(`Dispute record not found: ${id}`);
    }

    let invoiceNo = 'UNKNOWN';
    let clientName = 'Customer';
    let invoiceAmount = '0.00';
    let dueDate = new Date().toISOString();
    let priorHistory: Array<{ subject: string | null; body: string | null; sentAt: Date | null }> = [];

    if (dispute.invoiceId) {
      const [inv] = await this.db
        .select()
        .from(invoices)
        .where(and(eq(invoices.id, dispute.invoiceId), eq(invoices.tenantId, tenantId)))
        .limit(1);

      if (inv) {
        invoiceNo = inv.invoiceNo;
        clientName = inv.clientName;
        invoiceAmount = String(inv.invoiceAmount);
        dueDate = inv.dueDate;
      }

      const comms = await this.communicationRepo.findByInvoiceId(dispute.invoiceId);
      priorHistory = comms.map((c) => ({
        subject: c.subject,
        body: c.body,
        sentAt: c.sentAt,
      }));
    }

    try {
      const draftResult = await this.aimlService.generateDisputeDraft({
        tenantInstruction,
        inboundText: dispute.body || '',
        invoiceId: dispute.invoiceId || id,
        invoiceNo,
        clientName,
        invoiceAmount,
        dueDate,
        priorCommunications: priorHistory,
      });

      return { suggestedResponse: draftResult.suggestedResponse };
    } catch (err: unknown) {
      logger.error(`On-demand AI draft generation failed for dispute ${id}: ${err instanceof Error ? err.message : String(err)}`);
      throw new ExternalServiceError(
        'AI response generation timed out or failed. Click Retry to try again.',
        'AI_SERVICE_UNAVAILABLE'
      );
    }
  }
}
