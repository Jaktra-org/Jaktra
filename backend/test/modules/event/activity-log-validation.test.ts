import { describe, it, expect } from 'vitest';
import { EventService } from '../../../src/modules/event/event.service.js';
import { ValidationError } from '../../../src/shared/errors/index.js';

describe('Global Activity Log Validation', () => {
  it('should throw ValidationError if emitEvent is called with a garbage actionType', async () => {
    const dummyEventRepo = {} as any;
    const dummyInvoiceRepo = {} as any;
    const eventService = new EventService(dummyEventRepo, dummyInvoiceRepo);

    await expect(
      eventService.emitEvent(
        'invoice',
        '00000000-0000-0000-0000-000000000000',
        '00000000-0000-0000-0000-000000000000',
        'invoice.junk' as any,
        { source: 'system' }
      )
    ).rejects.toThrow(ValidationError);
  });

  it('should accept valid new action types without throwing', async () => {
    let createCalled = false;
    const mockEventRepo = {
      create: async (data: any) => {
        createCalled = true;
        return data;
      }
    } as any;
    const dummyInvoiceRepo = {} as any;
    const eventService = new EventService(mockEventRepo, dummyInvoiceRepo);

    const result = await eventService.emitEvent(
      'user',
      '00000000-0000-0000-0000-000000000000',
      '00000000-0000-0000-0000-000000000000',
      'user.invited',
      { source: 'system' }
    );

    expect(createCalled).toBe(true);
    expect(result.actionType).toBe('user.invited');
  });
});
