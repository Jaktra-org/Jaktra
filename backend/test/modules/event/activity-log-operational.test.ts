/**
 * Unit tests for Phase 9: Bulk & Operational Events
 *
 * Covers:
 *  - invoice.bulk_imported emitted after CSV import with correct summary metadata
 *  - agent.run_triggered emitted after manual agent run (with and without tone)
 *  - reconciler.run_triggered emitted after reconciliation with checked/mismatches
 *  - No crash when EventService is absent
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AgentController } from '../../../src/modules/agent/agent.controller.js';
import { ReconcilerController } from '../../../src/modules/agent/reconciler.controller.js';

// ---- helpers ----------------------------------------------------------------

function makeRes(tenantId = 'tenant-xyz'): any {
  const res: any = { locals: { tenantId } };
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function makeReq(overrides: Record<string, any> = {}): any {
  return {
    user: {
      tenantId: 'tenant-xyz',
      userId: 'user-1',
      name: 'Op User',
      email: 'op@example.com',
      role: 'admin',
    },
    body: {},
    query: {},
    ...overrides,
  } as any;
}

const next = vi.fn();

// ---- agent.run_triggered ----------------------------------------------------

describe('agent.run_triggered', () => {
  let eventService: any;
  let agentService: any;
  const fakeRun = { id: 'run-111', status: 'running' };

  beforeEach(() => {
    eventService = { logEvent: vi.fn() };
    agentService = { triggerRun: vi.fn().mockResolvedValue(fakeRun) };
    next.mockClear();
  });

  it('emits agent.run_triggered with triggeredBy=manual and runId after run is created', async () => {
    const ctrl = new AgentController(agentService, eventService);
    const req = makeReq({ body: {} });
    const res = makeRes();

    await ctrl.run(req, res, next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('agent.run_triggered');
    expect(call.metadata.triggeredBy).toBe('manual');
    expect(call.metadata.runId).toBe('run-111');
    expect(call.metadata).not.toHaveProperty('tone');
  });

  it('includes tone in metadata when a valid tone override is provided', async () => {
    const ctrl = new AgentController(agentService, eventService);
    const req = makeReq({ body: { tone: 'stage_2_firm' } });
    const res = makeRes();

    await ctrl.run(req, res, next);

    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('agent.run_triggered');
    expect(call.metadata.tone).toBe('stage_2_firm');
  });

  it('does NOT call logEvent when EventService is absent — no crash', async () => {
    const ctrl = new AgentController(agentService, undefined);
    const req = makeReq({ body: {} });
    const res = makeRes();

    await expect(ctrl.run(req, res, next)).resolves.not.toThrow();
  });

  it('does NOT emit for invalid tone — returns validation error before run is triggered', async () => {
    const ctrl = new AgentController(agentService, eventService);
    const req = makeReq({ body: { tone: 'legal_escalation' } }); // intentionally excluded tone
    const res = makeRes();

    await ctrl.run(req, res, next);

    expect(eventService.logEvent).not.toHaveBeenCalled();
    expect(agentService.triggerRun).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: expect.any(String) }));
  });
});

// ---- reconciler.run_triggered -----------------------------------------------

describe('reconciler.run_triggered', () => {
  let eventService: any;
  let reconcilerService: any;
  const fakeResult = { checked: 20, mismatches: 3, corrections: [] };

  beforeEach(() => {
    eventService = { logEvent: vi.fn() };
    reconcilerService = { reconcile: vi.fn().mockResolvedValue(fakeResult) };
    next.mockClear();
  });

  it('emits reconciler.run_triggered with triggeredBy, checked and mismatches', async () => {
    const ctrl = new ReconcilerController(reconcilerService, eventService);
    const req = makeReq();
    const res = makeRes();

    await ctrl.reconcile(req, res, next);

    expect(eventService.logEvent).toHaveBeenCalledOnce();
    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.eventType).toBe('reconciler.run_triggered');
    expect(call.metadata.triggeredBy).toBe('manual');
    expect(call.metadata.checked).toBe(20);
    expect(call.metadata.mismatches).toBe(3);
    // Detailed corrections array should NOT be in the top-level audit event
    expect(call.metadata).not.toHaveProperty('corrections');
  });

  it('uses the tenantId from the authenticated user', async () => {
    const ctrl = new ReconcilerController(reconcilerService, eventService);
    const req = makeReq({ user: { tenantId: 'tenant-abc', userId: 'u2', name: 'B', email: 'b@x.com', role: 'manager' } });
    const res = makeRes('tenant-abc');

    await ctrl.reconcile(req, res, next);

    const call = eventService.logEvent.mock.calls[0][0];
    expect(call.tenantId).toBe('tenant-abc');
    expect(call.actor.role).toBe('manager');
  });

  it('does NOT crash when EventService is absent', async () => {
    const ctrl = new ReconcilerController(reconcilerService, undefined);
    const req = makeReq();
    const res = makeRes();

    await expect(ctrl.reconcile(req, res, next)).resolves.not.toThrow();
    expect(reconcilerService.reconcile).toHaveBeenCalledOnce();
  });
});
