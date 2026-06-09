import { CommunicationRepository } from '../communication.repository.js';

export interface IdempotencyCheckResult {
  skipped: boolean;
  reason?: string;
  lastSentAt?: Date;
}

export class IdempotencyService {
  constructor(
    private readonly communicationRepo: CommunicationRepository
  ) {}

  async checkInvoice(tenantId: string, invoiceId: string): Promise<IdempotencyCheckResult> {
    const settings = await this.communicationRepo.getSettings(tenantId);
    // Use the tenant's configured window, default to 20 hours
    const windowHours = settings?.idempotencyWindowHours ?? 20;

    const comms = await this.communicationRepo.findByInvoiceId(invoiceId);
    
    // Find the latest successful (or assumed successful) communication
    // For now we look at the most recent communication
    const latestComm = comms[0];

    if (!latestComm) {
      return { skipped: false };
    }

    const now = new Date();
    const lastSentAt = new Date(latestComm.createdAt);
    const hoursSinceLastSent = (now.getTime() - lastSentAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceLastSent < windowHours) {
      return {
        skipped: true,
        reason: `sent ${Math.round(hoursSinceLastSent * 10) / 10}h ago`,
        lastSentAt,
      };
    }

    return { skipped: false };
  }
}
