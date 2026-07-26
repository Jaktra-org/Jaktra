import { api } from './api';
import type { Invoice, ListInvoicesParams, PaginatedResponse } from '../types/api';

export const invoiceService = {
  getInvoices: async (params: ListInvoicesParams = {}): Promise<PaginatedResponse<Invoice>> => {
    // Convert arrays to comma-separated strings for the backend
    const queryParams: Record<string, string | number | string[] | undefined> = { ...params };
    if (params.status && params.status.length > 0) {
      queryParams.status = params.status.join(',');
    }


    const response = await api.get('/invoices', { params: queryParams });
    return response.data;
  },

  createInvoice: async (data: Omit<Invoice, 'id' | 'tenantId' | 'paymentStatus' | 'followupCount' | 'createdAt' | 'updatedAt' | 'lastFollowupDate' | 'daysOverdue' | 'invoiceAmount'> & { invoiceAmount: number | string }) => {
    const response = await api.post('/invoices', data);
    return response.data;
  },

  getInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}`);
    return response.data;
  },

  updateInvoice: async (id: string, data: Partial<Omit<Invoice, 'invoiceAmount'>> & { invoiceAmount?: number | string }) => {
    const response = await api.patch(`/invoices/${id}`, data);
    return response.data;
  },

  updateInvoiceStatus: async (id: string, status: string) => {
    const response = await api.patch(`/invoices/${id}/status`, { paymentStatus: status });
    return response.data;
  },

  importInvoices: async (file: File, strategy: 'skip' | 'update') => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/invoices/import?on_duplicate=${strategy}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  generatePaymentLink: async (id: string): Promise<{ url: string }> => {
    const response = await api.post(`/invoices/${id}/payment-link`);
    return response.data;
  },

  deleteInvoice: async (id: string) => {
    const response = await api.delete(`/invoices/${id}`);
    return response.data;
  },

  getTrashedInvoices: async (params: Omit<ListInvoicesParams, 'status'> = {}): Promise<PaginatedResponse<Invoice>> => {
    const queryParams: Record<string, string | number | string[] | undefined> = { ...params };
    const response = await api.get('/invoices/trash', { params: queryParams });
    return response.data;
  },

  hardDeleteInvoice: async (id: string) => {
    const response = await api.delete(`/invoices/${id}/permanent`);
    return response.data;
  },

  restoreInvoice: async (id: string) => {
    const response = await api.post(`/invoices/${id}/restore`);
    return response.data;
  },

  getTrashedInvoice: async (id: string): Promise<Invoice> => {
    const response = await api.get(`/invoices/${id}/trashed`);
    return response.data;
  },

  getPendingPaymentPlans: async (params: { page?: number; limit?: number } = {}) => {
    const response = await api.get('/invoices/payment-plans/pending', { params });
    return response.data;
  },

  approvePaymentPlan: async (id: string) => {
    const response = await api.post(`/invoices/payment-plans/${id}/approve`);
    return response.data;
  },

  denyPaymentPlan: async (id: string) => {
    const response = await api.post(`/invoices/payment-plans/${id}/deny`);
    return response.data;
  },

  cancelPaymentPlan: async (invoiceId: string) => {
    const response = await api.post(`/invoices/${invoiceId}/cancel-payment-plan`);
    return response.data;
  },

  getPortalLinkStatus: async (id: string): Promise<{ exists: boolean; createdAt?: string; viewedAt?: string | null; revokedAt?: string | null }> => {
    const response = await api.get(`/invoices/${id}/portal-link`);
    return response.data;
  },

  regeneratePortalLink: async (id: string): Promise<{ token: string; url: string }> => {
    const response = await api.post(`/invoices/${id}/portal-link/regenerate`);
    return response.data;
  },
};
