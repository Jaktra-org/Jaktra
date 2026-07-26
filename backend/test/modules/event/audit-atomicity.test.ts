import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import { createDatabaseClient } from '../../../src/db/index.js';
import { config } from '../../../src/config/env.js';
import { eq, inArray } from 'drizzle-orm';
import { tenants, invoices, events } from '../../../src/db/schema.js';
import { InvoiceRepository } from '../../../src/modules/invoice/invoice.repository.js';
import { EventService } from '../../../src/modules/event/event.service.js';
import { EventRepository } from '../../../src/modules/event/event.repository.js';
import { AgentService } from '../../../src/modules/agent/agent.service.js';
import crypto from 'crypto';
import { logger } from '../../../src/shared/logger.js';

describe('Audit Atomicity and Transaction Control', () => {
  let db: any;
  let invoiceRepo: InvoiceRepository;
  let eventRepo: EventRepository;
  let eventService: EventService;

  let tenantId: string;
  let testTenantIds: string[] = [];
  let testInvoiceIds: string[] = [];
  let testEventIds: string[] = [];

  beforeAll(async () => {
    db = createDatabaseClient({ connectionString: config.DATABASE_URL });
    eventRepo = new EventRepository(db);
    eventService = new EventService(eventRepo);
    invoiceRepo = new InvoiceRepository(db, eventService);
  });

  beforeEach(async () => {
    testTenantIds = [];
    testInvoiceIds = [];
    testEventIds = [];

    const uniqueSuffix = crypto.randomUUID().substring(0, 8);
    const [t] = await db.insert(tenants).values({ name: 'Tenant Atomicity', slug: `atom-${uniqueSuffix}` }).returning();
    tenantId = t.id;
    testTenantIds.push(t.id);
  });

  afterEach(async () => {
    if (testEventIds.length > 0) {
      await db.delete(events).where(inArray(events.id, testEventIds));
    }
    if (testInvoiceIds.length > 0) {
      await db.delete(invoices).where(inArray(invoices.id, testInvoiceIds));
    }
    if (testTenantIds.length > 0) {
      await db.delete(tenants).where(inArray(tenants.id, testTenantIds));
    }
  });

  afterAll(async () => {
    if (db && db.$pool) {
      await db.$pool.end();
    }
  });

  it('should successfully commit both invoice and audit event inside a transaction', async () => {
    const invoiceNo = `INV-${crypto.randomUUID().substring(0, 8)}`;
    
    const { invoice } = await db.transaction(async (tx: any) => {
      const inv = await invoiceRepo.create({
        tenantId,
        invoiceNo,
        clientName: 'Atomicity Co',
        invoiceAmount: '150.00',
        dueDate: '2026-06-30',
        contactEmail: 'atom@example.com',
        paymentStatus: 'Pending',
      }, tx);

      const ev = await eventService.emitEvent('invoice', inv.id, tenantId, 'invoice.created', { source: 'system' }, {
        description: 'Invoice created inside transaction',
        tx,
      });

      return { invoice: inv, event: ev };
    });

    testInvoiceIds.push(invoice.id);

    // Verify both exist
    const dbInvoice = await invoiceRepo.findById(invoice.id);
    expect(dbInvoice).toBeDefined();
    expect(dbInvoice?.invoiceNo).toBe(invoiceNo);

    const dbEvents = await eventRepo.findByInvoiceId(invoice.id);
    expect(dbEvents.length).toBe(1);
    expect(dbEvents[0].description).toBe('Invoice created inside transaction');
    testEventIds.push(dbEvents[0].id);
  });

  it('should roll back invoice creation completely if event emission throws inside transaction', async () => {
    const invoiceNo = `INV-${crypto.randomUUID().substring(0, 8)}`;
    
    // We expect the transaction to throw and roll back
    await expect(
      db.transaction(async (tx: any) => {
        const inv = await invoiceRepo.create({
          tenantId,
          invoiceNo,
          clientName: 'Atomicity Rollback Co',
          invoiceAmount: '200.00',
          dueDate: '2026-06-30',
          contactEmail: 'rollback@example.com',
          paymentStatus: 'Pending',
        }, tx);

        // Force a throw by using invalid action type
        await eventService.emitEvent('invoice', inv.id, tenantId, 'invalid.action.type' as any, { source: 'system' }, {
          tx,
        });
      })
    ).rejects.toThrow();

    // Verify invoice was rolled back and DOES NOT exist in DB
    const dbInvoice = await db.select().from(invoices).where(eq(invoices.invoiceNo, invoiceNo));
    expect(dbInvoice.length).toBe(0);
  });

  it('should log error but not propagate throw during best-effort background events (log-and-continue)', async () => {
    // Mock eventService.emitEvent to throw
    const originalEmitEvent = eventService.emitEvent;
    eventService.emitEvent = vi.fn().mockRejectedValue(new Error('Background DB Connection Failed'));

    const loggerErrorSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});

    // Create communication service mock dependencies
    const mockCommRepo: any = {
      create: vi.fn().mockResolvedValue({}),
      getSettings: vi.fn().mockResolvedValue({ defaultEmailProvider: 'smtp', senderEmail: 'sender@example.com' }),
    };
    const mockCommService: any = {
      validateRecipientEmail: vi.fn().mockResolvedValue({}),
      send: vi.fn().mockResolvedValue({ success: true, messageId: 'msg-1' }),
    };
    const mockAimlService: any = { triggerFollowup: vi.fn().mockResolvedValue({ emailGenerated: true, subject: 'Followup', htmlBody: 'Hey' }) };
    const mockPaymentService: any = { getOrGeneratePaymentLink: vi.fn().mockResolvedValue('link') };
    const mockIdempotencyService: any = { checkInvoice: vi.fn().mockResolvedValue({ skipped: false }) };
    const mockDlqService: any = {
      clearFailure: vi.fn().mockResolvedValue({}),
      recordFailure: vi.fn().mockResolvedValue({}),
    };

    const mockPortalService: any = {
      getOrCreatePortalLink: vi.fn().mockResolvedValue('mock-token'),
      ensurePortalLinkExists: vi.fn().mockResolvedValue(undefined),
    };

    const agentService = new AgentService(
      {} as any,
      mockAimlService,
      invoiceRepo,
      { computeDaysOverdue: () => 5, assignTier: () => 'stage_1_warm' } as any,
      eventService,
      mockDlqService,
      mockIdempotencyService,
      mockPaymentService,
      mockCommService,
      mockCommRepo,
      mockPortalService
    );

    // Insert an invoice first
    const [invoice] = await db.insert(invoices).values({
      tenantId,
      invoiceNo: 'INV-ATOM-001',
      clientName: 'Background test',
      invoiceAmount: '100.00',
      dueDate: '2026-06-30',
      contactEmail: 'bg@example.com',
      paymentStatus: 'Pending',
    }).returning();
    testInvoiceIds.push(invoice.id);

    // Call triggerSingleInvoice with a mock ActorContext (so it calls emitEvent which throws)
    // The call should succeed despite eventService throwing!
    await expect(
      agentService.triggerSingleInvoice(invoice.id, tenantId, undefined, {
        source: 'ui',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'User',
        email: 'user@example.com',
        role: 'admin',
      })
    ).resolves.toBeDefined();

    expect(mockPortalService.getOrCreatePortalLink).toHaveBeenCalledWith(tenantId, invoice.id);

    // Verify logger.error was called for the failed event log
    expect(loggerErrorSpy).toHaveBeenCalled();

    // Restore original method and logger mock
    eventService.emitEvent = originalEmitEvent;
    loggerErrorSpy.mockRestore();
  });
});
