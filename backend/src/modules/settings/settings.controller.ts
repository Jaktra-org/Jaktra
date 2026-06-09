import { Request, Response } from 'express';
import { z } from 'zod';
import type { SettingsService } from './settings.service.js';

const updateSettingsSchema = z.object({
  companyName: z.string().optional(),
  replyToEmail: z.string().email().optional(),
  agentName: z.string().optional(),
  timezone: z.string().optional(),
  businessHours: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
  paymentLinksEnabled: z.boolean().optional(),
  paymentProvider: z.string().optional(),
  stripeAccountId: z.string().optional(),
  razorpayMerchantId: z.string().optional(),
  emailProvider: z.string().optional(),
  sendgridApiKey: z.string().optional(),
});

export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  getSettings = async (req: Request, res: Response): Promise<any> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        return res.status(401).json({ error: { code: 'AuthError', message: 'Tenant ID required' } });
      }

      const settings = await this.settingsService.getSettings(tenantId);
      if (!settings) {
        return res.status(404).json({ error: { code: 'NotFoundError', message: 'Settings not found' } });
      }

      res.json(settings);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  };

  updateSettings = async (req: Request, res: Response): Promise<any> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        return res.status(401).json({ error: { code: 'AuthError', message: 'Tenant ID required' } });
      }

      const parseResult = updateSettingsSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({
          error: {
            code: 'ValidationError',
            message: 'Invalid settings payload',
            details: parseResult.error.format(),
          },
        });
      }

      const updated = await this.settingsService.updateSettings(tenantId, parseResult.data);
      res.json(updated);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  };

  getIntegrations = async (req: Request, res: Response): Promise<any> => {
    try {
      const tenantId = res.locals.tenantId as string;
      if (!tenantId) {
        return res.status(401).json({ error: { code: 'AuthError', message: 'Tenant ID required' } });
      }

      const integrations = await this.settingsService.getIntegrations(tenantId);
      res.json(integrations);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  };
}
