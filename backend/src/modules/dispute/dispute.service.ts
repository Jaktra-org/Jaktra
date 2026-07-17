import crypto from 'crypto';
import { eq, and, isNull } from 'drizzle-orm';
import { invoices, tenantSettings } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { DisputeRepository, PendingDisputeItem } from './dispute.repository.js';
import type { AimlService } from '../agent/aiml.service.js';
import type { CommunicationService } from '../communication/communication.service.js';
import type { CommunicationRepository } from '../communication/communication.repository.js';
import type { EventService, ActorContext } from '../event/event.service.js';
import { logger } from '../../shared/logger.js';

export function timingSafeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const aBuf = crypto.createHash('sha256').update(a).digest();
  const bBuf = crypto.createHash('sha256').update(b).digest();
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function extractEmail(rawHeader: string | undefined): string | null {
  if (!rawHeader) return null;
  const match = rawHeader.match(/<([^>]+)>/);
  if (match && match[1]) {
    return match[1].trim().toLowerCase();
  }
  return rawHeader.trim().toLowerCase();
}

export class DisputeService {
  constructor(
    private readonly disputeRepo: DisputeRepository,
    private readonly aimlService: AimlService,
    private readonly db: DatabaseClient,
    private readonly communicationRepo: CommunicationRepository,
    private readonly communicationService: CommunicationService,
    private readonly eventService?: EventService
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

    // Try to extract invoiceId from sub-addressed recipient (e.g. reply+<uuid>@domain)
    const subAddressMatch = recipientEmail.match(/reply\+([0-9a-fA-F-]{36})@/);
    if (!subAddressMatch || !subAddressMatch[1]) {
      logger.warn(`Inbound email to ${recipientEmail} did not match tracking sub-address pattern — dropping`);
      return;
    }

    const extractedId = subAddressMatch[1];
    const [invoice] = await this.db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, extractedId), isNull(invoices.deletedAt)))
      .limit(1);

    if (!invoice) {
      logger.warn(`Inbound email matched tracking sub-address pattern but invoice ID ${extractedId} was not found — dropping`);
      return;
    }

    const contactEmail = invoice.contactEmail;
    if (senderEmail.trim().toLowerCase() !== contactEmail.trim().toLowerCase()) {
      const getEmailDomain = (email: string): string => {
        const index = email.lastIndexOf('@');
        return index !== -1 ? email.slice(index + 1) : email;
      };
      const expectedDomain = getEmailDomain(contactEmail);
      const actualDomain = getEmailDomain(senderEmail);
      logger.warn(
        `Security Warning: Inbound email sender domain (${actualDomain}) does not match expected contact email domain (${expectedDomain}) for invoice ID ${invoice.id} — dropping`
      );
      return;
    }

    const invoiceId = invoice.id;
    const tenantId = invoice.tenantId;
    logger.info(`Matched inbound reply to invoice ${invoiceId} via sub-addressing`);

    // Verify tenant settings is not blocked by admin
    const [settings] = await this.db
      .select()
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId))
      .limit(1);

    if (settings?.inboundBlockedByAdmin) {
      logger.warn(`Inbound email matched invoice ${invoiceId} but tenant ${tenantId} is blocked by admin — dropping`);
      return;
    }

    const emailBody = params.text || params.html || '';

    // Fetch prior communication history for context
    const comms = await this.communicationRepo.findByInvoiceId(invoiceId);
    const priorHistory = comms.map((c) => ({
      subject: c.subject,
      body: c.body,
      sentAt: c.sentAt,
    }));

    // Call AI service to classify and generate suggested response
    let classification = 'unclear';
    let confidence = 0.0;
    let suggestedResponse = '';
    let reasoning = 'AI classification failed';

    try {
      const aiResult = await this.aimlService.analyzeDispute({
        inboundText: emailBody,
        invoiceId: invoice.id,
        invoiceNo: invoice.invoiceNo,
        clientName: invoice.clientName,
        invoiceAmount: String(invoice.invoiceAmount),
        dueDate: invoice.dueDate,
        priorCommunications: priorHistory,
      });

      classification = aiResult.classification;
      confidence = aiResult.confidence;
      suggestedResponse = aiResult.suggestedResponse;
      reasoning = aiResult.reasoning;
    } catch (err: unknown) {
      logger.error(`AI dispute analysis failed: ${err instanceof Error ? err.message : String(err)}`);
      reasoning = `AI analysis failed: ${err instanceof Error ? err.message : String(err)}`;
    }

    // Save review queue item
    await this.disputeRepo.create({
      tenantId,
      invoiceId,
      sender: senderEmail,
      subject: params.subject,
      body: emailBody,
      classification,
      confidence: confidence.toFixed(3),
      suggestedResponse,
      reasoning,
      status: 'pending_review',
    });

    // Log dispute received audit event
    if (this.eventService) {
      await this.eventService.emitEvent(
        'invoice',
        invoiceId,
        tenantId,
        'dispute.received',
        { source: 'webhook' },
        {
          description: `Dispute email reply received from ${senderEmail} (intent: ${classification})`,
          payload: {
            classification,
            confidence,
            reasoning,
          },
        }
      ).catch((err: unknown) => {
        logger.error('Failed to emit dispute.received event', err);
      });
    }
  }

  async listPending(tenantId: string, params: { page: number; limit: number }): Promise<{
    data: PendingDisputeItem[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    return this.disputeRepo.listPending(tenantId, params);
  }

  async approveDispute(id: string, tenantId: string, approvedBody: string, actor: ActorContext): Promise<void> {
    const dispute = await this.disputeRepo.findById(id);
    if (!dispute || dispute.tenantId !== tenantId) {
      throw new Error('Dispute review item not found');
    }

    if (dispute.status !== 'pending_review') {
      throw new Error('Dispute item is already resolved');
    }

    // Send the approved response
    if (dispute.invoiceId) {
      await this.communicationService.send({
        tenantId,
        to: dispute.sender,
        subject: dispute.subject ? `Re: ${dispute.subject}` : 'Re: Invoice Follow-up',
        html: approvedBody.replace(/\n/g, '<br />'),
        channel: 'email',
        invoiceId: dispute.invoiceId,
      });
    } else {
      logger.warn(`Approved dispute review ${id} has no invoiceId associated. Skipping send.`);
    }

    // Update dispute review item status
    await this.disputeRepo.update(id, {
      status: 'approved',
      suggestedResponse: approvedBody,
      reviewedBy: ('userId' in actor && actor.userId) || null,
      reviewedAt: new Date(),
    });

    // Log approved audit event
    if (this.eventService && dispute.invoiceId) {
      await this.eventService.emitEvent(
        'invoice',
        dispute.invoiceId,
        tenantId,
        'dispute.approved',
        actor,
        {
          description: 'Manager approved and sent draft response to customer.',
        }
      ).catch((err: unknown) => {
        logger.error('Failed to emit dispute.approved event', err);
      });
    }
  }

  async discardDispute(id: string, tenantId: string, actor: ActorContext): Promise<void> {
    const dispute = await this.disputeRepo.findById(id);
    if (!dispute || dispute.tenantId !== tenantId) {
      throw new Error('Dispute review item not found');
    }

    if (dispute.status !== 'pending_review') {
      throw new Error('Dispute item is already resolved');
    }

    // Update status to discarded
    await this.disputeRepo.update(id, {
      status: 'discarded',
      reviewedBy: ('userId' in actor && actor.userId) || null,
      reviewedAt: new Date(),
    });

    // Log discarded audit event
    if (this.eventService && dispute.invoiceId) {
      await this.eventService.emitEvent(
        'invoice',
        dispute.invoiceId,
        tenantId,
        'dispute.discarded',
        actor,
        {
          description: 'Manager discarded AI-suggested dispute response.',
        }
      ).catch((err: unknown) => {
        logger.error('Failed to emit dispute.discarded event', err);
      });
    }
  }
}
