import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { PaymentPlanService } from './payment-plan.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import { ValidationError } from '../../shared/errors/index.js';
import type { ActorContext } from '../event/event.service.js';

const SubmitPlanSchema = z.object({
  installments: z.number().int().min(2).max(24, 'Installments count must be between 2 and 24 months.'),
  reason: z.string().optional(),
});

const ListPlansSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
});

export class PaymentPlanController {
  constructor(private readonly service: PaymentPlanService) {}

  private getActorContext(req: Request): ActorContext {
    const authReq = req as AuthenticatedRequest;
    return {
      source: 'ui' as const,
      userId: authReq.user.userId,
      name: authReq.user.name,
      email: authReq.user.email,
      role: authReq.user.role,
    };
  }

  submitFromPortal = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { invoice, tenant } = res.locals.portalContext;

      const parsed = SubmitPlanSchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Invalid plan details', JSON.stringify(parsed.error.format())));
        return;
      }

      const { installments, reason } = parsed.data;
      const result = await this.service.submitRequest(tenant.id, invoice.id, installments, reason);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  listPending = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const params = ListPlansSchema.parse(req.query);

      const result = await this.service.listPending(tenantId, params);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const planId = req.params.id as string;

      const actor = this.getActorContext(req);
      await this.service.approve(planId, tenantId, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  deny = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const planId = req.params.id as string;

      const actor = this.getActorContext(req);
      await this.service.deny(planId, tenantId, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  cancelActivePlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const invoiceId = req.params.id as string;

      const actor = this.getActorContext(req);
      await this.service.cancelActivePlan(invoiceId, tenantId, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
