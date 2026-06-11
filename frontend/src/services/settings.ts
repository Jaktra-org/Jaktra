import { api } from './api';
import type { TenantSettings, IntegrationStatus } from '../types/api';

export const settingsService = {
  getSettings: async (): Promise<TenantSettings> => {
    const response = await api.get('/settings');
    return response.data;
  },

  updateSettings: async (data: Partial<TenantSettings>): Promise<TenantSettings> => {
    const response = await api.patch('/settings', data);
    return response.data;
  },

  getIntegrations: async (): Promise<IntegrationStatus> => {
    const response = await api.get('/settings/integrations');
    return response.data;
  },

  saveSendgridKey: async (apiKey: string): Promise<{ message: string }> => {
    const response = await api.post('/settings/integrations/sendgrid', { apiKey });
    return response.data;
  },

  disconnectSendgrid: async (): Promise<void> => {
    await api.delete('/settings/integrations/sendgrid');
  },

  testEmail: async (to: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/settings/integrations/sendgrid/test', { to });
    return response.data;
  },
};
