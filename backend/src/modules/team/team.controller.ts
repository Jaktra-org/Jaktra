import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { TeamService } from './team.service.js';
import type { TeamRepository } from './team.repository.js';
import { ValidationError } from '../../shared/errors/index.js';
import type { AuthenticatedRequest } from '../../shared/types/auth.js';
import type { EventService, ActorContext } from '../event/event.service.js';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'manager', 'viewer']),
});

const updateRoleSchema = z.object({
  role: z.enum(['admin', 'manager', 'viewer']),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1).max(255),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(100),
});

const sanitizeInvitation = (inv: Record<string, unknown>): Record<string, unknown> => {
  const safe = { ...inv };
  delete safe.tokenHash;
  delete safe.deliveryError;
  return safe;
};

export class TeamController {
  constructor(
    private readonly teamService: TeamService,
    private readonly teamRepo: TeamRepository,
    private readonly eventService?: EventService
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

  listMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const members = await this.teamRepo.listActiveMembers(tenantId);
      res.status(200).json(members.map(m => {
        const safe = { ...m } as Partial<typeof m>;
        delete safe.passwordHash;
        return safe;
      }));
    } catch (err: unknown) {
      next(err);
    }
  };

  listInvitations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const invites = await this.teamRepo.listPendingInvitations(tenantId);
      res.status(200).json(invites.map(sanitizeInvitation));
    } catch (err: unknown) {
      next(err);
    }
  };

  inviteMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId, userId } = (req as AuthenticatedRequest).user;
      const parsed = inviteSchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
        return;
      }

      const invite = await this.teamService.inviteMember(tenantId, userId, parsed.data);
      if (this.eventService) {
        const actor = this.getActorContext(req);
        await this.eventService.emitEvent('user', invite.id, tenantId, 'user.invited', actor, {
          description: `User ${invite.email} invited as ${invite.role}`,
          newValues: {
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
          },
        });
      }
      res.status(201).json(sanitizeInvitation(invite));
    } catch (err: unknown) {
      next(err);
    }
  };

  resendInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const inviteId = req.params.id as string;
      const invite = await this.teamService.resendInvitation(tenantId, inviteId);
      if (this.eventService) {
        const actor = this.getActorContext(req);
        await this.eventService.emitEvent('user', invite.id, tenantId, 'user.invite_resent', actor, {
          description: `Invitation resent to ${invite.email}`,
          oldValues: {
            email: invite.email,
            role: invite.role,
          },
          newValues: {
            email: invite.email,
            role: invite.role,
            expiresAt: invite.expiresAt,
          },
        });
      }
      res.status(200).json(sanitizeInvitation(invite));
    } catch (err: unknown) {
      next(err);
    }
  };

  revokeInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const inviteId = req.params.id as string;
      const invite = await this.teamService.revokeInvitation(tenantId, inviteId);
      if (this.eventService && invite) {
        const actor = this.getActorContext(req);
        await this.eventService.emitEvent('user', invite.id, tenantId, 'user.invite_revoked', actor, {
          description: `Invitation revoked for ${invite.email}`,
          oldValues: {
            email: invite.email,
            role: invite.role,
          },
        });
      }
      res.status(204).send();
    } catch (err: unknown) {
      next(err);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const memberId = req.params.id as string;
      const removedUser = await this.teamService.removeMember(tenantId, memberId, (req as AuthenticatedRequest).user.userId || 'unknown');

      if (this.eventService && removedUser) {
        const actor = this.getActorContext(req);
        await this.eventService.emitEvent('user', removedUser.id, tenantId, 'user.removed', actor, {
          description: `User ${removedUser.email} removed from the team`,
          oldValues: {
            email: removedUser.email,
            role: removedUser.role,
          },
        });
      }

      res.status(204).send();
    } catch (err: unknown) {
      next(err);
    }
  };

  updateMemberRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tenantId } = (req as AuthenticatedRequest).user;
      const memberId = req.params.id as string;
      const parsed = updateRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
        return;
      }

      const roleUpdate = await this.teamService.updateMemberRole(tenantId, memberId, parsed.data.role as 'admin' | 'manager' | 'viewer');

      if (this.eventService && roleUpdate) {
        const actor = this.getActorContext(req);
        await this.eventService.emitEvent('user', roleUpdate.id, tenantId, 'user.role_updated', actor, {
          description: `Role updated for ${roleUpdate.email} from ${roleUpdate.oldRole} to ${roleUpdate.newRole}`,
          oldValues: {
            role: roleUpdate.oldRole,
          },
          newValues: {
            role: roleUpdate.newRole,
          },
        });
      }

      res.status(200).json({ success: true });
    } catch (err: unknown) {
      next(err);
    }
  };

  acceptInvitation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = acceptInviteSchema.safeParse(req.body);
      if (!parsed.success) {
        next(new ValidationError('Validation failed', JSON.stringify(parsed.error.issues)));
        return;
      }

      const result = await this.teamService.acceptInvitation(parsed.data.token, parsed.data.password, parsed.data.name);

      if (this.eventService && result) {
        const actor: ActorContext = {
          source: 'ui',
          userId: result.id,
          name: result.name,
          email: result.email,
          role: result.role,
        };
        await this.eventService.emitEvent('user', result.id, result.tenantId, 'user.joined', actor, {
          description: `User ${result.email} accepted invitation and joined the team`,
          newValues: {
            email: result.email,
            role: result.role,
          },
        });
      }

      res.status(200).json({ success: true });
    } catch (err: unknown) {
      next(err);
    }
  };
}
