import { DlqRepository } from './dlq.repository.js';
import type { DlqEntry } from '../../db/schema.js';

export class DlqService {
  constructor(private dlqRepo: DlqRepository) {}

  async recordFailure(invoiceId: string, tenantId: string, errorMsg: string, technicalMsg?: string): Promise<DlqEntry[]> {
    return await this.dlqRepo.recordFailure(invoiceId, tenantId, errorMsg, technicalMsg);
  }

  async clearFailure(invoiceId: string, tenantId: string): Promise<DlqEntry[]> {
    return await this.dlqRepo.clearFailure(invoiceId, tenantId);
  }

  async getDlqEntries(tenantId: string): Promise<Array<{
    invoiceId: string;
    consecutiveFailures: number;
    lastError: string | null;
    lastErrorDisplay: string | null;
    lastErrorTechnical: string | null;
    firstFailure: Date;
    lastFailure: Date;
    clientName: string;
    invoiceNo: string;
  }>> {
    return await this.dlqRepo.getAllEntries(tenantId);
  }

  async getDlqStats(tenantId: string): Promise<{ total: number; critical: number }> {
    return await this.dlqRepo.getStats(tenantId);
  }

  async clearAllFailures(tenantId: string): Promise<DlqEntry[]> {
    return await this.dlqRepo.clearAllEntries(tenantId);
  }
}
