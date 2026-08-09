import { Request, Response, NextFunction } from 'express';
import type { DisputeService } from './dispute.service.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import { z } from 'zod';
import { ValidationError } from '../../shared/errors/index.js';
import type { ActorContext } from '../event/event.service.js';

const ApproveSchema = z.object({
  suggestedResponse: z.string().min(1, 'Response body cannot be empty'),
});

const SendReplySchema = z.object({
  responseBody: z.string().min(1, 'Response body cannot be empty'),
});

const StatusChangeSchema = z.object({
  status: z.enum(['pending', 'resolved', 'archived']),
});

const ListDisputesSchema = z.object({
  status: z.enum(['pending', 'resolved', 'archived']).default('pending'),
  classification: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(25),
});

export class DisputeController {
  constructor(private readonly disputeService: DisputeService) { }

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

  listDisputes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const params = ListDisputesSchema.parse(req.query);
      const result = await this.disputeService.listDisputes(tenantId, params);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };

  listPending = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return this.listDisputes(req, res, next);
  };

  sendReply = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const disputeId = req.params.id as string;

      const parsed = SendReplySchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Invalid response body', JSON.stringify(parsed.error.format())));
        return;
      }

      const actor = this.getActorContext(req);
      await this.disputeService.sendReply(disputeId, tenantId, parsed.data.responseBody, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const disputeId = req.params.id as string;

      const parsed = StatusChangeSchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Invalid status change payload', JSON.stringify(parsed.error.format())));
        return;
      }

      const actor = this.getActorContext(req);
      await this.disputeService.changeStatus(disputeId, tenantId, parsed.data.status, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  approve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const disputeId = req.params.id as string;

      const parsed = ApproveSchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Invalid response body', JSON.stringify(parsed.error.format())));
        return;
      }

      const actor = this.getActorContext(req);
      await this.disputeService.approveDispute(disputeId, tenantId, parsed.data.suggestedResponse, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  discard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const disputeId = req.params.id as string;

      const actor = this.getActorContext(req);
      await this.disputeService.discardDispute(disputeId, tenantId, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  generateDraft = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const tenantId = authReq.user.tenantId;
      const disputeId = req.params.id as string;

      const GenerateDraftSchema = z.object({
        tenantInstruction: z.string().min(1, 'Instruction cannot be empty'),
      });

      const parsed = GenerateDraftSchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Invalid instruction body', JSON.stringify(parsed.error.format())));
        return;
      }

      const result = await this.disputeService.generateDraftResponse(
        disputeId,
        tenantId,
        parsed.data.tenantInstruction
      );
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
