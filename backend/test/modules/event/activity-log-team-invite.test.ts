import { describe, it, expect, vi } from 'vitest';
import { TeamController } from '../../../src/modules/team/team.controller.js';

describe('TeamController Audit Logging (Phase 3)', () => {
  it('should emit user.invited event when inviteMember is successful', async () => {
    const mockInvite = {
      id: 'invite-id-123',
      email: 'newuser@example.com',
      role: 'viewer',
      expiresAt: new Date('2026-12-31T23:59:59Z')
    };

    const mockTeamService = {
      inviteMember: vi.fn().mockResolvedValue(mockInvite)
    } as any;

    const mockTeamRepo = {} as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new TeamController(mockTeamService, mockTeamRepo, mockEventService);

    const req = {
      body: {
        email: 'newuser@example.com',
        role: 'viewer'
      },
      user: {
        tenantId: 'tenant-123',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.inviteMember(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(mockTeamService.inviteMember).toHaveBeenCalledWith('tenant-123', 'admin-456', {
      email: 'newuser@example.com',
      role: 'viewer'
    });

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'user',
      entityId: 'invite-id-123',
      tenantId: 'tenant-123',
      actionType: 'user.invited',
      actor: {
        source: 'ui',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      opts: {
        description: 'User newuser@example.com invited as viewer',
        newValues: {
          email: 'newuser@example.com',
          role: 'viewer',
          expiresAt: mockInvite.expiresAt
        }
      }
    });
  });

  it('should emit user.invite_resent event when resendInvitation is successful', async () => {
    const mockInvite = {
      id: 'invite-id-123',
      email: 'newuser@example.com',
      role: 'viewer',
      expiresAt: new Date('2026-12-31T23:59:59Z')
    };

    const mockTeamService = {
      resendInvitation: vi.fn().mockResolvedValue(mockInvite)
    } as any;

    const mockTeamRepo = {} as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new TeamController(mockTeamService, mockTeamRepo, mockEventService);

    const req = {
      params: {
        id: 'invite-id-123'
      },
      user: {
        tenantId: 'tenant-123',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.resendInvitation(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockTeamService.resendInvitation).toHaveBeenCalledWith('tenant-123', 'invite-id-123');

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'user',
      entityId: 'invite-id-123',
      tenantId: 'tenant-123',
      actionType: 'user.invite_resent',
      actor: {
        source: 'ui',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      opts: {
        description: 'Invitation resent to newuser@example.com',
        oldValues: {
          email: 'newuser@example.com',
          role: 'viewer'
        },
        newValues: {
          email: 'newuser@example.com',
          role: 'viewer',
          expiresAt: mockInvite.expiresAt
        }
      }
    });
  });

  it('should emit user.invite_revoked event when revokeInvitation is successful', async () => {
    const mockInvite = {
      id: 'invite-id-123',
      email: 'newuser@example.com',
      role: 'viewer'
    };

    const mockTeamService = {
      revokeInvitation: vi.fn().mockResolvedValue(mockInvite)
    } as any;

    const mockTeamRepo = {} as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new TeamController(mockTeamService, mockTeamRepo, mockEventService);

    const req = {
      params: {
        id: 'invite-id-123'
      },
      user: {
        tenantId: 'tenant-123',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.revokeInvitation(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(mockTeamService.revokeInvitation).toHaveBeenCalledWith('tenant-123', 'invite-id-123');

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'user',
      entityId: 'invite-id-123',
      tenantId: 'tenant-123',
      actionType: 'user.invite_revoked',
      actor: {
        source: 'ui',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      opts: {
        description: 'Invitation revoked for newuser@example.com',
        oldValues: {
          email: 'newuser@example.com',
          role: 'viewer'
        }
      }
    });
  });

  it('should emit user.joined event when acceptInvitation is successful (pre-auth context)', async () => {
    const mockJoinResult = {
      id: 'new-user-id-789',
      tenantId: 'tenant-123',
      email: 'newuser@example.com',
      name: 'New Joined User',
      role: 'viewer',
      invitationId: 'invite-id-123'
    };

    const mockTeamService = {
      acceptInvitation: vi.fn().mockResolvedValue(mockJoinResult)
    } as any;

    const mockTeamRepo = {} as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new TeamController(mockTeamService, mockTeamRepo, mockEventService);

    const req = {
      body: {
        token: 'invite-token-abc',
        password: 'securePassword123',
        name: 'New Joined User'
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.acceptInvitation(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockTeamService.acceptInvitation).toHaveBeenCalledWith('invite-token-abc', 'securePassword123', 'New Joined User');

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'user',
      entityId: 'new-user-id-789',
      tenantId: 'tenant-123',
      actionType: 'user.joined',
      actor: {
        source: 'ui',
        userId: 'new-user-id-789',
        name: 'New Joined User',
        email: 'newuser@example.com',
        role: 'viewer'
      },
      opts: {
        description: 'User newuser@example.com accepted invitation and joined the team',
        newValues: {
          email: 'newuser@example.com',
          role: 'viewer'
        }
      }
    });
  });

  it('should emit user.removed event when removeMember is successful', async () => {
    const mockUser = {
      id: 'target-user-id-999',
      email: 'removeduser@example.com',
      role: 'viewer',
    };

    const mockTeamService = {
      removeMember: vi.fn().mockResolvedValue(mockUser)
    } as any;

    const mockTeamRepo = {} as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new TeamController(mockTeamService, mockTeamRepo, mockEventService);

    const req = {
      params: {
        id: 'target-user-id-999'
      },
      user: {
        tenantId: 'tenant-123',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.removeMember(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(mockTeamService.removeMember).toHaveBeenCalledWith('tenant-123', 'target-user-id-999', 'admin-456');

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'user',
      entityId: 'target-user-id-999',
      tenantId: 'tenant-123',
      actionType: 'user.removed',
      actor: {
        source: 'ui',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      opts: {
        description: 'User removeduser@example.com removed from the team',
        oldValues: {
          email: 'removeduser@example.com',
          role: 'viewer'
        }
      }
    });
  });

  it('should emit user.role_updated event when updateMemberRole is successful', async () => {
    const mockUpdateResult = {
      id: 'target-user-id-999',
      email: 'updateduser@example.com',
      oldRole: 'viewer',
      newRole: 'manager'
    };

    const mockTeamService = {
      updateMemberRole: vi.fn().mockResolvedValue(mockUpdateResult)
    } as any;

    const mockTeamRepo = {} as any;

    const emittedEvents: any[] = [];
    const mockEventService = {
      emitEvent: vi.fn().mockImplementation(async (entityType, entityId, tenantId, actionType, actor, opts) => {
        emittedEvents.push({ entityType, entityId, tenantId, actionType, actor, opts });
        return {} as any;
      })
    } as any;

    const controller = new TeamController(mockTeamService, mockTeamRepo, mockEventService);

    const req = {
      params: {
        id: 'target-user-id-999'
      },
      body: {
        role: 'manager'
      },
      user: {
        tenantId: 'tenant-123',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      }
    } as any;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    } as any;

    const next = vi.fn();

    await controller.updateMemberRole(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockTeamService.updateMemberRole).toHaveBeenCalledWith('tenant-123', 'target-user-id-999', 'manager');

    expect(emittedEvents.length).toBe(1);
    expect(emittedEvents[0]).toEqual({
      entityType: 'user',
      entityId: 'target-user-id-999',
      tenantId: 'tenant-123',
      actionType: 'user.role_updated',
      actor: {
        source: 'ui',
        userId: 'admin-456',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      },
      opts: {
        description: 'Role updated for updateduser@example.com from viewer to manager',
        oldValues: {
          role: 'viewer'
        },
        newValues: {
          role: 'manager'
        }
      }
    });
  });
});
