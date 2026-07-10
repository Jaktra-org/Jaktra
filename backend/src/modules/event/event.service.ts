import { z } from 'zod';
import { ACTION_TYPES, type ActionType } from './event.action-types.js';
import type { EventRepository } from './event.repository.js';
import type { InvoiceRepository } from '../invoice/invoice.repository.js';
import type { Event } from '../../db/index.js';
import { ValidationError } from '../../shared/errors/index.js';

export type ActorContext =
  | { source: 'ui' | 'api'; userId: string; name: string; email: string; role: string }
  | { source: 'agent' | 'webhook' | 'system'; name?: string; email?: string; role?: string };

export const EVENT_TYPES = [
  'created',
  'triage_assigned',
  'email_generated',
  'email_sent',
  'email_opened',
  'email_clicked',
  'status_changed',
  'payment_received',
  'escalated',
  'halted',
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

export class EventService {
  constructor(
    private eventRepo: EventRepository,
    private invoiceRepo: InvoiceRepository,
  ) {}

  async emitEvent(
    entityType: string,
    entityId: string,
    tenantId: string,
    actionType: ActionType,
    actor: ActorContext,
    opts?: {
      description?: string;
      oldValues?: Record<string, unknown>;
      newValues?: Record<string, unknown>;
      payload?: Record<string, unknown>;
      tx?: any;
    }
  ): Promise<Event>;

  async emitEvent(
    invoiceId: string,
    eventType: EventType,
    payload?: Record<string, unknown>,
    actor?: string,
    tenantId?: string
  ): Promise<Event>;

  async emitEvent(
    arg1: string,
    arg2: string,
    arg3?: any,
    arg4?: any,
    arg5?: any,
    arg6?: any
  ): Promise<Event> {
    if (
      typeof arg4 === 'object' ||
      arg6 !== undefined ||
      (typeof arg4 === 'string' && arg4.includes('.')) ||
      (typeof arg5 === 'object' && arg5 !== null && 'source' in arg5) ||
      (arg4 === undefined && typeof arg3 === 'string' && arg3.includes('-'))
    ) {
      const entityType = arg1;
      const entityId = arg2;
      const tenantId = arg3;
      const actionType = arg4 as ActionType;
      const actor = arg5 as ActorContext;
      const opts = arg6;

      const actionTypeSchema = z.enum(ACTION_TYPES);
      try {
        actionTypeSchema.parse(actionType);
      } catch (err) {
        throw new ValidationError(`Invalid action type: ${actionType}`);
      }

      const actorId = actor.source === 'ui' || actor.source === 'api' ? actor.userId : null;
      const actorName = actor.source === 'ui' || actor.source === 'api' ? actor.name : actor.name || null;
      const actorEmail = actor.source === 'ui' || actor.source === 'api' ? actor.email : actor.email || null;
      const actorRole = actor.source === 'ui' || actor.source === 'api' ? actor.role : actor.role || null;

      let eventType: string = actionType;
      if (actionType === 'followup.sent') eventType = 'email_sent';
      else if (actionType === 'followup.email_opened') eventType = 'email_opened';
      else if (actionType === 'followup.email_clicked') eventType = 'email_clicked';
      else if (actionType === 'invoice.status_changed') eventType = 'status_changed';
      else if (actionType === 'payment.received') eventType = 'payment_received';
      else if (actionType === 'followup.halted') eventType = 'halted';

      return this.eventRepo.create({
        tenantId,
        entityType,
        entityId,
        actorId,
        actorName,
        actorEmail,
        actorRole,
        actionType,
        description: opts?.description ?? null,
        source: actor.source,
        oldValues: opts?.oldValues ?? null,
        newValues: opts?.newValues ?? null,
        eventType,
        payload: opts?.payload ?? null,
      }, opts?.tx);
    } else {
      const invoiceId = arg1;
      const eventType = arg2 as EventType;
      const payload = arg3;
      const actor = arg4 ?? 'system';
      const tenantId = arg5 ?? '';

      let actionType: ActionType = 'legacy.event';
      if (eventType === 'email_sent') actionType = 'followup.sent';
      else if (eventType === 'email_opened') actionType = 'followup.email_opened';
      else if (eventType === 'email_clicked') actionType = 'followup.email_clicked';
      else if (eventType === 'status_changed') actionType = 'invoice.status_changed';
      else if (eventType === 'payment_received') actionType = 'payment.received';
      else if (eventType === 'halted') actionType = 'followup.halted';

      return this.eventRepo.create({
        tenantId,
        entityType: 'invoice',
        entityId: invoiceId,
        eventType,
        payload: payload ?? null,
        actorName: actor,
        source: actor === 'ai-agent' ? 'agent' : 'system',
        actionType,
      });
    }
  }

  async listByInvoice(invoiceId: string, tenantId: string): Promise<Event[]> {
    const invoice = await this.invoiceRepo.findById(invoiceId);
    if (!invoice || invoice.tenantId !== tenantId) {
      throw new EventError('Invoice not found', 404);
    }
    return this.eventRepo.findByInvoiceId(invoiceId);
  }

  async findByRunId(runId: string): Promise<Event[]> {
    return this.eventRepo.findByRunId(runId);
  }

  async getFeed(tenantId: string, limit?: number) {
    return this.eventRepo.getTenantFeed(tenantId, limit);
  }

  async listByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
    filters: {
      actionTypes?: ActionType[];
      sources?: string[];
      actorId?: string;
      from?: Date;
      to?: Date;
    },
    page: number,
    limit: number,
  ): Promise<{ data: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const { data, total } = await this.eventRepo.findByEntityPaginated(
      tenantId,
      entityType,
      entityId,
      filters,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((event) => ({
      ...event,
      invoiceId: event.entityId,
    }));

    return {
      data: mappedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async listAll(
    tenantId: string,
    filters: {
      actionTypes?: ActionType[];
      sources?: string[];
      actorId?: string;
      from?: Date;
      to?: Date;
    },
    page: number,
    limit: number,
  ): Promise<{ data: any[]; pagination: { total: number; page: number; limit: number; totalPages: number } }> {
    const { data, total } = await this.eventRepo.findTenantEventsPaginated(
      tenantId,
      filters,
      page,
      limit
    );

    const totalPages = Math.ceil(total / limit);

    const mappedData = data.map((event) => ({
      ...event,
      invoiceId: event.entityType === 'invoice' ? event.entityId : null,
    }));

    return {
      data: mappedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }
}

export class EventError extends Error {
  constructor(
    message: string,
    public statusCode: number,
  ) {
    super(message);
    this.name = 'EventError';
  }
}
