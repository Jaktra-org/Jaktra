import { eq, and, isNull, desc } from 'drizzle-orm';
import { invoicePortalLinks, invoices, tenants, tenantSettings } from '../../db/index.js';
import type { DatabaseClient } from '../../db/index.js';
import type { InvoicePortalLink } from '../../db/index.js';
import crypto from 'crypto';

export class PortalRepository {
  constructor(private readonly db: DatabaseClient) {}

  async createPortalLink(data: {
    tenantId: string;
    invoiceId: string;
    tokenHash: string;
  }): Promise<InvoicePortalLink> {
    const [result] = await this.db
      .insert(invoicePortalLinks)
      .values({
        tenantId: data.tenantId,
        invoiceId: data.invoiceId,
        tokenHash: data.tokenHash,
      })
      .returning();
    return result;
  }

  async findLinkByTokenHash(tokenHash: string): Promise<{
    link: InvoicePortalLink;
    invoice: typeof invoices.$inferSelect;
    tenant: typeof tenants.$inferSelect;
    settings: typeof tenantSettings.$inferSelect | null;
  } | undefined> {
    const result = await this.db
      .select({
        link: invoicePortalLinks,
        invoice: invoices,
        tenant: tenants,
        settings: tenantSettings,
      })
      .from(invoicePortalLinks)
      .innerJoin(invoices, eq(invoicePortalLinks.invoiceId, invoices.id))
      .innerJoin(tenants, eq(invoicePortalLinks.tenantId, tenants.id))
      .leftJoin(tenantSettings, eq(invoicePortalLinks.tenantId, tenantSettings.tenantId))
      .where(eq(invoicePortalLinks.tokenHash, tokenHash))
      .limit(1);

    return result[0];
  }

  async updateViewedAt(linkId: string): Promise<void> {
    await this.db
      .update(invoicePortalLinks)
      .set({ viewedAt: new Date() })
      .where(eq(invoicePortalLinks.id, linkId));
  }

  async revokeActivePortalLinks(invoiceId: string): Promise<void> {
    await this.db
      .update(invoicePortalLinks)
      .set({ revokedAt: new Date() })
      .where(and(eq(invoicePortalLinks.invoiceId, invoiceId), isNull(invoicePortalLinks.revokedAt)));
  }

  async getOrCreatePortalLink(tenantId: string, invoiceId: string): Promise<{ token: string; link: InvoicePortalLink }> {
    // Revoke any existing active portal links for this invoice first
    await this.revokeActivePortalLinks(invoiceId);

    // Generate new token
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    const newLink = await this.createPortalLink({
      tenantId,
      invoiceId,
      tokenHash,
    });

    return { token: rawToken, link: newLink };
  }
  async findLatestLinkByInvoiceId(invoiceId: string): Promise<InvoicePortalLink | undefined> {
    const [result] = await this.db
      .select()
      .from(invoicePortalLinks)
      .where(eq(invoicePortalLinks.invoiceId, invoiceId))
      .orderBy(desc(invoicePortalLinks.createdAt))
      .limit(1);
    return result;
  }
}
