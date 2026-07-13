import { api } from './api';

export interface InboundEmailReview {
  id: string;
  tenantId: string;
  invoiceId: string | null;
  sender: string;
  subject: string;
  body: string;
  classification: 'dispute' | 'question' | 'payment_promise' | 'unclear';
  confidence: number;
  suggestedResponse: string;
  reasoning: string;
  status: 'pending_review' | 'approved' | 'discarded';
  createdAt: string;
  invoiceNo?: string;
  clientName?: string;
}

export interface ListDisputesResponse {
  data: InboundEmailReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const disputeService = {
  getPendingDisputes: async (params?: { page?: number; limit?: number }): Promise<ListDisputesResponse> => {
    const response = await api.get('/disputes/pending', { params });
    return response.data;
  },
  approveDispute: async (id: string, suggestedResponse: string): Promise<void> => {
    await api.post(`/disputes/${id}/approve`, { suggestedResponse });
  },
  discardDispute: async (id: string): Promise<void> => {
    await api.post(`/disputes/${id}/discard`);
  },
};
