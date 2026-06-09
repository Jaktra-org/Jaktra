import { Request, Response } from 'express';
import type { ReconcilerService } from './reconciler.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';

export class ReconcilerController {
  constructor(private reconcilerService: ReconcilerService) {}

  reconcile = async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      
      const result = await this.reconcilerService.reconcile(tenantId);
      res.status(200).json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: { message: 'Failed to reconcile invoices' } });
    }
  };
}
