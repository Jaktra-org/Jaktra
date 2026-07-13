import { Request, Response, NextFunction } from 'express';
import type { SettingsService } from './settings.service.js';
import { updateSettingsSchema } from './settings.service.js';
import { AuthError, NotFoundError, ValidationError } from '../../shared/errors/index.js';
import type { EventService, ActorContext } from '../event/event.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import { DlqService } from '../dlq/dlq.service.js';

export class SettingsController {
  constructor(
    private settingsService: SettingsService,
    private eventService?: EventService,
    private dlqService?: DlqService,
    private platformMailer?: any
  ) {}

  private getActorContext(req: Request): ActorContext {
    const authReq = req as AuthenticatedRequest;
    return {
      source: 'ui',
      userId: authReq.user.userId,
      name: authReq.user.name,
      email: authReq.user.email,
      role: authReq.user.role,
    };
  }

  getSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        next(new AuthError('Tenant ID required', 401));
        return;
      }

      const settings = await this.settingsService.getSettings(tenantId);
      if (!settings) {
        next(new NotFoundError('Settings not found'));
        return;
      }

      res.json(settings);
    } catch (error) {
      next(error);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        next(new AuthError('Tenant ID required', 401));
        return;
      }

      const parseResult = updateSettingsSchema.safeParse(req.body);
      if (!parseResult.success) {
        next(new ValidationError('Invalid settings payload', JSON.stringify(parseResult.error.format())));
        return;
      }

      const oldSettings = await this.settingsService.getSettings(tenantId);
      const updated = await this.settingsService.updateSettings(tenantId, parseResult.data);

      if (this.eventService && oldSettings && updated) {
        const actor = this.getActorContext(req);
        const oldValues: Record<string, unknown> = {};
        const newValues: Record<string, unknown> = {};
        for (const key of Object.keys(parseResult.data)) {
          const oldVal = (oldSettings as Record<string, unknown>)[key];
          const newVal = (updated as Record<string, unknown>)[key];
          if (oldVal !== newVal) {
            oldValues[key] = oldVal;
            newValues[key] = newVal;
          }
        }
        if (Object.keys(newValues).length > 0) {
          await this.eventService.emitEvent('settings', tenantId, tenantId, 'settings.updated', actor, {
            description: 'Tenant settings updated',
            oldValues,
            newValues,
          });
        }
      }

      if (this.dlqService) {
        await this.dlqService.clearAllFailures(tenantId).catch(() => {});
      }

      res.json(updated);
    } catch (error) {
      next(error);
    }
  };

  getIntegrations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        next(new AuthError('Tenant ID required', 401));
        return;
      }

      const integrations = await this.settingsService.getIntegrations(tenantId);
      res.json(integrations);
    } catch (error) {
      next(error);
    }
  };

  rotateWebhookToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        next(new AuthError('Tenant ID required', 401));
        return;
      }

      const updated = await this.settingsService.rotateWebhookToken(tenantId);

      if (this.eventService && updated) {
        const actor = this.getActorContext(req);
        await this.eventService.emitEvent('settings', tenantId, tenantId, 'settings.webhook_token_rotated', actor, {
          description: 'Webhook verification token rotated',
        });
      }

      res.json({ webhookToken: updated.webhookToken });
    } catch (error) {
      next(error);
    }
  };

  startInboundVerificationTest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        next(new AuthError('Tenant ID required', 401));
        return;
      }

      const authReq = req as AuthenticatedRequest;
      const userEmail = authReq.user?.email;
      if (!userEmail) {
        next(new AuthError('User email required', 401));
        return;
      }

      const result = await this.settingsService.startInboundVerificationTest(tenantId, userEmail, this.platformMailer);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getInboundVerificationStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        next(new AuthError('Tenant ID required', 401));
        return;
      }

      const result = await this.settingsService.getInboundVerificationStatus(tenantId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };
}
