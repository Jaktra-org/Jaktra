import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const PUBLIC_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

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
    const { data } = await axios.get<PortalInvoiceDetails>(`${PUBLIC_BASE_URL}/public/portal/${token}`);
    return data;
  },

  async payInvoice(token: string): Promise<{ paymentUrl: string }> {
    const { data } = await axios.post<{ paymentUrl: string }>(`${PUBLIC_BASE_URL}/public/portal/${token}/pay`);
    return data;
  },

  async submitPaymentPlan(token: string, payload: { installments: number; reason?: string }): Promise<any> {
    const { data } = await axios.post(`${PUBLIC_BASE_URL}/public/portal/${token}/plan`, payload);
    return data;
  },

  async submitDispute(token: string, payload: { body: string }): Promise<any> {
    const { data } = await axios.post(`${PUBLIC_BASE_URL}/public/portal/${token}/dispute`, payload);
    return data;
  }
};
