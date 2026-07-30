import { api } from './api';

export type DisputeStatus = 'pending' | 'resolved' | 'archived';
export type DisputeCategory = 'dispute' | 'question' | 'payment_promise' | 'unclear';

export interface ThreadItem {
  id: string;
  direction: 'inbound' | 'outbound';
  sender: string;
  subject: string | null;
  body: string | null;
  aiSummary?: string | null;
  sourceTag?: 'bulk_ai_agent' | 'invoice_manual' | 'dispute_agent' | 'system';
  createdAt: string;
}

export interface InboundEmailReview {
  id: string;
  tenantId: string;
  invoiceId: string | null;
  sender: string;
  subject: string;
  body: string;
  classification: DisputeCategory;
  confidence: string | null;
  suggestedResponse?: string;
  reasoning: string;
  summary?: string;
  aiSummary?: string | null;
  status: DisputeStatus;
  createdAt: string;
  invoiceNo?: string;
  clientName?: string;
  thread?: ThreadItem[];
}

export interface ListDisputesResponse {
  data: InboundEmailReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  statusCounts: {
    pending: number;
    resolved: number;
    archived: number;
  };
  categoryCounts: {
    all: number;
    dispute: number;
    question: number;
    payment_promise: number;
    unclear: number;
  };
}

export const disputeService = {
  getDisputes: async (params: {
    status: DisputeStatus;
    classification?: string;
    page?: number;
    limit?: number;
  }): Promise<ListDisputesResponse> => {
    const response = await api.get('/disputes/list', { params });
    return response.data;
  },

  getPendingDisputes: async (params?: { page?: number; limit?: number }): Promise<ListDisputesResponse> => {
    return disputeService.getDisputes({ status: 'pending', classification: 'all', ...params });
  },

  sendReply: async (id: string, responseBody: string): Promise<void> => {
    await api.post(`/disputes/${id}/send-reply`, { responseBody });
  },

  updateStatus: async (id: string, status: DisputeStatus): Promise<void> => {
    await api.post(`/disputes/${id}/status`, { status });
  },

  approveDispute: async (id: string, suggestedResponse: string): Promise<void> => {
    await api.post(`/disputes/${id}/approve`, { suggestedResponse });
  },

  discardDispute: async (id: string): Promise<void> => {
    await api.post(`/disputes/${id}/discard`);
  },

  generateDraft: async (id: string, tenantInstruction: string): Promise<{ suggestedResponse: string }> => {
    const response = await api.post(`/disputes/${id}/generate-draft`, { tenantInstruction });
    return response.data;
  },
};
