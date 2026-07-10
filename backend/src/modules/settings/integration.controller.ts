import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from './integration.service.js';
import { CommunicationService } from '../communication/communication.service.js';
import { DlqService } from '../dlq/dlq.service.js';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/index.js';
import type { EventService, ActorContext } from '../event/event.service.js';

const razorpayCredsSchema = z.object({
  keyId: z.string().min(5).max(50).regex(/^rzp_/, 'Key ID must start with rzp_'),
  keySecret: z.string().min(5).max(100),
  webhookSecret: z.string().min(5).max(100),
});

export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly communicationService: CommunicationService,
    private readonly eventService?: EventService,
    private readonly dlqService?: DlqService
  ) {}

  private getActorContext(req: Request): ActorContext {
    const user = (req as any).user;
    return {
      source: 'ui',
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const [sendgridStatus, smtpStatus, razorpayStatus] = await Promise.all([
        this.integrationService.getIntegrationStatus(tenantId, 'sendgrid'),
        this.integrationService.getIntegrationStatus(tenantId, 'smtp'),
        this.integrationService.getIntegrationStatusRazorpay(tenantId)
      ]);
      res.set('Cache-Control', 'no-store');
      res.json({
        sendgrid: sendgridStatus,
        smtp: smtpStatus,
        razorpay: razorpayStatus
      });
    } catch (error) {
      next(error);
    }
  };

  saveSendgridKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const { apiKey } = req.body;

      if (!apiKey || typeof apiKey !== 'string' || apiKey.length > 200) {
        next(new ValidationError('Invalid API Key format'));
        return;
      }

      await this.integrationService.validateAndSaveSendgridKey(tenantId, apiKey);

      // Clear DLQ entries on recovery / credentials update
      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      // Auto-select as default if no provider is currently set
      const settings = await this.communicationService.getSettings(tenantId);
      if (!settings?.defaultEmailProvider) {
        await this.communicationService.setDefaultEmailProvider(tenantId, 'sendgrid');
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'sendgrid' },
      });

      res.json({ message: 'SendGrid integration saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  testSendgridKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const { to } = req.body;

      if (!to || typeof to !== 'string') {
        next(new ValidationError('Valid recipient email required'));
        return;
      }

      await this.communicationService.testConnection(tenantId, to);

      res.json({ message: 'Test email accepted for delivery' });
    } catch (error) {
      next(error);
    }
  };

  disconnectSendgrid = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      await this.integrationService.deleteSendgridIntegration(tenantId);

      const settings = await this.communicationService.getSettings(tenantId);
      if (settings && (settings as any).defaultEmailProvider === 'sendgrid') {
        // If SMTP is configured and valid, auto-switch to it
        const smtpStatus = await this.integrationService.getIntegrationStatus(tenantId, 'smtp');
        if (smtpStatus.isConfigured && smtpStatus.lastValidationResult === 'valid') {
          await this.communicationService.setDefaultEmailProvider(tenantId, 'smtp');
        } else {
          await this.communicationService.setDefaultEmailProvider(tenantId, null);
        }
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'sendgrid' },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  saveSmtpConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;

      const bodyStr = JSON.stringify(req.body);
      if (bodyStr.length > 5000) {
        next(new ValidationError('Request body too large'));
        return;
      }

      await this.integrationService.validateAndSaveSmtpConfig(tenantId, req.body);

      // Clear DLQ entries on recovery / credentials update
      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      // Auto-select as default if no provider is currently set
      const settings = await this.communicationService.getSettings(tenantId);
      if (!settings?.defaultEmailProvider) {
        await this.communicationService.setDefaultEmailProvider(tenantId, 'smtp');
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'smtp', host: req.body?.host ?? null },
      });

      res.json({ message: 'SMTP connection verified and saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  testSmtpConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const { to } = req.body;

      if (!to || typeof to !== 'string') {
        next(new ValidationError('Valid recipient email required'));
        return;
      }


      const config = await this.integrationService.getDecryptedSmtpConfig(tenantId);
      const { SmtpProvider } = await import('../communication/providers/smtp.provider.js');
      const provider = new SmtpProvider(config);
      const settings = await this.communicationService.getSettings(tenantId);
      
      if (!settings || !settings.senderEmail) {
        next(new ValidationError('Communication settings (Sender Email) not configured'));
        return;
      }

      const from = { name: settings.senderName, email: settings.senderEmail };
      const replyTo = settings.replyTo ? { email: settings.replyTo } : undefined;

      await provider.sendEmail(
        to,
        from,
        replyTo,
        'Integration Test',
        '<p>Your SMTP integration is working correctly.</p>'
      );

      res.json({ message: 'Test email accepted by SMTP server' });
    } catch (error) {
      next(error);
    }
  };

  disconnectSmtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      await this.integrationService.deleteSmtpIntegration(tenantId);

      const settings = await this.communicationService.getSettings(tenantId);
      if (settings && (settings as any).defaultEmailProvider === 'smtp') {
        // If SendGrid is configured and valid, auto-switch to it
        const sendgridStatus = await this.integrationService.getIntegrationStatus(tenantId, 'sendgrid');
        if (sendgridStatus.isConfigured && sendgridStatus.lastValidationResult === 'valid') {
          await this.communicationService.setDefaultEmailProvider(tenantId, 'sendgrid');
        } else {
          await this.communicationService.setDefaultEmailProvider(tenantId, null);
        }
      }

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'smtp' },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  saveRazorpayKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      
      const validationResult = razorpayCredsSchema.safeParse(req.body);
      if (!validationResult.success) {
        next(new ValidationError('Invalid Razorpay credentials format', JSON.stringify(validationResult.error.issues)));
        return;
      }

      const { keyId, keySecret, webhookSecret } = validationResult.data;

      await this.integrationService.validateAndSaveRazorpayKey(tenantId, { keyId, keySecret, webhookSecret });

      // Only log the keyId prefix — never the secret or webhook secret
      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.connected',
        actor: this.getActorContext(req),
        metadata: { integration: 'razorpay', keyIdPrefix: keyId.slice(0, 10) },
      });

      res.json({ message: 'Razorpay integration saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  disconnectRazorpay = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      await this.integrationService.deleteRazorpayIntegration(tenantId);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.disconnected',
        actor: this.getActorContext(req),
        metadata: { integration: 'razorpay' },
      });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  setDefaultProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const { provider } = req.body;

      if (provider !== 'sendgrid' && provider !== 'smtp' && provider !== null) {
         next(new ValidationError('Invalid provider'));
         return;
      }

      if (provider) {
        const status = await this.integrationService.getIntegrationStatus(tenantId, provider);
        if (!status || !status.isConfigured || status.lastValidationResult !== 'valid') {
           next(new ValidationError('Cannot select an absent or invalid provider'));
           return;
        }
      }

      // Capture previous default before changing it
      const prevSettings = await this.communicationService.getSettings(tenantId);
      const previousProvider = (prevSettings as any)?.defaultEmailProvider ?? null;

      await this.communicationService.setDefaultEmailProvider(tenantId, provider);

      this.eventService?.logEvent({
        tenantId,
        eventType: 'integration.default_provider_changed',
        actor: this.getActorContext(req),
        metadata: { from: previousProvider, to: provider ?? null },
      });

      res.json({ message: 'Default provider updated' });
    } catch (error) {
      next(error);
    }
  };
}
