import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import { createDatabaseClient, invoices, tenants, tenantSettings, invoicePortalLinks, users, paymentPlanRequests, inboundEmails, events } from '../../../src/db/index.js';
import { config } from '../../../src/config/env.js';
import { createApp } from '../../../src/app.js';
import crypto from 'crypto';
import { eq, inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { TriageService } from '../../../src/modules/agent/triage.service.js';

describe('Portal Token Security & Isolation Tests', () => {
  let db: any;
  let app: any;
  let tenantAId: string;
  let tenantBId: string;
  let invoiceAId: string;
  let invoiceBId: string;
  let invoiceA2Id: string;
  let testTenantIds: string[] = [];
  let testInvoiceIds: string[] = [];
  let testLinkIds: string[] = [];
  let testPlanIds: string[] = [];
  let testUserIds: string[] = [];
  let testDisputeIds: string[] = [];

  beforeAll(async () => {
    db = createDatabaseClient({ connectionString: config.DATABASE_URL });
    app = await createApp({
      corsOrigins: config.CORS_ORIGINS,
      db,
      jwtSecret: config.JWT_SECRET,
      jwtExpiresIn: config.JWT_EXPIRES_IN,
      aimlServiceUrl: config.AI_ML_SERVICE_URL || 'http://localhost:8000',
    });
  });

  afterAll(async () => {
    // Cleanup database records
    if (testDisputeIds.length > 0) {
      await db.delete(inboundEmails).where(inArray(inboundEmails.id, testDisputeIds));
    }
    if (testPlanIds.length > 0) {
      await db.delete(paymentPlanRequests).where(inArray(paymentPlanRequests.id, testPlanIds));
    }
    if (testUserIds.length > 0) {
      await db.delete(users).where(inArray(users.id, testUserIds));
    }
    if (testLinkIds.length > 0) {
      await db.delete(invoicePortalLinks).where(inArray(invoicePortalLinks.id, testLinkIds));
    }
    if (testInvoiceIds.length > 0) {
      await db.delete(invoices).where(inArray(invoices.id, testInvoiceIds));
    }
    if (testTenantIds.length > 0) {
      await db.delete(tenantSettings).where(inArray(tenantSettings.tenantId, testTenantIds));
      await db.delete(tenants).where(inArray(tenants.id, testTenantIds));
    }
    if (db && db.$pool) {
      await db.$pool.end();
    }
  });

  beforeEach(async () => {
    // Generate unique ids to avoid test clashes
    const uniqueA = crypto.randomUUID().substring(0, 8);
    const uniqueB = crypto.randomUUID().substring(0, 8);

    // Create Tenant A
    tenantAId = crypto.randomUUID();
    await db.insert(tenants).values({ id: tenantAId, name: 'Tenant A', slug: `tenant-a-${uniqueA}` });
    testTenantIds.push(tenantAId);
    await db.insert(tenantSettings).values({
      id: crypto.randomUUID(),
      tenantId: tenantAId,
      companyName: 'Company A Inc',
      senderName: 'Billing A',
      senderEmail: 'billinga@example.com',
    });

    // Create Tenant B
    tenantBId = crypto.randomUUID();
    await db.insert(tenants).values({ id: tenantBId, name: 'Tenant B', slug: `tenant-b-${uniqueB}` });
    testTenantIds.push(tenantBId);
    await db.insert(tenantSettings).values({
      id: crypto.randomUUID(),
      tenantId: tenantBId,
      companyName: 'Company B Ltd',
      senderName: 'Billing B',
      senderEmail: 'billingb@example.com',
    });

    // Create Invoice A
    invoiceAId = crypto.randomUUID();
    await db.insert(invoices).values({
      id: invoiceAId,
      tenantId: tenantAId,
      invoiceNo: `INV-A-${uniqueA}`,
      clientName: 'Client A',
      invoiceAmount: '1000.00',
      currency: 'INR',
      dueDate: '2026-12-31',
      contactEmail: 'clienta@example.com',
      paymentStatus: 'Pending',
      paymentStatusChangedAt: new Date(),
    });
    testInvoiceIds.push(invoiceAId);

    // Create Invoice B
    invoiceBId = crypto.randomUUID();
    await db.insert(invoices).values({
      id: invoiceBId,
      tenantId: tenantBId,
      invoiceNo: `INV-B-${uniqueB}`,
      clientName: 'Client B',
      invoiceAmount: '2000.00',
      currency: 'INR',
      dueDate: '2026-12-31',
      contactEmail: 'clientb@example.com',
      paymentStatus: 'Pending',
      paymentStatusChangedAt: new Date(),
    });
    testInvoiceIds.push(invoiceBId);

    // Create Invoice A2 (for status/expiry tests)
    invoiceA2Id = crypto.randomUUID();
    await db.insert(invoices).values({
      id: invoiceA2Id,
      tenantId: tenantAId,
      invoiceNo: `INV-A2-${uniqueA}`,
      clientName: 'Client A2',
      invoiceAmount: '500.00',
      currency: 'INR',
      dueDate: '2026-12-31',
      contactEmail: 'clienta2@example.com',
      paymentStatus: 'Paid',
      paymentStatusChangedAt: new Date(),
    });
    testInvoiceIds.push(invoiceA2Id);
  });

  const createTestLink = async (tenantId: string, invoiceId: string, rawToken: string) => {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const linkId = crypto.randomUUID();
    const linkObj = {
      id: linkId,
      tenantId,
      invoiceId,
      tokenHash,
      viewedAt: null as Date | null,
    };
    await db.insert(invoicePortalLinks).values(linkObj);
    testLinkIds.push(linkId);
    return linkObj;
  };

  describe('GET /public/portal/:token', () => {
    it('should load invoice details successfully for a valid token', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      const res = await request(app).get(`/public/portal/${rawToken}`);
      expect(res.status).toBe(200);
      expect(res.body.invoice.invoiceNo).toBeDefined();
      expect(res.body.invoice.clientName).toBe('Client A');
      expect(res.body.tenant.companyName).toBe('Company A Inc');
    });

    it('should record viewedAt on first load but preserve it on subsequent requests', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      const link = await createTestLink(tenantAId, invoiceAId, rawToken);
      expect(link.viewedAt).toBeFalsy();

      // First request
      const res1 = await request(app).get(`/public/portal/${rawToken}`);
      expect(res1.status).toBe(200);

      // Re-fetch link to verify viewedAt is set
      const [updatedLink] = await db.select().from(invoicePortalLinks).where(eq(invoicePortalLinks.id, link.id));
      expect(updatedLink.viewedAt).not.toBeNull();

      const originalViewedTime = new Date(updatedLink.viewedAt).getTime();

      // Second request
      const res2 = await request(app).get(`/public/portal/${rawToken}`);
      expect(res2.status).toBe(200);

      const [updatedLink2] = await db.select().from(invoicePortalLinks).where(eq(invoicePortalLinks.id, link.id));
      expect(new Date(updatedLink2.viewedAt).getTime()).toBe(originalViewedTime);
    });

    it('should enforce data isolation (scoping test) — Tenant A token must not leak Tenant B data', async () => {
      const rawTokenA = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawTokenA);

      const res = await request(app).get(`/public/portal/${rawTokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.invoice.clientName).toBe('Client A');
      expect(res.body.invoice.id).toBe(invoiceAId);
      expect(res.body.invoice.id).not.toBe(invoiceBId);
      expect(res.body.tenant.name).not.toBe('Tenant B');
    });

    it('should ignore client-supplied tenant/invoice scoping parameters (tampering test)', async () => {
      const rawTokenA = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawTokenA);

      // Supply tampered tenant headers or body/query params targeting Tenant B or Invoice B
      const res = await request(app)
        .get(`/public/portal/${rawTokenA}?tenantId=${tenantBId}&invoiceId=${invoiceBId}`)
        .set('x-tenant-id', tenantBId)
        .send({ tenantId: tenantBId, invoiceId: invoiceBId });

      expect(res.status).toBe(200);
      expect(res.body.invoice.id).toBe(invoiceAId);
      expect(res.body.invoice.clientName).toBe('Client A');
    });

    it('should expire links after 7-day grace period for Paid/Written Off invoices', async () => {
      const rawTokenA = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawTokenA);

      // Mark paid with transition timestamp 8 days ago
      const eightDaysAgo = new Date();
      eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

      await db.update(invoices)
        .set({
          paymentStatus: 'Paid',
          paymentStatusChangedAt: eightDaysAgo,
        })
        .where(eq(invoices.id, invoiceAId));

      const res = await request(app).get(`/public/portal/${rawTokenA}`);
      expect(res.status).toBe(410);
      expect(res.body.error.message).toBe('This link is no longer valid or does not exist.');
    });

    it('should keep links valid indefinitely for Pending or Overdue statuses regardless of time elapsed', async () => {
      const rawTokenA = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawTokenA);

      // Set status to Overdue and transition timestamp 100 days ago
      const longAgo = new Date();
      longAgo.setDate(longAgo.getDate() - 100);

      await db.update(invoices)
        .set({
          paymentStatus: 'Overdue',
          paymentStatusChangedAt: longAgo,
        })
        .where(eq(invoices.id, invoiceAId));

      const res = await request(app).get(`/public/portal/${rawTokenA}`);
      expect(res.status).toBe(200);
      expect(res.body.invoice.paymentStatus).toBe('Overdue');
    });

    it('should block manually revoked tokens immediately', async () => {
      const rawTokenA = crypto.randomBytes(32).toString('hex');
      const link = await createTestLink(tenantAId, invoiceAId, rawTokenA);

      // Revoke the link
      await db.update(invoicePortalLinks)
        .set({ revokedAt: new Date() })
        .where(eq(invoicePortalLinks.id, link.id));

      const res = await request(app).get(`/public/portal/${rawTokenA}`);
      expect(res.status).toBe(410);
      expect(res.body.error.message).toBe('This link is no longer valid or does not exist.');
    });

    it('should present an identical error message for 404 (not found) and 410 (expired/revoked) for user privacy', async () => {
      const nonexistentToken = crypto.randomBytes(32).toString('hex');
      
      // 404 Case
      const res404 = await request(app).get(`/public/portal/${nonexistentToken}`);
      expect(res404.status).toBe(404);
      expect(res404.body.error.message).toBe('This link is no longer valid or does not exist.');

      // 410 Case (Revoked)
      const rawToken = crypto.randomBytes(32).toString('hex');
      const link = await createTestLink(tenantAId, invoiceAId, rawToken);
      await db.update(invoicePortalLinks).set({ revokedAt: new Date() }).where(eq(invoicePortalLinks.id, link.id));
      
      const res410 = await request(app).get(`/public/portal/${rawToken}`);
      expect(res410.status).toBe(410);
      expect(res410.body.error.message).toBe('This link is no longer valid or does not exist.');
    });

    it('should preserve the active portal link when sending multiple follow-up emails for the same invoice', async () => {
      const commService = app.locals.communicationService;
      expect(commService).toBeDefined();

      // Mock the tenantMailer to prevent EMAIL_PROVIDER_NOT_CONFIGURED error during integration test
      const originalSend = (commService as any).tenantMailer.sendCollectionEmail;
      (commService as any).tenantMailer.sendCollectionEmail = async () => ({ success: true });

      try {
        // Send first follow-up email
        const sendResult1 = await commService.send({
          tenantId: tenantAId,
          to: 'debtor@gmail.com',
          subject: 'First collection notice',
          html: '<p>Please pay your outstanding invoice.</p>',
          invoiceId: invoiceAId,
        });
        expect(sendResult1).toBe(true);

        // Verify a link was created in the database and has a non-empty token
        const links1 = await db.select().from(invoicePortalLinks).where(eq(invoicePortalLinks.invoiceId, invoiceAId));
        expect(links1.length).toBe(1);
        const activeLink1 = links1[0];
        expect(activeLink1.revokedAt).toBeNull();
        expect(activeLink1.tokenHash).not.toBe('');

        // Send second follow-up email for the same invoice
        const sendResult2 = await commService.send({
          tenantId: tenantAId,
          to: 'debtor@gmail.com',
          subject: 'Second collection notice',
          html: '<p>This is your second notice.</p>',
          invoiceId: invoiceAId,
        });
        expect(sendResult2).toBe(true);

        // Verify that the active link is preserved (not revoked, no new link created)
        const links2 = await db.select().from(invoicePortalLinks).where(eq(invoicePortalLinks.invoiceId, invoiceAId));
        expect(links2.length).toBe(1);
        expect(links2[0].id).toBe(activeLink1.id);
        expect(links2[0].revokedAt).toBeNull();
        expect(links2[0].tokenHash).toBe(activeLink1.tokenHash);
      } finally {
        (commService as any).tenantMailer.sendCollectionEmail = originalSend;
      }
    });
  });

  describe('POST /public/portal/:token/pay', () => {
    it('should generate a valid Razorpay payment URL for a Pending invoice', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      const paymentService = app.locals.paymentService;
      const originalGetConfig = paymentService.integrationService.getDecryptedRazorpayConfig;
      paymentService.integrationService.getDecryptedRazorpayConfig = async () => ({
        keyId: 'rzp_test_123',
        keySecret: 'secret_123',
        webhookSecret: 'whsec_123',
      });

      const originalCreatePaymentLink = paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink;
      paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = async () => ({
        providerPaymentLinkId: 'plink_' + crypto.randomUUID().substring(0, 8),
        providerOrderId: 'order_' + crypto.randomUUID().substring(0, 8),
        paymentUrl: 'https://api.razorpay.com/checkout/pay_123',
      });

      try {
        const res = await request(app).post(`/public/portal/${rawToken}/pay`);
        expect(res.status).toBe(200);
        expect(res.body.paymentUrl).toBe('https://api.razorpay.com/checkout/pay_123');
      } finally {
        paymentService.integrationService.getDecryptedRazorpayConfig = originalGetConfig;
        paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = originalCreatePaymentLink;
      }
    });

    it('should be idempotent and return the same active link when called twice in a row', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      const paymentService = app.locals.paymentService;
      const originalGetConfig = paymentService.integrationService.getDecryptedRazorpayConfig;
      paymentService.integrationService.getDecryptedRazorpayConfig = async () => ({
        keyId: 'rzp_test_123',
        keySecret: 'secret_123',
        webhookSecret: 'whsec_123',
      });

      let callCount = 0;
      const originalCreatePaymentLink = paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink;
      paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = async () => {
        callCount++;
        return {
          providerPaymentLinkId: 'plink_idempotent',
          providerOrderId: 'order_idempotent',
          paymentUrl: `https://api.razorpay.com/checkout/pay_idempotent_${callCount}`,
        };
      };

      try {
        // First payment request
        const res1 = await request(app).post(`/public/portal/${rawToken}/pay`);
        expect(res1.status).toBe(200);
        expect(res1.body.paymentUrl).toBe('https://api.razorpay.com/checkout/pay_idempotent_1');

        // Second payment request (should re-use the active link)
        const res2 = await request(app).post(`/public/portal/${rawToken}/pay`);
        expect(res2.status).toBe(200);
        expect(res2.body.paymentUrl).toBe('https://api.razorpay.com/checkout/pay_idempotent_1');
        expect(callCount).toBe(1); // Gateway create was only called once!
      } finally {
        paymentService.integrationService.getDecryptedRazorpayConfig = originalGetConfig;
        paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = originalCreatePaymentLink;
      }
    });

    it('should reject payment requests for an ALREADY-PAID invoice server-side with 400 Validation Error', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      // Set status to Paid
      await db.update(invoices)
        .set({ paymentStatus: 'Paid', paymentStatusChangedAt: new Date() })
        .where(eq(invoices.id, invoiceAId));

      const res = await request(app).post(`/public/portal/${rawToken}/pay`);
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toBe('This invoice has already been paid or settled.');
    });

    it('should enforce tenant/invoice isolation and block payment requests matching token A to invoice B', async () => {
      // Create token for Invoice A
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      const paymentService = app.locals.paymentService;
      const originalGetConfig = paymentService.integrationService.getDecryptedRazorpayConfig;
      paymentService.integrationService.getDecryptedRazorpayConfig = async () => ({
        keyId: 'rzp_test_123',
        keySecret: 'secret_123',
        webhookSecret: 'whsec_123',
      });

      let capturedAmount = 0;
      const originalCreatePaymentLink = paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink;
      paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = async (_creds: any, _invId: any, amount: number) => {
        capturedAmount = amount;
        return {
          providerPaymentLinkId: 'plink_isolated',
          providerOrderId: 'order_isolated',
          paymentUrl: 'https://api.razorpay.com/checkout/pay_isolated',
        };
      };

      try {
        const resPay = await request(app)
          .post(`/public/portal/${rawToken}/pay`)
          .set('x-tenant-id', tenantBId)
          .send({ invoiceId: invoiceBId, tenantId: tenantBId });
        
        expect(resPay.status).toBe(200);
        // Billed amount of Invoice A is 1000.00, whereas Invoice B is 2000.00
        expect(capturedAmount).toBe(1000.00);
      } finally {
        paymentService.integrationService.getDecryptedRazorpayConfig = originalGetConfig;
        paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = originalCreatePaymentLink;
      }
    });

    it('should trigger rate limiting on repeated calls', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      const paymentService = app.locals.paymentService;
      const originalGetConfig = paymentService.integrationService.getDecryptedRazorpayConfig;
      paymentService.integrationService.getDecryptedRazorpayConfig = async () => ({
        keyId: 'rzp_test_123',
        keySecret: 'secret_123',
        webhookSecret: 'whsec_123',
      });
      const originalCreatePaymentLink = paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink;
      paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = async () => ({
        providerPaymentLinkId: 'plink_ratelimit',
        providerOrderId: 'order_ratelimit',
        paymentUrl: 'https://api.razorpay.com/checkout/pay_ratelimit',
      });

      try {
        // Send 10 requests successfully (token limit is 10)
        for (let i = 0; i < 10; i++) {
          const res = await request(app).post(`/public/portal/${rawToken}/pay`);
          expect(res.status).toBe(200);
        }

        // 11th request should be rate-limited
        const resLimit = await request(app).post(`/public/portal/${rawToken}/pay`);
        expect(resLimit.status).toBe(429);
        expect(resLimit.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      } finally {
        paymentService.integrationService.getDecryptedRazorpayConfig = originalGetConfig;
        paymentService.gatewayFactory.getAdapter('razorpay').createPaymentLink = originalCreatePaymentLink;
      }
    });
  });

  describe('POST /public/portal/:token/plan (Proposal Submission)', () => {
    it('should submit a payment plan proposal successfully for a Pending invoice', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      const res = await request(app)
        .post(`/public/portal/${rawToken}/plan`)
        .send({ installments: 6, reason: 'Temporarily short on funds.' });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.installments).toBe(6);
      expect(res.body.proposedAmountPerMonth).toBe('166.67'); // 1000.00 / 6 rounded
      expect(res.body.status).toBe('pending');

      testPlanIds.push(res.body.id);
    });

    it('should reject a second plan submission while a request is already pending', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      // Submit first one
      const res1 = await request(app)
        .post(`/public/portal/${rawToken}/plan`)
        .send({ installments: 4 });
      expect(res1.status).toBe(201);
      testPlanIds.push(res1.body.id);

      // Submit second one
      const res2 = await request(app)
        .post(`/public/portal/${rawToken}/plan`)
        .send({ installments: 3 });
      expect(res2.status).toBe(400);
      expect(res2.body.error.code).toBe('VALIDATION_ERROR');
      expect(res2.body.error.message).toBe('A payment plan request is already pending for this invoice.');
    });

    it('should reject plan requests for an already Paid invoice server-side', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      // Update invoice to Paid
      await db.update(invoices)
        .set({ paymentStatus: 'Paid', paymentStatusChangedAt: new Date() })
        .where(eq(invoices.id, invoiceAId));

      const res = await request(app)
        .post(`/public/portal/${rawToken}/plan`)
        .send({ installments: 12 });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toBe('Cannot request a payment plan for a paid or written off invoice.');
    });

    it('should block plan submissions matching token A to invoice B (tenant/invoice scoping isolation)', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      // Attempt to target Invoice B / Tenant B
      const res = await request(app)
        .post(`/public/portal/${rawToken}/plan`)
        .set('x-tenant-id', tenantBId)
        .send({ installments: 5, invoiceId: invoiceBId, tenantId: tenantBId });

      // If isolation works, it successfully creates it on the scope of token A (Invoice A, Tenant A)
      expect(res.status).toBe(201);
      expect(res.body.invoiceId).toBe(invoiceAId);
      expect(res.body.tenantId).toBe(tenantAId);
      testPlanIds.push(res.body.id);
    });

    it('should trigger rate limiting on excess plan submissions (limit: 3)', async () => {
      const rawToken = crypto.randomBytes(32).toString('hex');
      await createTestLink(tenantAId, invoiceAId, rawToken);

      // Send 3 requests successfully
      for (let i = 0; i < 3; i++) {
        const res = await request(app)
          .post(`/public/portal/${rawToken}/plan`)
          .send({ installments: 6 });
        expect([201, 400]).toContain(res.status);
      }

      // 4th request should return 429
      const resLimit = await request(app)
        .post(`/public/portal/${rawToken}/plan`)
        .send({ installments: 6 });
      expect(resLimit.status).toBe(429);
      expect(resLimit.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Manager Payment Plan Review Actions', () => {
    let managerToken: string;
    let viewerToken: string;
    let managerId: string;
    let viewerId: string;

    beforeEach(async () => {
      // Create Manager User
      managerId = crypto.randomUUID();
      const mUData = {
        id: managerId,
        tenantId: tenantAId,
        name: 'Manager User',
        email: `manager-${crypto.randomUUID().substring(0, 8)}@example.com`,
        passwordHash: 'dummy_hash',
        role: 'manager' as const,
      };
      await db.insert(users).values(mUData);
      testUserIds.push(managerId);
      managerToken = jwt.sign({
        userId: managerId,
        tenantId: tenantAId,
        name: mUData.name,
        email: mUData.email,
        role: mUData.role,
      }, config.JWT_SECRET);

      // Create Viewer User
      viewerId = crypto.randomUUID();
      const vUData = {
        id: viewerId,
        tenantId: tenantAId,
        name: 'Viewer User',
        email: `viewer-${crypto.randomUUID().substring(0, 8)}@example.com`,
        passwordHash: 'dummy_hash',
        role: 'viewer' as const,
      };
      await db.insert(users).values(vUData);
      testUserIds.push(viewerId);
      viewerToken = jwt.sign({
        userId: viewerId,
        tenantId: tenantAId,
        name: vUData.name,
        email: vUData.email,
        role: vUData.role,
      }, config.JWT_SECRET);
    });

    it('should list pending payment plan requests for the tenant', async () => {
      // Create a pending request
      const planId = crypto.randomUUID();
      await db.insert(paymentPlanRequests).values({
        id: planId,
        tenantId: tenantAId,
        invoiceId: invoiceAId,
        installments: 6,
        proposedAmountPerMonth: '166.67',
        status: 'pending',
      });
      testPlanIds.push(planId);

      const res = await request(app)
        .get('/api/invoices/payment-plans/pending')
        .set('Authorization', `Bearer ${managerToken}`)
        .set('x-tenant-id', tenantAId);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      const item = res.body.data.find((d: any) => d.id === planId);
      expect(item).toBeDefined();
      expect(item.invoiceNo).toBeDefined();
    });

    it('should approve a pending plan, setting hasActivePaymentPlan=true and excluding from TriageService', async () => {
      const planId = crypto.randomUUID();
      await db.insert(paymentPlanRequests).values({
        id: planId,
        tenantId: tenantAId,
        invoiceId: invoiceAId,
        installments: 6,
        proposedAmountPerMonth: '166.67',
        status: 'pending',
      });
      testPlanIds.push(planId);

      const res = await request(app)
        .post(`/api/invoices/payment-plans/${planId}/approve`)
        .set('Authorization', `Bearer ${managerToken}`)
        .set('x-tenant-id', tenantAId);

      expect(res.status).toBe(204);

      // Verify DB
      const [updatedPlan] = await db.select().from(paymentPlanRequests).where(eq(paymentPlanRequests.id, planId));
      expect(updatedPlan.status).toBe('approved');
      expect(updatedPlan.reviewedBy).toBe(managerId);

      const [updatedInvoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceAId));
      expect(updatedInvoice.hasActivePaymentPlan).toBe(true);

      // Verify TriageService exclusion
      const triageService = new TriageService();
      const isActionable = triageService.isActionable(updatedInvoice);
      expect(isActionable).toBe(false); // Excluded!
    });

    it('should deny a plan request and NOT touch hasActivePaymentPlan', async () => {
      const planId = crypto.randomUUID();
      await db.insert(paymentPlanRequests).values({
        id: planId,
        tenantId: tenantAId,
        invoiceId: invoiceAId,
        installments: 6,
        proposedAmountPerMonth: '166.67',
        status: 'pending',
      });
      testPlanIds.push(planId);

      const res = await request(app)
        .post(`/api/invoices/payment-plans/${planId}/deny`)
        .set('Authorization', `Bearer ${managerToken}`)
        .set('x-tenant-id', tenantAId);

      expect(res.status).toBe(204);

      // Verify DB
      const [updatedPlan] = await db.select().from(paymentPlanRequests).where(eq(paymentPlanRequests.id, planId));
      expect(updatedPlan.status).toBe('denied');

      const [updatedInvoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceAId));
      expect(updatedInvoice.hasActivePaymentPlan).toBe(false);

      // Verify TriageService inclusion (mock overdue to pass triage eligibility check)
      const triageService = new TriageService();
      updatedInvoice.dueDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const isActionable = triageService.isActionable(updatedInvoice);
      expect(isActionable).toBe(true); // Still actionable!
    });

    it('should manually cancel an active approved plan, reverting hasActivePaymentPlan to false and resuming triage', async () => {
      // Create approved request
      const planId = crypto.randomUUID();
      await db.insert(paymentPlanRequests).values({
        id: planId,
        tenantId: tenantAId,
        invoiceId: invoiceAId,
        installments: 6,
        proposedAmountPerMonth: '166.67',
        status: 'approved',
      });
      testPlanIds.push(planId);

      // Make invoice active
      await db.update(invoices).set({ hasActivePaymentPlan: true }).where(eq(invoices.id, invoiceAId));

      const res = await request(app)
        .post(`/api/invoices/${invoiceAId}/cancel-payment-plan`)
        .set('Authorization', `Bearer ${managerToken}`)
        .set('x-tenant-id', tenantAId);

      expect(res.status).toBe(204);

      // Verify DB
      const [updatedPlan] = await db.select().from(paymentPlanRequests).where(eq(paymentPlanRequests.id, planId));
      expect(updatedPlan.status).toBe('cancelled');

      const [updatedInvoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceAId));
      expect(updatedInvoice.hasActivePaymentPlan).toBe(false);

      // Verify TriageService inclusion (mock overdue to pass triage eligibility check)
      const triageService = new TriageService();
      updatedInvoice.dueDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const isActionable = triageService.isActionable(updatedInvoice);
      expect(isActionable).toBe(true); // Resumed normal triage!
    });

    it('should prevent non-admin/manager roles (viewer) from executing actions', async () => {
      const planId = crypto.randomUUID();
      await db.insert(paymentPlanRequests).values({
        id: planId,
        tenantId: tenantAId,
        invoiceId: invoiceAId,
        installments: 6,
        proposedAmountPerMonth: '166.67',
        status: 'pending',
      });
      testPlanIds.push(planId);

      // Approve
      const resApprove = await request(app)
        .post(`/api/invoices/payment-plans/${planId}/approve`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .set('x-tenant-id', tenantAId);
      expect(resApprove.status).toBe(403);

      // Deny
      const resDeny = await request(app)
        .post(`/api/invoices/payment-plans/${planId}/deny`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .set('x-tenant-id', tenantAId);
      expect(resDeny.status).toBe(403);

      // Cancel
      const resCancel = await request(app)
        .post(`/api/invoices/${invoiceAId}/cancel-payment-plan`)
        .set('Authorization', `Bearer ${viewerToken}`)
        .set('x-tenant-id', tenantAId);
      expect(resCancel.status).toBe(403);
    });

    it('should automatically cancel pending plan requests when status changes to Paid (Auto-cancel trigger check)', async () => {
      const planId = crypto.randomUUID();
      await db.insert(paymentPlanRequests).values({
        id: planId,
        tenantId: tenantAId,
        invoiceId: invoiceAId,
        installments: 6,
        proposedAmountPerMonth: '166.67',
        status: 'pending',
      });
      testPlanIds.push(planId);

      // Trigger status change via repository
      const invoiceRepo = app.locals.paymentService.invoiceRepo;
      await invoiceRepo.updatePaymentStatus(invoiceAId, 'Paid');

      // Verify request is cancelled
      const [updatedPlan] = await db.select().from(paymentPlanRequests).where(eq(paymentPlanRequests.id, planId));
      expect(updatedPlan.status).toBe('cancelled');
    });

    describe('POST /public/portal/:token/dispute (Dispute Submission)', () => {
      it('should submit a dispute proposal successfully for a Pending invoice', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, rawToken);

        const res = await request(app)
          .post(`/public/portal/${rawToken}/dispute`)
          .send({ body: 'Wrong billing amount' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('Dispute submitted successfully.');

        // Verify DB dispute record
        const disputes = await db.select().from(inboundEmails).where(eq(inboundEmails.invoiceId, invoiceAId));
        expect(disputes.length).toBe(1);
        expect(disputes[0].sender).toBe('clienta@example.com');
        expect(disputes[0].body).toBe('Wrong billing amount');
        expect(disputes[0].source).toBe('portal');
        testDisputeIds.push(disputes[0].id);

        // Verify DB audit event
        const auditEvents = await db.select().from(events).where(eq(events.entityId, invoiceAId));
        const disputeEvent = auditEvents.find((e: any) => e.actionType === 'dispute.received');
        expect(disputeEvent).toBeDefined();
        expect(disputeEvent.source).toBe('portal');
        expect(disputeEvent.actorName).toBe('Customer Portal');
      });

      it('should allow multiple dispute submissions (no duplicate blocking)', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, rawToken);

        const res1 = await request(app)
          .post(`/public/portal/${rawToken}/dispute`)
          .send({ body: 'First dispute text' });
        expect(res1.status).toBe(201);

        const res2 = await request(app)
          .post(`/public/portal/${rawToken}/dispute`)
          .send({ body: 'Second dispute text' });
        expect(res2.status).toBe(201);

        const disputes = await db.select().from(inboundEmails).where(eq(inboundEmails.invoiceId, invoiceAId));
        const first = disputes.find((d: any) => d.body === 'First dispute text');
        const second = disputes.find((d: any) => d.body === 'Second dispute text');
        expect(first).toBeDefined();
        expect(second).toBeDefined();
        if (first) testDisputeIds.push(first.id);
        if (second) testDisputeIds.push(second.id);
      });

      it('should reject dispute submissions for an already Paid invoice server-side', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, rawToken);

        // Mark Paid
        await db.update(invoices).set({ paymentStatus: 'Paid' }).where(eq(invoices.id, invoiceAId));

        const res = await request(app)
          .post(`/public/portal/${rawToken}/dispute`)
          .send({ body: 'Paid invoice dispute' });

        expect(res.status).toBe(400);
        expect(res.body.error.message).toBe('Cannot submit a dispute for a paid or written off invoice.');
      });

      it('should block dispute submissions matching token A to invoice B (isolation check)', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, rawToken);

        const res = await request(app)
          .post(`/public/portal/${rawToken}/dispute`)
          .send({ body: 'Isolation check text', invoiceId: invoiceBId, tenantId: tenantBId });

        expect(res.status).toBe(201);
        const disputesA = await db.select().from(inboundEmails).where(eq(inboundEmails.invoiceId, invoiceAId));
        expect(disputesA.length).toBe(1);
        testDisputeIds.push(disputesA[0].id);

        const disputesB = await db.select().from(inboundEmails).where(eq(inboundEmails.invoiceId, invoiceBId));
        expect(disputesB.length).toBe(0);
      });

      it('should block portal disputes if admin kill-switch is active', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, rawToken);

        // Set admin kill switch
        await db.update(tenantSettings).set({ inboundBlockedByAdmin: true }).where(eq(tenantSettings.tenantId, tenantAId));

        const res = await request(app)
          .post(`/public/portal/${rawToken}/dispute`)
          .send({ body: 'Kill switch check' });

        expect(res.status).toBe(403);
        expect(res.body.error.message).toBe('Dispute submissions are temporarily disabled.');
      });

      it('should trigger rate limiting on excess dispute submissions (limit: 3)', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, rawToken);

        // Send 3 requests successfully
        for (let i = 0; i < 3; i++) {
          const res = await request(app)
            .post(`/public/portal/${rawToken}/dispute`)
            .send({ body: `Dispute rate limit loop ${i}` });
          expect(res.status).toBe(201);

          const disputes = await db.select().from(inboundEmails).where(eq(inboundEmails.invoiceId, invoiceAId));
          const added = disputes.find((d: any) => d.body === `Dispute rate limit loop ${i}`);
          if (added) testDisputeIds.push(added.id);
        }

        // 4th request should return 429
        const resLimit = await request(app)
          .post(`/public/portal/${rawToken}/dispute`)
          .send({ body: 'Too many requests' });
        expect(resLimit.status).toBe(429);
        expect(resLimit.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
      });
    });
  });

  describe('Debtor Portal Link Management Endpoints (GET/POST)', () => {
    let managerToken: string;
    let viewerToken: string;
    let managerId: string;
    let viewerId: string;

    beforeEach(async () => {
      // Create Manager User
      managerId = crypto.randomUUID();
      const mUData = {
        id: managerId,
        tenantId: tenantAId,
        name: 'Manager User',
        email: `manager-${crypto.randomUUID().substring(0, 8)}@example.com`,
        passwordHash: 'dummy_hash',
        role: 'manager' as const,
      };
      await db.insert(users).values(mUData);
      testUserIds.push(managerId);
      managerToken = jwt.sign({
        userId: managerId,
        tenantId: tenantAId,
        name: mUData.name,
        email: mUData.email,
        role: mUData.role,
      }, config.JWT_SECRET);

      // Create Viewer User
      viewerId = crypto.randomUUID();
      const vUData = {
        id: viewerId,
        tenantId: tenantAId,
        name: 'Viewer User',
        email: `viewer-${crypto.randomUUID().substring(0, 8)}@example.com`,
        passwordHash: 'dummy_hash',
        role: 'viewer' as const,
      };
      await db.insert(users).values(vUData);
      testUserIds.push(viewerId);
      viewerToken = jwt.sign({
        userId: viewerId,
        tenantId: tenantAId,
        name: vUData.name,
        email: vUData.email,
        role: vUData.role,
      }, config.JWT_SECRET);
    });

    describe('GET /api/invoices/:id/portal-link', () => {
      it('returns { exists: false } if no link has been generated yet', async () => {
        const res = await request(app)
          .get(`/api/invoices/${invoiceAId}/portal-link`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ exists: false });
      });

      it('returns correct status details for an active unviewed link', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, rawToken);

        const res = await request(app)
          .get(`/api/invoices/${invoiceAId}/portal-link`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(true);
        expect(res.body.viewedAt).toBeNull();
        expect(res.body.revokedAt).toBeNull();
        expect(res.body.createdAt).toBeDefined();
      });

      it('returns correct status details for a viewed link', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const link = await createTestLink(tenantAId, invoiceAId, rawToken);

        // Record viewed
        await db.update(invoicePortalLinks)
          .set({ viewedAt: new Date() })
          .where(eq(invoicePortalLinks.id, link.id));

        const res = await request(app)
          .get(`/api/invoices/${invoiceAId}/portal-link`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(true);
        expect(res.body.viewedAt).not.toBeNull();
        expect(res.body.revokedAt).toBeNull();
      });

      it('returns correct status details for a revoked link', async () => {
        const rawToken = crypto.randomBytes(32).toString('hex');
        const link = await createTestLink(tenantAId, invoiceAId, rawToken);

        // Record revoked
        await db.update(invoicePortalLinks)
          .set({ revokedAt: new Date() })
          .where(eq(invoicePortalLinks.id, link.id));

        const res = await request(app)
          .get(`/api/invoices/${invoiceAId}/portal-link`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.exists).toBe(true);
        expect(res.body.revokedAt).not.toBeNull();
      });

      it('enforces tenant isolation and blocks cross-tenant access', async () => {
        const res = await request(app)
          .get(`/api/invoices/${invoiceBId}/portal-link`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(404);
        expect(res.body.error.message).toBe('Invoice not found');
      });

      it('blocks non-admin/manager roles (viewer)', async () => {
        const res = await request(app)
          .get(`/api/invoices/${invoiceAId}/portal-link`)
          .set('Authorization', `Bearer ${viewerToken}`);

        expect(res.status).toBe(403);
      });
    });

    describe('POST /api/invoices/:id/portal-link/regenerate', () => {
      it('revokes the old link and creates a new one successfully', async () => {
        const oldRawToken = crypto.randomBytes(32).toString('hex');
        await createTestLink(tenantAId, invoiceAId, oldRawToken);

        // Trigger regeneration
        const resRegen = await request(app)
          .post(`/api/invoices/${invoiceAId}/portal-link/regenerate`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(resRegen.status).toBe(200);
        expect(resRegen.body.token).toBeDefined();
        expect(resRegen.body.url).toContain(resRegen.body.token);

        // Old link must return 410 (Gone) now
        const resOld = await request(app)
          .get(`/public/portal/${oldRawToken}`);
        expect(resOld.status).toBe(410);

        // New link must return 200 (OK)
        const resNew = await request(app)
          .get(`/public/portal/${resRegen.body.token}`);
        expect(resNew.status).toBe(200);
      });

      it('enforces tenant isolation and blocks cross-tenant regeneration', async () => {
        const res = await request(app)
          .post(`/api/invoices/${invoiceBId}/portal-link/regenerate`)
          .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(404);
        expect(res.body.error.message).toBe('Invoice not found');
      });

      it('blocks non-admin/manager roles (viewer) from regenerating', async () => {
        const res = await request(app)
          .post(`/api/invoices/${invoiceAId}/portal-link/regenerate`)
          .set('Authorization', `Bearer ${viewerToken}`);

        expect(res.status).toBe(403);
      });
    });
  });
});
