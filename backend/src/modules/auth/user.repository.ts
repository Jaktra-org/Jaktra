import { eq, and } from 'drizzle-orm';
import { users, tenants, tenantSettings } from '../../db/index.js';
import type { DatabaseOrTransaction } from '../../db/index.js';
import type { User, NewUser, Tenant, NewTenant } from '../../db/index.js';

export class UserRepository {
  constructor(private db: DatabaseOrTransaction) {}

  async findByEmail(email: string, tenantId: string): Promise<User | undefined> {
    const rows = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), eq(users.tenantId, tenantId)))
      .limit(1);

    return rows[0];
  }

  async findFirstByEmail(email: string): Promise<User | undefined> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return rows[0];
  }

  async findById(id: string): Promise<User | undefined> {
    const rows = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return rows[0];
  }

  async create(data: NewUser): Promise<User> {
    const rows = await this.db.insert(users).values(data).returning();
    return rows[0]!;
  }

  async update(id: string, data: Partial<NewUser>): Promise<User | undefined> {
    const [updated] = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }


  async updateMfaFields(
    id: string,
    data: Partial<Pick<
      NewUser,
      | 'mfaEnabled'
      | 'mfaSecret'
      | 'mfaSecretIv'
      | 'mfaSecretAuthTag'
      | 'mfaSecretKeyVersion'
      | 'mfaBackupCodes'
      | 'mfaLastUsedStep'
    >>,
  ): Promise<User | undefined> {
    const [updated] = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updated;
  }


  async findByIdWithTenantSettings(userId: string): Promise<{
    user: User;
    mfaRequired: boolean;
  } | undefined> {
    const rows = await this.db
      .select({
        user: users,
        mfaRequired: tenantSettings.mfaRequired,
      })
      .from(users)
      .leftJoin(tenantSettings, eq(users.tenantId, tenantSettings.tenantId))
      .where(eq(users.id, userId))
      .limit(1);

    const row = rows[0];
    if (!row) return undefined;

    return {
      user: row.user,
      mfaRequired: row.mfaRequired ?? false,
    };
  }

  async tenantExists(tenantId: string): Promise<boolean> {
    const rows = await this.db
      .select({ id: tenants.id })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1);

    return rows.length > 0;
  }

  async createTenantWithAdmin(
    tenantData: NewTenant,
    userData: Omit<NewUser, 'tenantId'>
  ): Promise<{ tenant: Tenant; user: User }> {
    return await this.db.transaction(async (tx) => {
      // 1. Create the tenant
      const insertedTenants = await tx
        .insert(tenants)
        .values(tenantData)
        .returning();
      const newTenant = insertedTenants[0]!;

      // 2. Create the admin user
      const insertedUsers = await tx
        .insert(users)
        .values({
          ...userData,
          tenantId: newTenant.id,
          role: 'admin',
        })
        .returning();
      const newAdmin = insertedUsers[0]!;

      // 3. Create default settings
      await tx
        .insert(tenantSettings)
        .values({
          tenantId: newTenant.id,
          companyName: tenantData.name,
          senderName: userData.name || 'Finance Team',
          senderEmail: userData.email,
        });

      return { tenant: newTenant, user: newAdmin };
    });
  }
}
