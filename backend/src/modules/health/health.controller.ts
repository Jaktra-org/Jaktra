import { Request, Response } from 'express';

export interface HealthResponse {
  status: 'ok';
  timestamp: string;
  uptime: number;
  environment: string;
}

export class HealthController {
  getHealth = (_req: Request, res: Response<HealthResponse>): void => {
    const response: HealthResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] ?? 'development',
    };

    res.status(200).json(response);
  };
}
