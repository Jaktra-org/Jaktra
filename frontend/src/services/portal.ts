import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL ?? import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = (rawUrl && rawUrl.trim() !== "") ? rawUrl : "/api";

export interface PortalInvoiceDetails {
  invoice: {
    id: string;
    invoiceNo: string;
    clientName: string;
    invoiceAmount: string;
    currency: string;
    dueDate: string;
    paymentStatus: string;
    paymentStatusChangedAt: string | null;
    hasActivePaymentPlan: boolean;
    hasPendingPaymentPlan: boolean;
  };
  tenant: {
    name: string;
    companyName: string;
  };
}

export const portalService = {
  async getInvoiceDetails(token: string): Promise<PortalInvoiceDetails> {
    const { data } = await axios.get<PortalInvoiceDetails>(`${API_BASE_URL}/public/portal/${token}`);
    return data;
  },

  async payInvoice(token: string): Promise<{ paymentUrl: string }> {
    const { data } = await axios.post<{ paymentUrl: string }>(`${API_BASE_URL}/public/portal/${token}/pay`);
    return data;
  },

  async submitPaymentPlan(token: string, payload: { installments: number; reason?: string }): Promise<unknown> {
    const { data } = await axios.post(`${API_BASE_URL}/public/portal/${token}/plan`, payload);
    return data;
  },

  async submitDispute(token: string, payload: { body: string }): Promise<unknown> {
    const { data } = await axios.post(`${API_BASE_URL}/public/portal/${token}/dispute`, payload);
    return data;
  },

  async getInstallments(token: string): Promise<{ data: Array<{ id: string; installmentNumber: number; dueDate: string; amount: string; currency: string; status: string; paidAt?: string | null }> }> {
    const { data } = await axios.get(`${API_BASE_URL}/public/portal/${token}/installments`);
    return data;
  }
};
