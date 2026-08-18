import { eq, and } from 'drizzle-orm';
import type { DatabaseClient } from '../../db/index.js';
import {
  emailIntegrations,
  emailIntegrationSendgrid,
  emailIntegrationSmtp,
  emailIntegrationResend,
  tenantIntegrations,
  inboundEmails,
  tenantSettings,
  sendgridReplyModeEnum,
} from '../../db/index.js';
import crypto from 'crypto';
import { ValidationError, NotFoundError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';

export type SendgridReplyMode = typeof sendgridReplyModeEnum.enumValues[number];

export interface SetupProgressStep1 {
  isDone: boolean;
  isConfigured: boolean;
}

export interface SetupProgressStep2Sendgrid {
  isDone: boolean;
  status: 'not_started' | 'awaiting_sender_info' | 'awaiting_otp' | 'completed';
  senderName: string | null;
  senderEmail: string | null;
  replyTo: string | null;
  replyMode: SendgridReplyMode;
  replyMailboxEmail: string | null;
  replyMailboxVerified: boolean;
  requiresOtp: boolean;
}

export interface SetupProgressStep3Sendgrid {
  isDone: boolean;
  status: 'not_started' | 'awaiting_inbound_domain' | 'awaiting_mx_verification' | 'verified';
  inboundDomain: string | null;
  webhookUrl: string;
  sendgridSettingsUrl: string;
  isVerified: boolean;
}

export interface SendgridSetupProgress {
  provider: 'sendgrid';
  step1ApiKey: SetupProgressStep1;
  step2SenderAndMode: SetupProgressStep2Sendgrid;
  step3InboundWebhook: SetupProgressStep3Sendgrid;
  overallStatus: 'not_configured' | 'partially_configured' | 'active';
  isActive: boolean;
}

export interface SetupProgressStep1Smtp {
  isDone: boolean;
  host: string | null;
  port: number;
  username: string | null;
  hasPassword: boolean;
  encryptionType: 'tls' | 'ssl' | 'none';
  allowSelfSigned: boolean;
}

export interface SetupProgressStep2Smtp {
  isDone: boolean;
  senderName: string | null;
  senderEmail: string | null;
  replyTo: string | null;
}

export interface SmtpSetupProgress {
  provider: 'smtp';
  step1ConnectionDetails: SetupProgressStep1Smtp;
  step2SenderIdentity: SetupProgressStep2Smtp;
  overallStatus: 'not_configured' | 'partially_configured' | 'active';
  isActive: boolean;
}

export type ResendReplyMode = 'real_mailbox' | 'webhook_only';

export interface SetupProgressStep1Resend {
  isDone: boolean;
  hasApiKey: boolean;
  lastValidationResult: 'valid' | 'invalid' | 'untested';
}

export interface SetupProgressStep2Resend {
  isDone: boolean;
  status: 'not_started' | 'awaiting_sender_info' | 'awaiting_otp' | 'completed';
  senderName: string | null;
  senderEmail: string | null;
  replyTo: string | null;
  replyMode: ResendReplyMode;
  replyMailboxEmail: string | null;
  replyMailboxVerified: boolean;
  requiresOtp: boolean;
}

export interface SetupProgressStep3Resend {
  isDone: boolean;
  status: 'not_started' | 'awaiting_inbound_domain' | 'awaiting_mx_verification' | 'verified';
  inboundDomain: string | null;
  webhookUrl: string;
  resendSettingsUrl: string;
  isVerified: boolean;
  expectedMxTarget?: string;
  expectedPriority?: number;
  region?: string;
}

export interface ResendSetupProgress {
  provider: 'resend';
  step1ApiKey: SetupProgressStep1Resend;
  step2SenderAndMode: SetupProgressStep2Resend;
  step3InboundWebhook: SetupProgressStep3Resend;
  overallStatus: 'not_configured' | 'partially_configured' | 'active';
  isActive: boolean;
}

export class IntegrationRepository {
  constructor(private readonly db: DatabaseClient) {}

  async hasInboundEmails(tenantId: string): Promise<boolean> {
    const [row] = await this.db
      .select({ id: inboundEmails.id })
      .from(inboundEmails)
      .where(eq(inboundEmails.tenantId, tenantId))
      .limit(1);
    return !!row;
  }

  async getIntegration(tenantId: string, provider: 'razorpay'): Promise<typeof tenantIntegrations.$inferSelect | null> {
    const [row] = await this.db
      .select()
      .from(tenantIntegrations)
      .where(and(eq(tenantIntegrations.tenantId, tenantId), eq(tenantIntegrations.provider, provider)))
      .limit(1);
    return row || null;
  }

  async upsertIntegration(data: {
    tenantId: string;
    provider: 'razorpay';
    ciphertext: string;
    iv: string;
    authTag: string;
    keyVersion: number;
    lastValidatedAt?: Date | null;
    lastValidationResult?: string | null;
    lastOperationalErrorCode?: string | null;
  }): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(tenantIntegrations)
      .where(and(eq(tenantIntegrations.tenantId, data.tenantId), eq(tenantIntegrations.provider, 'razorpay')))
      .limit(1);

    if (existing) {
      await this.db
        .update(tenantIntegrations)
        .set({
          ciphertext: data.ciphertext,
          iv: data.iv,
          authTag: data.authTag,
          keyVersion: data.keyVersion,
          lastValidatedAt: data.lastValidatedAt || new Date(),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          lastValidationResult: (data.lastValidationResult as any) || 'valid',
          lastOperationalErrorCode: data.lastOperationalErrorCode || null,
          updatedAt: new Date(),
        })
        .where(eq(tenantIntegrations.id, existing.id));
    } else {
      await this.db.insert(tenantIntegrations).values({
        id: crypto.randomUUID(),
        tenantId: data.tenantId,
        provider: 'razorpay',
        ciphertext: data.ciphertext,
        iv: data.iv,
        authTag: data.authTag,
        keyVersion: data.keyVersion,
        lastValidatedAt: data.lastValidatedAt || new Date(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        lastValidationResult: (data.lastValidationResult as any) || 'valid',
        lastOperationalErrorCode: data.lastOperationalErrorCode || null,
      });
    }
  }

  async deleteIntegration(tenantId: string, provider: 'razorpay'): Promise<void> {
    await this.db
      .delete(tenantIntegrations)
      .where(and(eq(tenantIntegrations.tenantId, tenantId), eq(tenantIntegrations.provider, provider)));
  }

  async deleteEmailIntegration(tenantId: string, provider: 'sendgrid' | 'smtp' | 'resend'): Promise<void> {
    await this.db
      .delete(emailIntegrations)
      .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.provider, provider)));
  }

  async updateWebhookToken(tenantId: string, webhookToken: string): Promise<void> {
    await this.db
      .update(tenantSettings)
      .set({
        webhookToken,
        updatedAt: new Date(),
      })
      .where(eq(tenantSettings.tenantId, tenantId));
  }

  async getWebhookToken(tenantId: string): Promise<string | undefined> {
    const [row] = await this.db
      .select({ webhookToken: tenantSettings.webhookToken })
      .from(tenantSettings)
      .where(eq(tenantSettings.tenantId, tenantId))
      .limit(1);
    return row?.webhookToken || undefined;
  }

  async getOrCreateBaseIntegration(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
    tenantId: string,
    provider: 'sendgrid' | 'smtp' | 'resend'
  ): Promise<typeof emailIntegrations.$inferSelect> {
    const [existing] = await tx
      .select()
      .from(emailIntegrations)
      .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.provider, provider)))
      .limit(1);

    if (existing) return existing;

    const id = crypto.randomUUID();
    await tx.insert(emailIntegrations).values({
      id,
      tenantId,
      provider,
      overallStatus: 'not_configured',
      isActive: false,
    });

    const [created] = await tx
      .select()
      .from(emailIntegrations)
      .where(eq(emailIntegrations.id, id))
      .limit(1);

    return created!;
  }

  async getSendgridIntegration(tenantId: string): Promise<{ base: typeof emailIntegrations.$inferSelect; detail: typeof emailIntegrationSendgrid.$inferSelect | null } | null> {
    const [base] = await this.db
      .select()
      .from(emailIntegrations)
      .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.provider, 'sendgrid')))
      .limit(1);

    if (!base) return null;

    const [detail] = await this.db
      .select()
      .from(emailIntegrationSendgrid)
      .where(eq(emailIntegrationSendgrid.integrationId, base.id))
      .limit(1);

    return { base, detail: detail || null };
  }

  async getSmtpIntegration(tenantId: string): Promise<{ base: typeof emailIntegrations.$inferSelect; detail: typeof emailIntegrationSmtp.$inferSelect | null } | null> {
    const [base] = await this.db
      .select()
      .from(emailIntegrations)
      .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.provider, 'smtp')))
      .limit(1);

    if (!base) return null;

    const [detail] = await this.db
      .select()
      .from(emailIntegrationSmtp)
      .where(eq(emailIntegrationSmtp.integrationId, base.id))
      .limit(1);

    return { base, detail: detail || null };
  }

  async getResendIntegration(tenantId: string): Promise<{ base: typeof emailIntegrations.$inferSelect; detail: typeof emailIntegrationResend.$inferSelect | null } | null> {
    const [base] = await this.db
      .select()
      .from(emailIntegrations)
      .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.provider, 'resend')))
      .limit(1);

    if (!base) return null;

    const [detail] = await this.db
      .select()
      .from(emailIntegrationResend)
      .where(eq(emailIntegrationResend.integrationId, base.id))
      .limit(1);

    return { base, detail: detail || null };
  }

  async getActiveEmailIntegration(tenantId: string): Promise<{ base: typeof emailIntegrations.$inferSelect; detail: typeof emailIntegrationSendgrid.$inferSelect | typeof emailIntegrationSmtp.$inferSelect | typeof emailIntegrationResend.$inferSelect | null; provider: 'sendgrid' | 'smtp' | 'resend' } | null> {
    const [base] = await this.db
      .select()
      .from(emailIntegrations)
      .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.isActive, true)))
      .limit(1);

    if (!base) return null;

    if (base.provider === 'sendgrid') {
      const [detail] = await this.db
        .select()
        .from(emailIntegrationSendgrid)
        .where(eq(emailIntegrationSendgrid.integrationId, base.id))
        .limit(1);
      return { base, detail: detail || null, provider: 'sendgrid' as const };
    } else if (base.provider === 'smtp') {
      const [detail] = await this.db
        .select()
        .from(emailIntegrationSmtp)
        .where(eq(emailIntegrationSmtp.integrationId, base.id))
        .limit(1);
      return { base, detail: detail || null, provider: 'smtp' as const };
    } else {
      const [detail] = await this.db
        .select()
        .from(emailIntegrationResend)
        .where(eq(emailIntegrationResend.integrationId, base.id))
        .limit(1);
      return { base, detail: detail || null, provider: 'resend' as const };
    }
  }

  async syncOverallStatusAndActivation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
    integrationId: string
  ): Promise<void> {
    const [base] = await tx
      .select()
      .from(emailIntegrations)
      .where(eq(emailIntegrations.id, integrationId))
      .limit(1);

    if (!base) throw new NotFoundError('Email integration not found');

    let newOverallStatus: 'not_configured' | 'partially_configured' | 'active' = 'not_configured';

    if (base.provider === 'sendgrid') {
      const [detail] = await tx
        .select()
        .from(emailIntegrationSendgrid)
        .where(eq(emailIntegrationSendgrid.integrationId, integrationId))
        .limit(1);

      const step1Done = !!detail?.ciphertext && !!detail?.iv && !!detail?.authTag;
      const step2Done = !!base.senderName && !!base.senderEmail && (detail?.replyMode === 'webhook_only' || detail?.replyMailboxVerified === true);
      const step3Done = detail?.inboundParseVerified === true && !!detail?.inboundDomain;

      newOverallStatus = (step1Done && step2Done && step3Done) ? 'active' : step1Done ? 'partially_configured' : 'not_configured';
    } else if (base.provider === 'smtp') {
      const [detail] = await tx
        .select()
        .from(emailIntegrationSmtp)
        .where(eq(emailIntegrationSmtp.integrationId, integrationId))
        .limit(1);

      const step1Done = !!detail?.host && !!detail?.port && !!detail?.ciphertext && !!detail?.iv && !!detail?.authTag;
      const step2Done = !!base.senderName && !!base.senderEmail;

      newOverallStatus = (step1Done && step2Done && detail?.lastValidationResult === 'valid') ? 'active' : step1Done ? 'partially_configured' : 'not_configured';
    } else if (base.provider === 'resend') {
      const [detail] = await tx
        .select()
        .from(emailIntegrationResend)
        .where(eq(emailIntegrationResend.integrationId, integrationId))
        .limit(1);

      const step1Done = !!detail?.ciphertext && !!detail?.iv && !!detail?.authTag;
      const step2Done = !!base.senderName && !!base.senderEmail && (detail?.replyMode === 'webhook_only' || detail?.replyMailboxVerified === true);
      const step3Done = detail?.inboundParseVerified === true && !!detail?.inboundDomain;

      newOverallStatus = (step1Done && step2Done && step3Done) ? 'active' : step1Done ? 'partially_configured' : 'not_configured';
    }

    let shouldBeActive = base.isActive;

    if (newOverallStatus !== 'active' && base.isActive) {
      shouldBeActive = false; // Auto-deactivate on status degradation
    } else if (newOverallStatus === 'active' && !base.isActive) {
      const [existingActive] = await tx
        .select()
        .from(emailIntegrations)
        .where(and(eq(emailIntegrations.tenantId, base.tenantId), eq(emailIntegrations.isActive, true)))
        .limit(1);

      if (!existingActive) {
        shouldBeActive = true; // Auto-activate first active provider
      }
    }

    try {
      await tx
        .update(emailIntegrations)
        .set({
          overallStatus: newOverallStatus,
          isActive: shouldBeActive,
          updatedAt: new Date(),
        })
        .where(eq(emailIntegrations.id, integrationId));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if ((err.code === 'ER_DUP_ENTRY' || err.message?.includes('unq_single_active_provider')) && shouldBeActive) {
        logger.warn(`Auto-activation race lost for integration ${integrationId}; preserving overallStatus update with isActive = false.`);
        await tx
          .update(emailIntegrations)
          .set({
            overallStatus: newOverallStatus,
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(emailIntegrations.id, integrationId));
      } else {
        throw err;
      }
    }
  }

  async saveSendgridIntegrationTransaction(
    tenantId: string,
    baseData: { senderName?: string | null; senderEmail?: string | null; replyTo?: string | null },
    sendgridData: {
      ciphertext?: string | null;
      iv?: string | null;
      authTag?: string | null;
      keyVersion?: number;
      inboundDomain?: string | null;
      inboundParseVerified?: boolean;
      replyMode?: SendgridReplyMode;
      replyMailboxEmail?: string | null;
      replyMailboxVerified?: boolean;
      replyMailboxOtpCode?: string | null;
      replyMailboxOtpExpiresAt?: Date | null;
      clearStep2?: boolean;
      clearStep3?: boolean;
    }
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const base = await this.getOrCreateBaseIntegration(tx, tenantId, 'sendgrid');

      // Update base fields
      const baseUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (sendgridData.clearStep2) {
        baseUpdate.senderName = null;
        baseUpdate.senderEmail = null;
        baseUpdate.replyTo = null;
      } else {
        if (baseData.senderName !== undefined) baseUpdate.senderName = baseData.senderName;
        if (baseData.senderEmail !== undefined) baseUpdate.senderEmail = baseData.senderEmail;
        if (baseData.replyTo !== undefined) baseUpdate.replyTo = baseData.replyTo;
      }

      await tx.update(emailIntegrations).set(baseUpdate).where(eq(emailIntegrations.id, base.id));

      // Check if detail row exists
      const [existingDetail] = await tx
        .select()
        .from(emailIntegrationSendgrid)
        .where(eq(emailIntegrationSendgrid.integrationId, base.id))
        .limit(1);

      // Data-consistency guard for replyMailboxVerified & replyMailboxEmail
      let finalMailboxVerified = sendgridData.replyMailboxVerified;
      if (sendgridData.clearStep2) {
        finalMailboxVerified = false;
      } else if (sendgridData.replyMailboxEmail !== undefined) {
        const newMailbox = sendgridData.replyMailboxEmail?.trim().toLowerCase() || '';
        const oldMailbox = existingDetail?.replyMailboxEmail?.trim().toLowerCase() || '';
        if (!newMailbox) {
          finalMailboxVerified = false;
        } else if (oldMailbox && newMailbox !== oldMailbox && sendgridData.replyMailboxVerified === undefined) {
          // Reset verification only if mailbox email actually changed
          finalMailboxVerified = false;
        }
      }

      if (existingDetail) {
        const detailUpdate: Record<string, unknown> = {};
        if (sendgridData.ciphertext !== undefined) detailUpdate.ciphertext = sendgridData.ciphertext;
        if (sendgridData.iv !== undefined) detailUpdate.iv = sendgridData.iv;
        if (sendgridData.authTag !== undefined) detailUpdate.authTag = sendgridData.authTag;
        if (sendgridData.keyVersion !== undefined) detailUpdate.keyVersion = sendgridData.keyVersion;

        if (sendgridData.clearStep2) {
          detailUpdate.replyMode = 'webhook_only';
          detailUpdate.replyMailboxEmail = null;
          detailUpdate.replyMailboxVerified = false;
          detailUpdate.replyMailboxOtpCode = null;
          detailUpdate.replyMailboxOtpExpiresAt = null;
        } else {
          if (sendgridData.replyMode !== undefined) detailUpdate.replyMode = sendgridData.replyMode;
          if (sendgridData.replyMailboxEmail !== undefined) detailUpdate.replyMailboxEmail = sendgridData.replyMailboxEmail;
          if (finalMailboxVerified !== undefined) detailUpdate.replyMailboxVerified = finalMailboxVerified;
          if (sendgridData.replyMailboxOtpCode !== undefined) detailUpdate.replyMailboxOtpCode = sendgridData.replyMailboxOtpCode;
          if (sendgridData.replyMailboxOtpExpiresAt !== undefined) detailUpdate.replyMailboxOtpExpiresAt = sendgridData.replyMailboxOtpExpiresAt;
        }

        if (sendgridData.clearStep3) {
          detailUpdate.inboundDomain = null;
          detailUpdate.inboundParseVerified = false;
        } else {
          if (sendgridData.inboundDomain !== undefined) detailUpdate.inboundDomain = sendgridData.inboundDomain;
          if (sendgridData.inboundParseVerified !== undefined) detailUpdate.inboundParseVerified = sendgridData.inboundParseVerified;
        }

        if (Object.keys(detailUpdate).length > 0) {
          await tx.update(emailIntegrationSendgrid).set(detailUpdate).where(eq(emailIntegrationSendgrid.integrationId, base.id));
        }
      } else {
        await tx.insert(emailIntegrationSendgrid).values({
          id: crypto.randomUUID(),
          integrationId: base.id,
          ciphertext: sendgridData.ciphertext || null,
          iv: sendgridData.iv || null,
          authTag: sendgridData.authTag || null,
          keyVersion: sendgridData.keyVersion || 1,
          inboundDomain: sendgridData.clearStep3 ? null : (sendgridData.inboundDomain || null),
          inboundParseVerified: sendgridData.clearStep3 ? false : (sendgridData.inboundParseVerified || false),
          replyMode: sendgridData.clearStep2 ? 'webhook_only' : (sendgridData.replyMode || 'webhook_only'),
          replyMailboxEmail: sendgridData.clearStep2 ? null : (sendgridData.replyMailboxEmail || null),
          replyMailboxVerified: sendgridData.clearStep2 ? false : (finalMailboxVerified || false),
          replyMailboxOtpCode: sendgridData.clearStep2 ? null : (sendgridData.replyMailboxOtpCode || null),
          replyMailboxOtpExpiresAt: sendgridData.clearStep2 ? null : (sendgridData.replyMailboxOtpExpiresAt || null),
        });
      }

      await this.syncOverallStatusAndActivation(tx, base.id);
    });
  }

  async saveSmtpIntegrationTransaction(
    tenantId: string,
    baseData: { senderName?: string | null; senderEmail?: string | null; replyTo?: string | null },
    smtpData: {
      host: string;
      port: number;
      username?: string | null;
      ciphertext: string;
      iv: string;
      authTag: string;
      keyVersion?: number;
      encryptionType?: 'tls' | 'ssl' | 'none';
      allowSelfSigned?: boolean;
      lastValidationResult?: 'valid' | 'invalid' | 'untested';
      lastValidatedAt?: Date | null;
    }
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const base = await this.getOrCreateBaseIntegration(tx, tenantId, 'smtp');

      const baseUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (baseData.senderName !== undefined) baseUpdate.senderName = baseData.senderName;
      if (baseData.senderEmail !== undefined) baseUpdate.senderEmail = baseData.senderEmail;
      if (baseData.replyTo !== undefined) baseUpdate.replyTo = baseData.replyTo;

      await tx.update(emailIntegrations).set(baseUpdate).where(eq(emailIntegrations.id, base.id));

      const [existingDetail] = await tx
        .select()
        .from(emailIntegrationSmtp)
        .where(eq(emailIntegrationSmtp.integrationId, base.id))
        .limit(1);

      if (existingDetail) {
        await tx
          .update(emailIntegrationSmtp)
          .set({
            host: smtpData.host,
            port: smtpData.port,
            username: smtpData.username !== undefined ? smtpData.username : existingDetail.username,
            ciphertext: smtpData.ciphertext,
            iv: smtpData.iv,
            authTag: smtpData.authTag,
            keyVersion: smtpData.keyVersion || existingDetail.keyVersion,
            encryptionType: smtpData.encryptionType || existingDetail.encryptionType,
            allowSelfSigned: smtpData.allowSelfSigned !== undefined ? smtpData.allowSelfSigned : existingDetail.allowSelfSigned,
            lastValidationResult: smtpData.lastValidationResult || existingDetail.lastValidationResult,
            lastValidatedAt: smtpData.lastValidatedAt !== undefined ? smtpData.lastValidatedAt : existingDetail.lastValidatedAt,
          })
          .where(eq(emailIntegrationSmtp.integrationId, base.id));
      } else {
        await tx.insert(emailIntegrationSmtp).values({
          id: crypto.randomUUID(),
          integrationId: base.id,
          host: smtpData.host,
          port: smtpData.port,
          username: smtpData.username || null,
          ciphertext: smtpData.ciphertext,
          iv: smtpData.iv,
          authTag: smtpData.authTag,
          keyVersion: smtpData.keyVersion || 1,
          encryptionType: smtpData.encryptionType || 'tls',
          allowSelfSigned: smtpData.allowSelfSigned || false,
          lastValidationResult: smtpData.lastValidationResult || 'untested',
          lastValidatedAt: smtpData.lastValidatedAt || null,
        });
      }

      await this.syncOverallStatusAndActivation(tx, base.id);
    });
  }

  async saveResendIntegrationTransaction(
    tenantId: string,
    baseData: { senderName?: string | null; senderEmail?: string | null; replyTo?: string | null },
    resendData: {
      ciphertext?: string | null;
      iv?: string | null;
      authTag?: string | null;
      keyVersion?: number;
      lastValidationResult?: 'valid' | 'invalid' | 'untested';
      lastValidatedAt?: Date | null;
      inboundDomain?: string | null;
      inboundParseVerified?: boolean;
      replyMode?: ResendReplyMode;
      replyMailboxEmail?: string | null;
      replyMailboxVerified?: boolean;
      replyMailboxOtpCode?: string | null;
      replyMailboxOtpExpiresAt?: Date | null;
      clearStep2?: boolean;
      clearStep3?: boolean;
    }
  ): Promise<void> {
    await this.db.transaction(async (tx) => {
      const base = await this.getOrCreateBaseIntegration(tx, tenantId, 'resend');

      const baseUpdate: Record<string, unknown> = { updatedAt: new Date() };
      if (resendData.clearStep2) {
        baseUpdate.senderName = null;
        baseUpdate.senderEmail = null;
        baseUpdate.replyTo = null;
      } else {
        if (baseData.senderName !== undefined) baseUpdate.senderName = baseData.senderName;
        if (baseData.senderEmail !== undefined) baseUpdate.senderEmail = baseData.senderEmail;
        if (baseData.replyTo !== undefined) baseUpdate.replyTo = baseData.replyTo;
      }

      await tx.update(emailIntegrations).set(baseUpdate).where(eq(emailIntegrations.id, base.id));

      const [existingDetail] = await tx
        .select()
        .from(emailIntegrationResend)
        .where(eq(emailIntegrationResend.integrationId, base.id))
        .limit(1);

      // Data-consistency guard for replyMailboxVerified & replyMailboxEmail
      let finalMailboxVerified = resendData.replyMailboxVerified;
      if (resendData.clearStep2) {
        finalMailboxVerified = false;
      } else if (resendData.replyMailboxEmail !== undefined) {
        const newMailbox = resendData.replyMailboxEmail?.trim().toLowerCase() || '';
        const oldMailbox = existingDetail?.replyMailboxEmail?.trim().toLowerCase() || '';
        if (!newMailbox) {
          finalMailboxVerified = false;
        } else if (oldMailbox && newMailbox !== oldMailbox && resendData.replyMailboxVerified === undefined) {
          finalMailboxVerified = false;
        }
      }

      if (existingDetail) {
        const detailUpdate: Record<string, unknown> = {};
        if (resendData.ciphertext !== undefined) detailUpdate.ciphertext = resendData.ciphertext;
        if (resendData.iv !== undefined) detailUpdate.iv = resendData.iv;
        if (resendData.authTag !== undefined) detailUpdate.authTag = resendData.authTag;
        if (resendData.keyVersion !== undefined) detailUpdate.keyVersion = resendData.keyVersion;
        if (resendData.lastValidationResult !== undefined) detailUpdate.lastValidationResult = resendData.lastValidationResult;
        if (resendData.lastValidatedAt !== undefined) detailUpdate.lastValidatedAt = resendData.lastValidatedAt;

        if (resendData.clearStep2) {
          detailUpdate.replyMode = 'webhook_only';
          detailUpdate.replyMailboxEmail = null;
          detailUpdate.replyMailboxVerified = false;
          detailUpdate.replyMailboxOtpCode = null;
          detailUpdate.replyMailboxOtpExpiresAt = null;
        } else {
          if (resendData.replyMode !== undefined) detailUpdate.replyMode = resendData.replyMode;
          if (resendData.replyMailboxEmail !== undefined) detailUpdate.replyMailboxEmail = resendData.replyMailboxEmail;
          if (finalMailboxVerified !== undefined) detailUpdate.replyMailboxVerified = finalMailboxVerified;
          if (resendData.replyMailboxOtpCode !== undefined) detailUpdate.replyMailboxOtpCode = resendData.replyMailboxOtpCode;
          if (resendData.replyMailboxOtpExpiresAt !== undefined) detailUpdate.replyMailboxOtpExpiresAt = resendData.replyMailboxOtpExpiresAt;
        }

        if (resendData.clearStep3) {
          detailUpdate.inboundDomain = null;
          detailUpdate.inboundParseVerified = false;
        } else {
          if (resendData.inboundDomain !== undefined) detailUpdate.inboundDomain = resendData.inboundDomain;
          if (resendData.inboundParseVerified !== undefined) detailUpdate.inboundParseVerified = resendData.inboundParseVerified;
        }

        if (Object.keys(detailUpdate).length > 0) {
          await tx.update(emailIntegrationResend).set(detailUpdate).where(eq(emailIntegrationResend.integrationId, base.id));
        }
      } else {
        await tx.insert(emailIntegrationResend).values({
          id: crypto.randomUUID(),
          integrationId: base.id,
          ciphertext: resendData.ciphertext || null,
          iv: resendData.iv || null,
          authTag: resendData.authTag || null,
          keyVersion: resendData.keyVersion || 1,
          lastValidationResult: resendData.lastValidationResult || 'untested',
          lastValidatedAt: resendData.lastValidatedAt || null,
          inboundDomain: resendData.clearStep3 ? null : (resendData.inboundDomain || null),
          inboundParseVerified: resendData.clearStep3 ? false : (resendData.inboundParseVerified || false),
          replyMode: resendData.clearStep2 ? 'webhook_only' : (resendData.replyMode || 'webhook_only'),
          replyMailboxEmail: resendData.clearStep2 ? null : (resendData.replyMailboxEmail || null),
          replyMailboxVerified: resendData.clearStep2 ? false : (finalMailboxVerified || false),
          replyMailboxOtpCode: resendData.clearStep2 ? null : (resendData.replyMailboxOtpCode || null),
          replyMailboxOtpExpiresAt: resendData.clearStep2 ? null : (resendData.replyMailboxOtpExpiresAt || null),
        });
      }

      await this.syncOverallStatusAndActivation(tx, base.id);
    });
  }

  async setActiveProvider(tenantId: string, targetProvider: 'sendgrid' | 'smtp' | 'resend'): Promise<void> {
    try {
      await this.db.transaction(async (tx) => {
        const [target] = await tx
          .select()
          .from(emailIntegrations)
          .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.provider, targetProvider)))
          .limit(1);

        if (!target || target.overallStatus !== 'active') {
          throw new ValidationError('Provider must be fully configured and active before it can be activated for email dispatch.');
        }

        await tx
          .update(emailIntegrations)
          .set({ isActive: false })
          .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.isActive, true)));

        await tx
          .update(emailIntegrations)
          .set({ isActive: true })
          .where(and(eq(emailIntegrations.tenantId, tenantId), eq(emailIntegrations.provider, targetProvider)));
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.code === 'ER_DUP_ENTRY' || err.message?.includes('unq_single_active_provider')) {
        throw new ValidationError('Another activation request was processed simultaneously. Please refresh and try again.');
      }
      throw err;
    }
  }
}
