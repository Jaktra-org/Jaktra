import { eq } from 'drizzle-orm';
import { tenants } from '../db/index.js';
import type { DatabaseClient } from '../db/index.js';
import type { Tenant, NewTenant } from '../db/index.js';

export class TenantRepository {
  constructor(private db: DatabaseClient) {}

  async findById(id: string): Promise<Tenant | undefined> {
    const rows = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.id, id))
      .limit(1);

    return rows[0];
  }

  async findBySlug(slug: string): Promise<Tenant | undefined> {
    const rows = await this.db
      .select()
      .from(tenants)
      .where(eq(tenants.slug, slug))
      .limit(1);

    return rows[0];
  }

  async create(data: NewTenant): Promise<Tenant> {
    const rows = await this.db.insert(tenants).values(data).returning();
    return rows[0]!;
  }
}
