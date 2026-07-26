import crypto from 'crypto';
import { PortalRepository } from './portal.repository.js';
import { NotFoundError, GoneError } from '../../shared/errors/index.js';
import type { Invoice, Tenant, TenantSettings } from '../../db/index.js';

export class PortalService {
  constructor(private readonly repo: PortalRepository) {}

  async resolveAndValidateToken(rawToken: string) {
    if (!rawToken || typeof rawToken !== 'string') {
      throw new NotFoundError('This link is no longer valid or does not exist.');
    }

    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const record = await this.repo.findLinkByTokenHash(tokenHash);

    if (!record) {
      throw new NotFoundError('This link is no longer valid or does not exist.');
    }

    const { link, invoice, tenant, settings } = record;

    if (link.revokedAt) {
      throw new GoneError('This link is no longer valid or does not exist.');
    }

    // Dynamic Lifecycle-Based Expiry Check
    if (invoice.paymentStatus === 'Paid' || invoice.paymentStatus === 'Written Off') {
      const statusTime = invoice.paymentStatusChangedAt;
      if (!statusTime) {
        throw new GoneError('This link is no longer valid or does not exist.');
      }
      const gracePeriodEnd = new Date(statusTime.getTime());
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7-day grace period

      if (new Date() > gracePeriodEnd) {
        throw new GoneError('This link is no longer valid or does not exist.');
      }
    }

    return {
      link,
      invoice,
      tenant,
      settings,
    };
  }

  async recordViewIfNeeded(linkId: string, currentViewedAt: Date | null): Promise<void> {
    if (!currentViewedAt) {
      await this.repo.updateViewedAt(linkId).catch((err) => {
        // Log error but do not fail the request for auditing resilience
        console.error('Failed to update portal link viewedAt:', err);
      });
    }
  }

  async getOrCreatePortalLink(tenantId: string, invoiceId: string): Promise<string> {
    const { token } = await this.repo.getOrCreatePortalLink(tenantId, invoiceId);
    return token;
  }

  async ensurePortalLinkExists(tenantId: string, invoiceId: string): Promise<void> {
    const latest = await this.repo.findLatestLinkByInvoiceId(invoiceId);
    if (latest && !latest.revokedAt) {
      return;
    }
    await this.repo.getOrCreatePortalLink(tenantId, invoiceId);
  }

  async getLatestLinkStatus(invoiceId: string) {
    const link = await this.repo.findLatestLinkByInvoiceId(invoiceId);
    if (!link) {
      return { exists: false };
    }
    return {
      exists: true,
      createdAt: link.createdAt,
      viewedAt: link.viewedAt,
      revokedAt: link.revokedAt,
    };
  }
}
