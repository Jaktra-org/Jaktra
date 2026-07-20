/**
 * Unit tests for Phase 7 & 8: Integration Events
 *
 * Covers:
 *  - integration.connected fires for sendgrid / smtp / razorpay (with correct metadata)
 *  - integration.disconnected fires for sendgrid / smtp / razorpay
 *  - integration.default_provider_changed fires with from/to values
 *  - Razorpay secrets (keySecret, webhookSecret) are NOT logged — only keyIdPrefix
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntegrationController } from '../../../src/modules/settings/integration.controller.js';

// ---- minimal stub factories ------------------------------------------------

function makeReq(overrides: Record<string, any> = {}): any {
  return {
    user: {
      tenantId: 'tenant-abc',
      userId: 'user-1',
      name: 'Alice Admin',
      email: 'alice@example.com',
      role: 'admin',
    },
    body: {},
    ...overrides,
  } as any;
}

function makeRes(): any {
  const res: any = {};
  res.json = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  res.set = vi.fn().mockReturnValue(res);
  return res;
}

const next = vi.fn();

// ---- service stubs ----------------------------------------------------------

function makeIntegrationService(): any {
  return {
    validateAndSaveSendgridKey: vi.fn().mockResolvedValue(undefined),
    deleteSendgridIntegration: vi.fn().mockResolvedValue(undefined),
    getIntegrationStatus: vi.fn().mockResolvedValue({ isConfigured: false, lastValidationResult: null }),
    getIntegrationStatusRazorpay: vi.fn().mockResolvedValue({ isConfigured: false }),
    validateAndSaveSmtpConfig: vi.fn().mockResolvedValue(undefined),
    deleteSmtpIntegration: vi.fn().mockResolvedValue(undefined),
    validateAndSaveRazorpayKey: vi.fn().mockResolvedValue(undefined),
    deleteRazorpayIntegration: vi.fn().mockResolvedValue(undefined),
  } as any;
}

function makeCommunicationService(defaultProvider: string | null = null): any {
  return {
    getSettings: vi.fn().mockResolvedValue({ defaultEmailProvider: defaultProvider }),
    setDefaultEmailProvider: vi.fn().mockResolvedValue(undefined),
  } as any;
}

// ---- tests ------------------------------------------------------------------

describe('Integration audit events', () => {
  let eventService: any;

  beforeEach(() => {
    eventService = { logEvent: vi.fn() };
    next.mockClear();
  });

  // Phase 7: connect
  it('emits integration.connected with integration=sendgrid on saveSendgridKey', async () => {
    const ctrl = new IntegrationController(
      makeIntegrationService(),
      makeCommunicationService(),
      eventService,
    );
    const req = makeReq({ body: { apiKey: 'SG.validkey1234' } });
    await ctrl.saveSendgridKey(req, makeRes(), next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('integration.connected');
    expect(call.metadata.integration).toBe('sendgrid');
    expect(call.metadata).not.toHaveProperty('apiKey');
  });

  it('emits integration.connected with integration=smtp on saveSmtpConfig', async () => {
    const ctrl = new IntegrationController(
      makeIntegrationService(),
      makeCommunicationService(),
      eventService,
    );
    const req = makeReq({ body: { host: 'smtp.example.com', port: 587, user: 'u', pass: 'p' } });
    await ctrl.saveSmtpConfig(req, makeRes(), next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('integration.connected');
    expect(call.metadata.integration).toBe('smtp');
    expect(call.metadata.host).toBe('smtp.example.com');
    // password must never appear in metadata
    expect(JSON.stringify(call.metadata)).not.toContain('pass');
  });

  it('emits integration.connected with keyIdPrefix only for razorpay — no secrets', async () => {
    const ctrl = new IntegrationController(
      makeIntegrationService(),
      makeCommunicationService(),
      eventService,
    );
    const req = makeReq({
      body: { keyId: 'rzp_live_ABCDEFGH12', keySecret: 'supersecret', webhookSecret: 'whsecret' },
    });
    await ctrl.saveRazorpayKey(req, makeRes(), next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('integration.connected');
    expect(call.metadata.integration).toBe('razorpay');
    expect(call.metadata.keyIdPrefix).toBe('rzp_live_A'); // slice(0,10) = 10 chars
    // secrets must never appear
    expect(JSON.stringify(call.metadata)).not.toContain('supersecret');
    expect(JSON.stringify(call.metadata)).not.toContain('whsecret');
  });

  // Phase 7: disconnect
  it('emits integration.disconnected with integration=sendgrid on disconnectSendgrid', async () => {
    const ctrl = new IntegrationController(
      makeIntegrationService(),
      makeCommunicationService('sendgrid'),
      eventService,
    );
    await ctrl.disconnectSendgrid(makeReq(), makeRes(), next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('integration.disconnected');
    expect(call.metadata.integration).toBe('sendgrid');
  });

  it('emits integration.disconnected with integration=smtp on disconnectSmtp', async () => {
    const ctrl = new IntegrationController(
      makeIntegrationService(),
      makeCommunicationService('smtp'),
      eventService,
    );
    await ctrl.disconnectSmtp(makeReq(), makeRes(), next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('integration.disconnected');
    expect(call.metadata.integration).toBe('smtp');
  });

  it('emits integration.disconnected with integration=razorpay on disconnectRazorpay', async () => {
    const ctrl = new IntegrationController(
      makeIntegrationService(),
      makeCommunicationService(),
      eventService,
    );
    await ctrl.disconnectRazorpay(makeReq(), makeRes(), next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('integration.disconnected');
    expect(call.metadata.integration).toBe('razorpay');
  });

  // Phase 8: default provider
  it('emits integration.default_provider_changed with from/to on setDefaultProvider', async () => {
    const integSvc = makeIntegrationService();
    // Make sendgrid appear valid so validation passes
    integSvc.getIntegrationStatus.mockResolvedValue({ isConfigured: true, lastValidationResult: 'valid' });

    const ctrl = new IntegrationController(
      integSvc,
      makeCommunicationService('smtp'),   // current default is smtp
      eventService,
    );
    const req = makeReq({ body: { provider: 'sendgrid' } });
    await ctrl.setDefaultProvider(req, makeRes(), next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('integration.default_provider_changed');
    expect(call.metadata.from).toBe('smtp');
    expect(call.metadata.to).toBe('sendgrid');
  });

  it('does NOT emit events when EventService is absent', async () => {
    const ctrl = new IntegrationController(
      makeIntegrationService(),
      makeCommunicationService(),
      // no eventService
    );
    // Should not throw even though eventService is undefined
    await expect(ctrl.disconnectRazorpay(makeReq(), makeRes(), next)).resolves.not.toThrow();
  });
});
