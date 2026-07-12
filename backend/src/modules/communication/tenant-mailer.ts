import tls from 'tls';
import { logger } from '../../shared/logger.js';
import { CommunicationError } from '../../shared/errors/index.js';
import type { EmailProvider, ResolvedEmailConfig, EmailSendResult, EmailMessage } from '../../shared/email/index.js';
import { createEmailProvider } from '../../shared/email/email-provider.factory.js';
import type { SmtpConfig } from '../../shared/email/providers/smtp-email.provider.js';
import type { IntegrationService } from '../settings/integration.service.js';
import type { CommunicationRepository } from './communication.repository.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { EventService } from '../event/event.service.js';
import type { DlqRepository } from '../dlq/dlq.repository.js';

export interface TenantEmailConfigResolver {
  resolve(tenantId: string): Promise<ResolvedEmailConfig>;
  handleDeliveryError(tenantId: string, provider: 'sendgrid' | 'smtp', error: Error): Promise<void>;
}

export class DbTenantEmailConfigResolver implements TenantEmailConfigResolver {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly communicationRepo: CommunicationRepository
  ) {}

  async resolve(tenantId: string): Promise<ResolvedEmailConfig> {
    const settings = await this.communicationRepo.getSettings(tenantId);
    if (!settings || !settings.senderEmail) {
      throw new CommunicationError('Communication settings not configured for this tenant', 400);
    }

    const defaultProvider = (settings as { defaultEmailProvider?: 'sendgrid' | 'smtp' }).defaultEmailProvider;
    if (!defaultProvider) {
      throw new CommunicationError('EMAIL_PROVIDER_NOT_CONFIGURED', 400);
    }

    if (defaultProvider === 'sendgrid') {
      const apiKey = await this.integrationService.getDecryptedSendgridKey(tenantId);
      return { kind: 'sendgrid', apiKey };
    } else if (defaultProvider === 'smtp') {
      const smtpConfig = await this.integrationService.getDecryptedSmtpConfig(tenantId);
      return {
        kind: 'smtp',
        host: smtpConfig.host,
        port: smtpConfig.port,
        user: smtpConfig.username,
        password: smtpConfig.password,
        secure: smtpConfig.securityMode === 'implicit_tls',
      };
    } else {
      throw new CommunicationError(`Unsupported default email provider: ${defaultProvider}`, 400);
    }
  }

  async handleDeliveryError(tenantId: string, provider: 'sendgrid' | 'smtp', error: Error): Promise<void> {
    await this.integrationService.handleDeliveryError(tenantId, provider, error);
  }
}

export class TenantMailer {
  constructor(
    private readonly configResolver: TenantEmailConfigResolver,
    private readonly communicationRepo: CommunicationRepository,
    private readonly invoiceRepo: InvoiceRepository,
    private readonly eventService?: EventService,
    private readonly dlqRepo?: DlqRepository
  ) {}

  private async getProvider(tenantId: string): Promise<EmailProvider> {
    return createEmailProvider(await this.configResolver.resolve(tenantId));
  }

  async sendCollectionEmail(
    tenantId: string,
    message: EmailMessage,
    options?: { invoiceId?: string }
  ): Promise<EmailSendResult> {
    const settings = await this.communicationRepo.getSettings(tenantId);
    const defaultProvider = settings?.defaultEmailProvider as 'sendgrid' | 'smtp' | undefined;
    if (!defaultProvider) {
      return { success: false, error: 'EMAIL_PROVIDER_NOT_CONFIGURED' };
    }

    try {
      const provider = await this.getProvider(tenantId);
      const result = await provider.send(message);

      if (result.success && defaultProvider === 'smtp' && options?.invoiceId) {
        // Start background polling for SMTP bounces
        const resolvedConfig = await this.configResolver.resolve(tenantId);
        if (resolvedConfig.kind === 'smtp') {
          const smtpConfig: SmtpConfig = {
            payloadVersion: 1,
            host: resolvedConfig.host,
            port: resolvedConfig.port as 465 | 587 | 2525,
            securityMode: resolvedConfig.secure ? 'implicit_tls' : 'starttls',
            username: resolvedConfig.user,
            password: resolvedConfig.password,
          };
          this.startSmtpBouncePolling(tenantId, options.invoiceId, message.to, smtpConfig).catch((err) => {
            logger.error(`Error in background SMTP bounce polling for invoice ${options.invoiceId}:`, err);
          });
        }
      }

      if (!result.success) {
        // Delegate tracking of validation and operational errors to IntegrationService
        await this.configResolver.handleDeliveryError(
          tenantId,
          defaultProvider,
          new Error(result.error || 'Email sending failed')
        );
      }

      return result;
    } catch (error: unknown) {
      if (!(error instanceof CommunicationError)) {
        await this.configResolver.handleDeliveryError(
          tenantId,
          defaultProvider,
          error instanceof Error ? error : new Error(String(error))
        );
      }
      throw error;
    }
  }

  private async checkImapForBounce(smtpConfig: SmtpConfig, recipient: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const host = getImapHost(smtpConfig.host);
      const port = 993; // standard IMAP over TLS port
      const username = smtpConfig.username;
      const password = smtpConfig.password;

      const socket = tls.connect(port, host, { rejectUnauthorized: false }, () => {
        logger.debug(`[IMAP] Connected to ${host}:${port} for bounce check`);
      });

      socket.setTimeout(10000); // 10s socket timeout

      let commandStep = 0;
      let buffer = '';
      let foundBounce = false;

      const sendCmd = (tag: string, cmd: string): void => {
        logger.debug(`[IMAP] Sent: ${tag} ${cmd}`);
        socket.write(`${tag} ${cmd}\r\n`);
      };

      socket.on('data', (data) => {
        buffer += data.toString('utf8');

        while (buffer.includes('\r\n')) {
          const lineEnd = buffer.indexOf('\r\n');
          const line = buffer.substring(0, lineEnd);
          buffer = buffer.substring(lineEnd + 2);

          logger.debug(`[IMAP] Received: ${line}`);

          if (commandStep === 0 && line.includes('* OK')) {
            commandStep = 1;
            sendCmd('A1', `LOGIN "${username}" "${password}"`);
          } else if (commandStep === 1 && line.startsWith('A1 ')) {
            if (line.includes('OK')) {
              commandStep = 2;
              sendCmd('A2', 'SELECT INBOX');
            } else {
              socket.destroy();
              reject(new Error(`IMAP Login failed: ${line}`));
              return;
            }
          } else if (commandStep === 2 && line.startsWith('A2 ')) {
            if (line.includes('OK')) {
              commandStep = 3;
              sendCmd('A3', `SEARCH FROM "mailer-daemon" TEXT "${recipient}"`);
            } else {
              socket.destroy();
              reject(new Error(`IMAP SELECT INBOX failed: ${line}`));
              return;
            }
          } else if (commandStep === 3) {
            if (line.startsWith('* SEARCH')) {
              const ids = line.replace('* SEARCH', '').trim();
              if (ids.length > 0) {
                foundBounce = true;
              }
            } else if (line.startsWith('A3 ')) {
              commandStep = 4;
              sendCmd('A4', 'LOGOUT');
            }
          } else if (commandStep === 4 && line.startsWith('A4 ')) {
            socket.destroy();
            resolve(foundBounce);
            return;
          }
        }
      });

      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('IMAP connection timed out'));
      });

      socket.on('error', (err) => {
        socket.destroy();
        reject(err);
      });

      socket.on('close', () => {
        resolve(foundBounce);
      });
    });
  }

  private async startSmtpBouncePolling(
    tenantId: string,
    invoiceId: string,
    recipient: string,
    smtpConfig: SmtpConfig
  ): Promise<void> {
    const maxPolls = 8;
    const pollIntervalMs = 15000;

    logger.info(`[IMAP] Starting SMTP bounce polling for invoice ${invoiceId} / recipient ${recipient}`);

    for (let attempt = 1; attempt <= maxPolls; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

      logger.debug(`[IMAP] Checking for bounce. Attempt ${attempt}/${maxPolls}`);
      try {
        const isBounced = await this.checkImapForBounce(smtpConfig, recipient);
        if (isBounced) {
          logger.warn(`[IMAP] Asynchronous bounce detected for invoice ${invoiceId} recipient ${recipient}`);

          const comms = await this.communicationRepo.findByInvoiceId(invoiceId);
          const latestSent = comms.find((c) => c.status === 'sent');
          if (latestSent) {
            await this.communicationRepo.markFailed(
              latestSent.id,
              'Email bounced: Recipient mailbox does not exist'
            );
          }

          const invoice = await this.invoiceRepo.findById(invoiceId);
          if (invoice) {
            const newCount = Math.max(0, invoice.followupCount - 1);
            await this.invoiceRepo.update(invoiceId, tenantId, {
              followupCount: newCount,
            });
          }

          if (this.eventService) {
            await this.eventService.emitEvent(
              'invoice',
              invoiceId,
              tenantId,
              'followup.bounced',
              { source: 'system' },
              {
                description: 'Follow-up email bounced (IMAP detection)',
                payload: {
                  reason: 'mail_bounced',
                  error: 'Recipient email address does not exist',
                  recipient,
                },
              }
            ).catch((err: unknown) => {
              logger.error('Failed to log followup.bounced event', err instanceof Error ? err : String(err));
            });
          }

          if (this.dlqRepo) {
            await this.dlqRepo.recordFailure(
              invoiceId,
              tenantId,
              'Delivery failed: Mailbox does not exist (bounced)',
              `Recipient email address ${recipient} is invalid or non-existent.`
            );
          }

          return;
        }
      } catch (err: unknown) {
        logger.error(`[IMAP] Error checking bounce on attempt ${attempt}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    logger.info(`[IMAP] Finished SMTP bounce polling for invoice ${invoiceId} / recipient ${recipient} with no bounce detected.`);
  }
}

function getImapHost(smtpHost: string): string {
  const host = smtpHost.toLowerCase();
  if (host.includes('gmail.com')) return 'imap.gmail.com';
  if (host.includes('yahoo.com')) return 'imap.mail.yahoo.com';
  if (host.includes('outlook.com') || host.includes('office365.com')) return 'outlook.office365.com';
  return smtpHost.replace(/^smtp\./i, 'imap.');
}
