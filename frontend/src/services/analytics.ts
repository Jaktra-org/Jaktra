import { api } from './api';
import type { AnalyticsSummary, AgingTier } from '../types/api';

export const analyticsService = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
  getAging: async (): Promise<AgingTier[]> => {
    const response = await api.get('/analytics/aging');
    return response.data;
  },
};
