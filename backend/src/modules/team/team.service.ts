import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';
import { TeamRepository } from './team.repository.js';
import { UserRepository } from '../auth/user.repository.js';
import { AuthError, ValidationError } from '../../shared/errors/index.js';
import { logger } from '../../shared/logger.js';
import { config } from '../../config/env.js';

import { eq, sql } from 'drizzle-orm';
import { users, teamInvitations } from '../../db/schema.js';

export interface InviteInput {
  email: string;
  role: 'admin' | 'manager' | 'viewer';
}

export class TeamService {
  private mailTransporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly teamRepo: TeamRepository,
    private readonly userRepo: UserRepository
  ) {}

  private get transporter() {
    if (this.mailTransporter) return this.mailTransporter;

    if (!process.env.PLATFORM_SMTP_URL) {
      if (process.env.NODE_ENV === 'production') {
        throw new ValidationError('PLATFORM_SMTP_URL must be configured in production');
      }
      logger.warn('PLATFORM_SMTP_URL is not set. Emails will be skipped.');
      return null;
    }
    
    const url = new URL(process.env.PLATFORM_SMTP_URL);
    this.mailTransporter = nodemailer.createTransport({
      host: url.hostname,
      port: Number(url.port) || 587,
      secure: url.protocol === 'smtps:',
      auth: {
        user: decodeURIComponent(url.username),
        pass: decodeURIComponent(url.password),
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
    
    return this.mailTransporter;
  }

  async inviteMember(tenantId: string, invitedByUserId: string, input: InviteInput) {
    const normalizedEmail = input.email.trim().toLowerCase();
    
    const existingUser = await this.userRepo.findFirstByEmail(normalizedEmail);
    if (existingUser) {
      throw new AuthError('Email is already registered in the system', 409);
    }

    let invitationId: string;
    let expiresAt: Date = new Date();
    let rawToken = crypto.randomBytes(32).toString('hex');

    await this.teamRepo.client.transaction(async (tx: any) => {
      const txTeamRepo = new TeamRepository(tx);
      
      await txTeamRepo.lockTenant(tenantId);

      const pendingInvites = await txTeamRepo.listPendingInvitations(tenantId);
      const existingInvite = pendingInvites.find(inv => inv.email === normalizedEmail);
      if (existingInvite) {
        const lockedInvite = await txTeamRepo.findInvitationById(tenantId, existingInvite.id, true);
        if (lockedInvite && !lockedInvite.acceptedAt && !lockedInvite.revokedAt) {
          if (lockedInvite.expiresAt < new Date()) {
            await txTeamRepo.revokeInvitation(tenantId, lockedInvite.id);
          } else {
            throw new AuthError('An invitation has already been sent to this email', 400);
          }
        }
      }

      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const invitation = await txTeamRepo.createInvitation({
        tenantId,
        email: normalizedEmail,
        role: input.role,
        tokenHash,
        invitedByUserId,
        expiresAt,
      });
      invitationId = invitation.id;
    });

    this.sendInvitationEmail(invitationId!, normalizedEmail, rawToken).catch(err => {
      logger.error(`Failed to send invitation email to ${normalizedEmail}:`, err);
    });

    return { id: invitationId!, email: normalizedEmail, role: input.role, expiresAt };
  }

  private async sendInvitationEmail(invitationId: string, email: string, rawToken: string) {
    const mailer = this.transporter;
    if (!mailer) {
      await this.teamRepo.updateInvitationDeliveryStatus(invitationId, 'failed', 'Platform SMTP not configured');
      return;
    }

    const inviteUrl = `${config.FRONTEND_URL}/invite#token=${rawToken}`;
    
    try {
      await mailer.sendMail({
        from: '"Jaktra" <noreply@jaktra.com>', // Assuming default from
        to: email,
        subject: 'You have been invited to join Jaktra',
        html: `
          <p>You have been invited to join a workspace on Jaktra.</p>
          <p>Click the link below to accept the invitation and set up your account:</p>
          <p><a href="${inviteUrl}">Accept Invitation</a></p>
          <p>This invitation expires in 7 days.</p>
        `,
      });
      await this.teamRepo.updateInvitationDeliveryStatus(invitationId, 'sent');
    } catch (error: any) {
      await this.teamRepo.updateInvitationDeliveryStatus(invitationId, 'failed', 'Delivery failed');
      throw error;
    }
  }

  async resendInvitation(tenantId: string, invitationId: string) {
    let newInvite: any;
    let rawToken: string = '';
    await this.teamRepo.client.transaction(async (tx: any) => {
      const txTeamRepo = new TeamRepository(tx);
      const invite = await txTeamRepo.findInvitationById(tenantId, invitationId, true);
      if (!invite || invite.acceptedAt || invite.revokedAt) {
        throw new AuthError('Invitation not found or inactive', 404);
      }

      await txTeamRepo.revokeInvitation(tenantId, invitationId);
      
      rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      newInvite = await txTeamRepo.createInvitation({
        tenantId,
        email: invite.email,
        role: invite.role,
        tokenHash,
        invitedByUserId: invite.invitedByUserId!,
        expiresAt,
      });
    });
    
    try {
      await this.sendInvitationEmail(newInvite.id, newInvite.email, rawToken);
    } catch (err) {
      logger.error(`Failed to send invitation email to ${newInvite.email} on resend:`, err);
    }
    return newInvite;
  }

  async revokeInvitation(tenantId: string, invitationId: string) {
    return await this.teamRepo.client.transaction(async (tx: any) => {
      const txTeamRepo = new TeamRepository(tx);
      const invite = await txTeamRepo.findInvitationById(tenantId, invitationId, true);
      if (!invite || invite.acceptedAt || invite.revokedAt) {
        throw new AuthError('Invitation not found or inactive', 404);
      }
      await txTeamRepo.revokeInvitation(tenantId, invitationId);
      return invite;
    });
  }

  async acceptInvitation(rawToken: string, password: string, name: string) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const passwordHash = await bcrypt.hash(password, 12);

    return await this.teamRepo.client.transaction(async (tx: any) => {
      const txTeamRepo = new TeamRepository(tx);
      const txUserRepo = new UserRepository(tx);
      const invite = await txTeamRepo.findInvitationByTokenHash(tokenHash, true);
      
      if (!invite || invite.acceptedAt || invite.revokedAt) {
        throw new AuthError('Invalid or expired invitation', 400);
      }
      if (invite.expiresAt < new Date()) {
        throw new AuthError('Invitation has expired', 400);
      }

      // Check for global email conflict inside transaction
      const existingUser = await txUserRepo.findFirstByEmail(invite.email);
      if (existingUser) {
        throw new AuthError('Email is already registered in the system', 409);
      }

      const [newUser] = await tx.insert(users).values({
        tenantId: invite.tenantId,
        email: invite.email,
        name,
        passwordHash,
        role: invite.role,
      }).returning();
      
      await tx.update(teamInvitations)
        .set({ acceptedAt: new Date() })
        .where(eq(teamInvitations.id, invite.id));

      return {
        id: newUser.id,
        tenantId: invite.tenantId,
        email: invite.email,
        name,
        role: invite.role,
        invitationId: invite.id
      };
    });
  }

  async removeMember(tenantId: string, userId: string, removedByUserId: string) {
    if (userId === removedByUserId) {
      throw new AuthError('You cannot remove yourself from the team', 400);
    }
    return await this.teamRepo.client.transaction(async (tx: any) => {
      const txTeamRepo = new TeamRepository(tx);
      const txUserRepo = new UserRepository(tx);
      
      await txTeamRepo.lockTenant(tenantId);
      
      const adminCount = await txTeamRepo.countAdmins(tenantId);
      const user = await txUserRepo.findById(userId);
      
      if (!user || user.tenantId !== tenantId) throw new AuthError('User not found', 404);
      
      if (user.role === 'admin' && adminCount <= 1) {
        throw new AuthError('Cannot remove the last administrator', 400);
      }
      
      await txTeamRepo.removeUser(tenantId, userId);
      return user;
    });
  }

  async updateMemberRole(tenantId: string, userId: string, newRole: 'admin' | 'manager' | 'viewer') {
    return await this.teamRepo.client.transaction(async (tx: any) => {
      const txTeamRepo = new TeamRepository(tx);
      const txUserRepo = new UserRepository(tx);

      await txTeamRepo.lockTenant(tenantId);
      
      const user = await txUserRepo.findById(userId);
      if (!user || user.tenantId !== tenantId) throw new AuthError('User not found', 404);
      
      if (user.role === 'admin' && newRole !== 'admin') {
        const adminCount = await txTeamRepo.countAdmins(tenantId);
        if (adminCount <= 1) {
          throw new AuthError('Cannot demote the last administrator', 400);
        }
      }
      
      const oldRole = user.role;
      await txTeamRepo.updateUserRole(tenantId, userId, newRole);
      return {
        id: user.id,
        email: user.email,
        oldRole,
        newRole
      };
    });
  }
}
