import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { TenantController } from '../../../src/modules/tenant/tenant.controller.js';
import type { TenantService } from '../../../src/modules/tenant/tenant.service.js';
import { ValidationError } from '../../../src/shared/errors/index.js';


// ── Helpers ──────────────────────────────────────────────────────────
function mockRes(): Response {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis() as any,
    json: vi.fn().mockReturnThis() as any,
  };
  return res as Response;
}

function authReq(
  params: Record<string, string>,
  user: { userId: string; tenantId: string; name: string; email: string; role: string },
): Request {
  return { params, user } as unknown as Request;
}

// ── Tests ────────────────────────────────────────────────────────────
describe('TenantController.getById — tenant isolation', () => {
  const TENANT_A = 'tenant-aaa-111';
  const TENANT_B = 'tenant-bbb-222';

  const fakeTenantRecord = {
    id: TENANT_A,
    name: 'Tenant A',
    slug: 'tenant-a',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let tenantService: TenantService;
  let controller: TenantController;

  beforeEach(() => {
    tenantService = {
      create: vi.fn(),
      getById: vi.fn().mockResolvedValue(fakeTenantRecord),
    } as unknown as TenantService;

    controller = new TenantController(tenantService);
  });

  // ── Success cases ───────────────────────────────────────────────
  it('returns 200 when a viewer requests their own tenant', async () => {
    const req = authReq({ id: TENANT_A }, {
      userId: 'u1', tenantId: TENANT_A, name: 'Viewer', email: 'v@a.com', role: 'viewer',
    });
    const res = mockRes();
    const next = vi.fn();

    await controller.getById(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(fakeTenantRecord);
  });

  it('returns 200 when a manager requests their own tenant', async () => {
    const req = authReq({ id: TENANT_A }, {
      userId: 'u2', tenantId: TENANT_A, name: 'Manager', email: 'm@a.com', role: 'manager',
    });
    const res = mockRes();
    const next = vi.fn();

    await controller.getById(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('returns 200 when an admin requests their own tenant', async () => {
    const req = authReq({ id: TENANT_A }, {
      userId: 'u3', tenantId: TENANT_A, name: 'Admin', email: 'a@a.com', role: 'admin',
    });
    const res = mockRes();
    const next = vi.fn();

    await controller.getById(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  // ── Cross-tenant rejection (the critical security test) ─────────
  it('returns 404 when an admin of Tenant A requests Tenant B (cross-tenant)', async () => {
    const req = authReq({ id: TENANT_B }, {
      userId: 'u3', tenantId: TENANT_A, name: 'Admin A', email: 'a@a.com', role: 'admin',
    });
    const res = mockRes();
    const next = vi.fn();

    await controller.getById(req, res, next);

    // Must call next() with a NotFoundError, NOT succeed
    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(404);

    // Service should never be called for cross-tenant requests
    expect(tenantService.getById).not.toHaveBeenCalled();
  });

  it('returns 404 when a viewer of Tenant A requests Tenant B', async () => {
    const req = authReq({ id: TENANT_B }, {
      userId: 'u1', tenantId: TENANT_A, name: 'Viewer A', email: 'v@a.com', role: 'viewer',
    });
    const res = mockRes();
    const next = vi.fn();

    await controller.getById(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(tenantService.getById).not.toHaveBeenCalled();
  });

  it('returns 404 when a manager of Tenant A requests Tenant B', async () => {
    const req = authReq({ id: TENANT_B }, {
      userId: 'u2', tenantId: TENANT_A, name: 'Manager A', email: 'm@a.com', role: 'manager',
    });
    const res = mockRes();
    const next = vi.fn();

    await controller.getById(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(tenantService.getById).not.toHaveBeenCalled();
  });

  // ── Error message must NOT leak tenant existence ────────────────
  it('does not expose a 403 status for cross-tenant access (prevents enumeration)', async () => {
    const req = authReq({ id: TENANT_B }, {
      userId: 'u3', tenantId: TENANT_A, name: 'Admin A', email: 'a@a.com', role: 'admin',
    });
    const res = mockRes();
    const next = vi.fn();

    await controller.getById(req, res, next);

    const err = next.mock.calls[0][0];
    // A 403 would confirm the tenant exists. Must be 404.
    expect(err.statusCode).not.toBe(403);
  });
});

describe('TenantController.create', () => {
  let tenantService: TenantService;
  let controller: TenantController;

  beforeEach(() => {
    tenantService = {
      create: vi.fn(),
      getById: vi.fn(),
    } as unknown as TenantService;

    controller = new TenantController(tenantService);
  });

  it('creates a tenant successfully with valid payload', async () => {
    const fakeTenant = { id: 't1', name: 'New Tenant', slug: 'new-tenant' };
    vi.mocked(tenantService.create).mockResolvedValue(fakeTenant as any);

    const req = { body: { name: 'New Tenant', slug: 'new-tenant' } } as any;
    const res = mockRes();
    const next = vi.fn();

    await controller.create(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(fakeTenant);
  });

  it('calls next with ValidationError if slug is invalid format', async () => {
    const req = { body: { name: 'New Tenant', slug: 'New_Tenant!' } } as any;
    const res = mockRes();
    const next = vi.fn();

    await controller.create(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
    expect(tenantService.create).not.toHaveBeenCalled();
  });
});

