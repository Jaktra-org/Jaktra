import { api } from './api';
import type { TenantSettings, IntegrationsResponse, SmtpConfig } from '../types/api';

export const settingsService = {
  getSettings: async (): Promise<TenantSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<TenantSettings>): Promise<TenantSettings> => {
    const response = await api.patch('/settings', data);
    return response.data;
  },

  getIntegrations: async (): Promise<IntegrationsResponse> => {
    const response = await api.get('/settings/integrations');
    return response.data;
  },

  rotateWebhookToken: async (): Promise<{ webhookToken: string; webhookUrl: string }> => {
    const response = await api.post('/settings/webhook-token/rotate');
    return response.data;
  },

  saveSendgridKey: async (data: {
    apiKey: string;
    senderName?: string;
    senderEmail?: string;
    replyTo?: string | null;
    replyMode?: 'real_mailbox' | 'webhook_only';
    replyMailboxEmail?: string;
    otpCode?: string;
  }): Promise<{ requiresOtp?: boolean; targetEmail?: string; message: string }> => {
    const response = await api.post('/settings/integrations/sendgrid', data);
    return response.data;
  },

  disconnectSendgrid: async (): Promise<void> => {
    await api.delete('/settings/integrations/sendgrid');
  },

  testEmail: async (to: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/settings/integrations/sendgrid/test', { to });
    return response.data;
  },

  saveSmtpConfig: async (config: SmtpConfig & { senderName?: string }): Promise<{ message: string }> => {
    const response = await api.post('/settings/integrations/smtp', config);
    return response.data;
  },

  disconnectSmtp: async (): Promise<void> => {
    await api.delete('/settings/integrations/smtp');
  },

  testSmtpEmail: async (to: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/settings/integrations/smtp/test', { to });
    return response.data;
  },

  saveResendKey: async (data: {
    apiKey?: string;
    senderName?: string;
    senderEmail?: string;
    replyTo?: string | null;
    replyMode?: 'real_mailbox' | 'webhook_only';
    replyMailboxEmail?: string | null;
  }): Promise<{ message: string }> => {
    const response = await api.post('/settings/integrations/resend', data);
    return response.data;
  },

  disconnectResend: async (): Promise<void> => {
    await api.delete('/settings/integrations/resend');
  },

  testResendEmail: async (to: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/settings/integrations/resend/test', { to });
    return response.data;
  },

  setDefaultProvider: async (provider: 'sendgrid' | 'smtp' | 'resend' | null): Promise<{ message: string }> => {
    const response = await api.patch('/settings/integrations/default-provider', { provider });
    return response.data;
  },

  activateProvider: async (provider: 'sendgrid' | 'smtp' | 'resend'): Promise<{ message: string }> => {
    const response = await api.post(`/settings/integrations/${provider}/activate`);
    return response.data;
  },

  saveRazorpayKey: async (data: { keyId: string; keySecret: string; webhookSecret: string }): Promise<{ message: string }> => {
    const response = await api.post('/settings/integrations/razorpay', data);
    return response.data;
  },

  testRazorpayKey: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/settings/integrations/razorpay/test');
    return response.data;
  },

  disconnectRazorpay: async (): Promise<void> => {
    await api.delete('/settings/integrations/razorpay');
  },

  getSendgridHealth: async (): Promise<{
    senderVerified: boolean | 'insufficient_permissions' | 'check_failed';
    domainAuthenticated: boolean | 'insufficient_permissions' | 'check_failed';
    checkedAt: string;
    reasons: string[];
  }> => {
    const response = await api.get('/settings/integrations/sendgrid/health');
    return response.data;
  },

  setReplyMode: async (data: { replyMode: 'real_mailbox' | 'webhook_only'; replyMailboxEmail?: string }): Promise<{
    message: string;
    replyMode: 'real_mailbox' | 'webhook_only';
    replyMailboxEmail?: string;
    replyMailboxVerified: boolean;
  }> => {
    const response = await api.post('/settings/integrations/sendgrid/reply-mode', data);
    return response.data;
  },

  sendReplyMailboxOtp: async (data?: { replyMailboxEmail?: string }): Promise<{ message: string }> => {
    const response = await api.post('/settings/integrations/sendgrid/reply-mailbox/send-otp', data || {});
    return response.data;
  },

  verifyReplyMailboxOtp: async (otp: string): Promise<{ message: string; replyMailboxVerified: boolean }> => {
    const response = await api.post('/settings/integrations/sendgrid/reply-mailbox/verify-otp', { otp });
    return response.data;
  },

  verifyInboundWebhook: async (data?: { inboundDomain?: string }): Promise<{ message: string; isVerified: boolean }> => {
    const response = await api.post('/settings/integrations/sendgrid/inbound/verify', data || {});
    return response.data;
  },

  getResendHealth: async (): Promise<{
    status: 'healthy' | 'warning' | 'error';
    apiKeyValid: boolean;
    senderVerified: boolean;
    domainVerified: boolean;
    inboundParseReady: boolean;
    message?: string;
  }> => {
    const response = await api.get('/settings/integrations/resend/health');
    return response.data;
  },

  setResendReplyMode: async (data: { replyMode: 'real_mailbox' | 'webhook_only'; replyMailboxEmail?: string }): Promise<{
    message: string;
    replyMode: 'real_mailbox' | 'webhook_only';
    replyMailboxEmail?: string;
    replyMailboxVerified: boolean;
  }> => {
    const response = await api.post('/settings/integrations/resend/reply-mode', data);
    return response.data;
  },

  sendResendReplyMailboxOtp: async (data?: { replyMailboxEmail?: string }): Promise<{ message: string }> => {
    const response = await api.post('/settings/integrations/resend/reply-mailbox/send-otp', data || {});
    return response.data;
  },

  verifyResendReplyMailboxOtp: async (otp: string): Promise<{ message: string; replyMailboxVerified: boolean }> => {
    const response = await api.post('/settings/integrations/resend/reply-mailbox/verify-otp', { otp });
    return response.data;
  },

  verifyResendInbound: async (data?: { inboundDomain?: string }): Promise<{ message: string; isVerified: boolean }> => {
    const response = await api.post('/settings/integrations/resend/inbound/verify', data || {});
    return response.data;
  },
};
