import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '../../../src/modules/event/event.service.js';
import { ValidationError } from '../../../src/shared/errors/index.js';

describe('EventService - Actor Mapping & Validation', () => {
  let eventService: EventService;
  let mockEventRepo: any;
  let mockInvoiceRepo: any;

  beforeEach(() => {
    mockEventRepo = {
      create: vi.fn().mockResolvedValue({ id: 'event-1' }),
    };
    mockInvoiceRepo = {
      findById: vi.fn(),
    };
    eventService = new EventService(mockEventRepo as any, mockInvoiceRepo as any);
  });

  it('should map ActorContext from UI to corresponding DB actor fields', async () => {
    const actor = {
      source: 'ui' as const,
      userId: '123e4567-e89b-12d3-a456-426614174000',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'admin',
    };

    await eventService.emitEvent('invoice', 'inv-123', 'tenant-1', 'invoice.created', actor, {
      description: 'Invoice #123 created manually',
    });

    expect(mockEventRepo.create).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      entityType: 'invoice',
      entityId: 'inv-123',
      actorId: '123e4567-e89b-12d3-a456-426614174000',
      actorName: 'John Doe',
      actorEmail: 'john@example.com',
      actorRole: 'admin',
      actionType: 'invoice.created',
      description: 'Invoice #123 created manually',
      source: 'ui',
      oldValues: null,
      newValues: null,
      eventType: 'invoice.created',
      payload: null,
    }, undefined);
  });

  it('should write null actor fields when source is agent or system', async () => {
    const actor = {
      source: 'agent' as const,
    };

    await eventService.emitEvent('invoice', 'inv-123', 'tenant-1', 'followup.sent', actor, {
      description: 'Agent sent follow-up email',
    });

    expect(mockEventRepo.create).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      entityType: 'invoice',
      entityId: 'inv-123',
      actorId: null,
      actorName: null,
      actorEmail: null,
      actorRole: null,
      actionType: 'followup.sent',
      description: 'Agent sent follow-up email',
      source: 'agent',
      oldValues: null,
      newValues: null,
      eventType: 'email_sent',
      payload: null,
    }, undefined);
  });

  it('should throw ValidationError if actionType is invalid', async () => {
    const actor = { source: 'system' as const };

    await expect(
      eventService.emitEvent('invoice', 'inv-123', 'tenant-1', 'invalid.action.type' as any, actor)
    ).rejects.toThrow(ValidationError);

    expect(mockEventRepo.create).not.toHaveBeenCalled();
  });

  it('should not throw if actionType is valid', async () => {
    const actor = { source: 'system' as const };

    await expect(
      eventService.emitEvent('invoice', 'inv-123', 'tenant-1', 'payment.received', actor)
    ).resolves.toBeDefined();

    expect(mockEventRepo.create).toHaveBeenCalled();
  });
});
