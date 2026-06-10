import { Request, Response } from 'express';
import type { AnalyticsService } from './analytics.service.js';

export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  getSummary = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getSummary(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getAging = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getAging(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  getAgentPerformance = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getAgentPerformance(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getEmailVolume = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getEmailVolume(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getChannelBreakdown = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getChannelBreakdown(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getTierEffectiveness = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getTierEffectiveness(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  getCommunicationStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantId = res.locals.tenantId as string;
      const stats = await this.analyticsService.getCommunicationStats(tenantId, req.query);
      res.status(200).json(stats);
    } catch (err: unknown) {
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}
