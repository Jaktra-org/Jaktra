import { api } from './api';
import type { AnalyticsSummary } from '../types/api';

export const analyticsService = {
  getSummary: async (): Promise<AnalyticsSummary> => {
    const response = await api.get('/analytics/summary');
    return response.data;
  },
};
