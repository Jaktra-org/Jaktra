import { api } from './api';
import type { InvoiceEvent, PaginatedResponse } from '../types/api';

export const eventService = {
  getInvoiceTimeline: async (
    invoiceId: string,
    params?: {
      page?: number;
      limit?: number;
      actionTypes?: string[];
      sources?: string[];
      actorId?: string;
      from?: string;
      to?: string;
    }
  ): Promise<PaginatedResponse<InvoiceEvent>> => {
    const qs = new URLSearchParams();
    if (params?.page)        qs.set('page', String(params.page));
    if (params?.limit)       qs.set('limit', String(params.limit));
    if (params?.actionTypes) qs.set('action_types', params.actionTypes.join(','));
    if (params?.sources)     qs.set('sources', params.sources.join(','));
    if (params?.actorId)     qs.set('actor_id', params.actorId);
    if (params?.from)        qs.set('from', params.from);
    if (params?.to)          qs.set('to', params.to);
    const response = await api.get(`/invoices/${invoiceId}/timeline?${qs}`);
    return response.data;
  },

  getFeed: async (limit: number = 50): Promise<InvoiceEvent[]> => {
    const response = await api.get(`/events/feed?limit=${limit}`);
    return response.data;
  },

  getAllEvents: async (
    params?: {
      page?: number;
      limit?: number;
      actionTypes?: string[];
      sources?: string[];
      actorId?: string;
      from?: string;
      to?: string;
    }
  ): Promise<PaginatedResponse<InvoiceEvent>> => {
    const qs = new URLSearchParams();
    if (params?.page)        qs.set('page', String(params.page));
    if (params?.limit)       qs.set('limit', String(params.limit));
    if (params?.actionTypes) qs.set('action_types', params.actionTypes.join(','));
    if (params?.sources)     qs.set('sources', params.sources.join(','));
    if (params?.actorId)     qs.set('actor_id', params.actorId);
    if (params?.from)        qs.set('from', params.from);
    if (params?.to)          qs.set('to', params.to);
    const response = await api.get(`/events?${qs}`);
    return response.data;
  },
};
