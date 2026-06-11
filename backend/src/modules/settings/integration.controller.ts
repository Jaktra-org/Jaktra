import { Request, Response, NextFunction } from 'express';
import { IntegrationService } from './integration.service.js';
import { CommunicationService } from '../communication/communication.service.js';

export class IntegrationController {
  constructor(
    private readonly integrationService: IntegrationService,
    private readonly communicationService: CommunicationService
  ) {}

  getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const status = await this.integrationService.getIntegrationStatus(tenantId, 'sendgrid');
      res.set('Cache-Control', 'no-store');
      res.json(status);
    } catch (error) {
      next(error);
    }
  };

  saveSendgridKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const { apiKey } = req.body;

      if (!apiKey || typeof apiKey !== 'string' || apiKey.length > 200) {
        return res.status(400).json({ error: 'Invalid API Key format' });
      }

      await this.integrationService.validateAndSaveSendgridKey(tenantId, apiKey);
      
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
        return res.status(400).json({ error: 'Valid recipient email required' });
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
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
