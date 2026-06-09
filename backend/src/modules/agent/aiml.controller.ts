import { Request, Response } from 'express';
import type { AimlService } from './aiml.service.js';

export class AimlController {
  constructor(private aimlService: AimlService) {}

  getHealth = async (_req: Request, res: Response): Promise<void> => {
    const status = await this.aimlService.getAgentStatus();
    const httpCode = status.status === 'ok' ? 200 : 503;
    res.status(httpCode).json(status);
  };
}
