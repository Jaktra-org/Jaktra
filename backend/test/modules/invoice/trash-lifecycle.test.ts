import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { createDatabaseClient } from '../../../src/db/index.js';
import { config } from '../../../src/config/env.js';
import { eq, inArray } from 'drizzle-orm';
import { tenants, invoices, tenantSettings } from '../../../src/db/schema.js';
import { InvoiceRepository } from '../../../src/modules/invoice/invoice.repository.js';
import { SettingsRepository } from '../../../src/modules/settings/settings.repository.js';
import { EventRepository } from '../../../src/modules/event/event.repository.js';
import { EventService } from '../../../src/modules/event/event.service.js';
import { InvoicePurgeService } from '../../../src/modules/invoice/invoice-purge.service.js';
import crypto from 'crypto';

describe('Invoice Trash & Auto-Purge Lifecycle', () => {
  let db: any;
  let invoiceRepo: InvoiceRepository;
  let settingsRepo: SettingsRepository;
  let eventRepo: EventRepository;
  let eventService: EventService;
  let purgeService: InvoicePurgeService;

  let tenantId: string;
  let testInvoiceIds: string[] = [];
  let testTenantIds: string[] = [];

  beforeAll(async () => {
    db = createDatabaseClient({ connectionString: config.DATABASE_URL });
    invoiceRepo = new InvoiceRepository(db);
    settingsRepo = new SettingsRepository(db);
    eventRepo = new EventRepository(db);
    eventService = new EventService(eventRepo, invoiceRepo);
    purgeService = new InvoicePurgeService(invoiceRepo, settingsRepo, eventService);
  });

  beforeEach(async () => {
    testInvoiceIds = [];
    testTenantIds = [];

    const uniqueSuffix = crypto.randomUUID().substring(0, 8);
    const [t] = await db.insert(tenants).values({ name: 'Trash Test Tenant', slug: `ttt-${uniqueSuffix}` }).returning();
    tenantId = t.id;
    testTenantIds.push(tenantId);

    // Initialize tenant settings
    await db.insert(tenantSettings).values({
      tenantId,
      companyName: 'Trash Test Corp',
      senderName: 'Billing Team',
      senderEmail: 'billing@example.com',
      autoPurgeEnabled: true,
      autoPurgeDays: 14,
    });
  });

  afterEach(async () => {
    if (testInvoiceIds.length > 0) {
      await db.delete(invoices).where(inArray(invoices.id, testInvoiceIds));
    }
    if (testTenantIds.length > 0) {
      await db.delete(tenantSettings).where(inArray(tenantSettings.tenantId, testTenantIds));
      await db.delete(tenants).where(inArray(tenants.id, testTenantIds));
    }
  });

  it('should move an invoice to Trash and verify findTrashed lists it', async () => {
    const invoiceNo = `INV-${crypto.randomUUID().substring(0, 8)}`;
    const [inv] = await db.insert(invoices).values({
      tenantId,
      invoiceNo,
      clientName: 'Client Alpha',
      invoiceAmount: '1500.00',
      dueDate: '2026-08-31',
      contactEmail: 'client@example.com',
    }).returning();
    testInvoiceIds.push(inv.id);

    // Soft delete (move to trash)
    await invoiceRepo.softDelete(inv.id, tenantId);

    // Fetch active
    const activeResult = await invoiceRepo.findById(inv.id);
    expect(activeResult).toBeUndefined();

    // Fetch trashed
    const trashedResult = await invoiceRepo.findByIdIncludingTrashed(inv.id);
    expect(trashedResult).not.toBeNull();
    expect(trashedResult?.deletedAt).not.toBeNull();

    // List trashed
    const trashedList = await invoiceRepo.findTrashed({
      tenantId,
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(trashedList.data.some(i => i.id === inv.id)).toBe(true);
  });

  it('should restore an invoice from Trash', async () => {
    const invoiceNo = `INV-${crypto.randomUUID().substring(0, 8)}`;
    const [inv] = await db.insert(invoices).values({
      tenantId,
      invoiceNo,
      clientName: 'Client Beta',
      invoiceAmount: '2000.00',
      dueDate: '2026-08-31',
      contactEmail: 'client@example.com',
      deletedAt: new Date(),
    }).returning();
    testInvoiceIds.push(inv.id);

    // Restore
    await invoiceRepo.restore(inv.id, tenantId);

    const activeResult = await invoiceRepo.findById(inv.id);
    expect(activeResult).not.toBeNull();
    expect(activeResult?.deletedAt).toBeNull();
  });

  it('should permanently delete an invoice in two stages: Trash -> Hard Delete', async () => {
    const invoiceNo = `INV-${crypto.randomUUID().substring(0, 8)}`;
    const [inv] = await db.insert(invoices).values({
      tenantId,
      invoiceNo,
      clientName: 'Client Gamma',
      invoiceAmount: '3000.00',
      dueDate: '2026-08-31',
      contactEmail: 'client@example.com',
      deletedAt: new Date(),
    }).returning();
    testInvoiceIds.push(inv.id);

    // Hard delete
    await invoiceRepo.hardDelete(inv.id, tenantId);

    // Verify row actually removed from DB
    const result = await db.select().from(invoices).where(eq(invoices.id, inv.id)).limit(1);
    expect(result.length).toBe(0);
  });

  it('should automatically purge expired trashed invoices matching retention period, but leave non-expired ones', async () => {
    const suffix = crypto.randomUUID().substring(0, 8);
    
    // 1. Non-expired trashed invoice (deleted 3 days ago, retention is 14 days)
    const [nonExpired] = await db.insert(invoices).values({
      tenantId,
      invoiceNo: `INV-NEW-${suffix}`,
      clientName: 'Client Delta',
      invoiceAmount: '1000.00',
      dueDate: '2026-08-31',
      contactEmail: 'client@example.com',
      deletedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    }).returning();
    testInvoiceIds.push(nonExpired.id);

    // 2. Expired trashed invoice (deleted 15 days ago, retention is 14 days)
    const [expired] = await db.insert(invoices).values({
      tenantId,
      invoiceNo: `INV-OLD-${suffix}`,
      clientName: 'Client Epsilon',
      invoiceAmount: '2000.00',
      dueDate: '2026-08-31',
      contactEmail: 'client@example.com',
      deletedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    }).returning();
    // Do not add expired.id to testInvoiceIds to avoid trying to delete it in cleanup if it's already purged!

    // Run background purge
    await purgeService.runPurge();

    // Verify expired invoice was hard-deleted
    const expiredCheck = await db.select().from(invoices).where(eq(invoices.id, expired.id)).limit(1);
    expect(expiredCheck.length).toBe(0);

    // Verify non-expired invoice is STILL in trash
    const nonExpiredCheck = await db.select().from(invoices).where(eq(invoices.id, nonExpired.id)).limit(1);
    expect(nonExpiredCheck.length).toBe(1);
    expect(nonExpiredCheck[0].deletedAt).not.toBeNull();
  });

  it('should respect minimum floor of 7 days and skip purges if settings are misconfigured below 7', async () => {
    const suffix = crypto.randomUUID().substring(0, 8);

    // Set autoPurgeDays to 3 (which is below floor limit of 7)
    await db.update(tenantSettings).set({ autoPurgeDays: 3 }).where(eq(tenantSettings.tenantId, tenantId));

    // Expired trashed invoice (deleted 5 days ago, settings say 3, but floor is 7)
    const [inv] = await db.insert(invoices).values({
      tenantId,
      invoiceNo: `INV-FLOOR-${suffix}`,
      clientName: 'Client Zeta',
      invoiceAmount: '500.00',
      dueDate: '2026-08-31',
      contactEmail: 'client@example.com',
      deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    }).returning();
    testInvoiceIds.push(inv.id);

    // Run purge
    await purgeService.runPurge();

    // Verify invoice was NOT purged because the tenant was skipped due to floor check!
    const check = await db.select().from(invoices).where(eq(invoices.id, inv.id)).limit(1);
    expect(check.length).toBe(1);
  });
});
