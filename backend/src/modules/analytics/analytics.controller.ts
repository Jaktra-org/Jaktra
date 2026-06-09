import { Request, Response } from 'express';
import type { AnalyticsService } from './analytics.service.js';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getDashboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getSummary(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
