import type { TenantRepository } from '../tenant/tenant.repository.js';
import type { Tenant } from '../../db/index.js';
import { TenantError } from '../../shared/errors/index.js';
export interface CreateTenantInput {
  name: string;
  slug: string;
}
export class TenantService {
  constructor(private tenantRepo: TenantRepository) {}
  async create(input: CreateTenantInput): Promise<Tenant> {
    const existing = await this.tenantRepo.findBySlug(input.slug);
    if (existing) {
      throw new TenantError('Tenant slug already exists', 409);
    }
    return this.tenantRepo.create(input);
  }
  async getById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findById(id);
    if (!tenant) {
      throw new TenantError('Tenant not found', 404);
    }
    return tenant;
  }
}