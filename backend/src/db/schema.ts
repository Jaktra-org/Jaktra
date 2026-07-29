import {
  mysqlTable,
  mysqlEnum,
  varchar,
  text,
  int,
  datetime,
  date,
  decimal,
  json,
  uniqueIndex,
  index,
  boolean,
  unique,
} from 'drizzle-orm/mysql-core';
import { relations, sql } from 'drizzle-orm';
import crypto from 'crypto';

export const userRoleEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['admin', 'manager', 'viewer']),
  { enumValues: ['admin', 'manager', 'viewer'] as const }
);

export const providerEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['sendgrid', 'smtp', 'razorpay']),
  { enumValues: ['sendgrid', 'smtp', 'razorpay'] as const }
);

export const paymentLinkStatusEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['active', 'paid', 'expired', 'cancelled']),
  { enumValues: ['active', 'paid', 'expired', 'cancelled'] as const }
);

export const defaultEmailProviderEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['sendgrid', 'smtp']),
  { enumValues: ['sendgrid', 'smtp'] as const }
);

export const validationResultEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['valid', 'invalid', 'revoked', 'insufficient_scope', 'unverified_sender', 'unknown']),
  { enumValues: ['valid', 'invalid', 'revoked', 'insufficient_scope', 'unverified_sender', 'unknown'] as const }
);

export const inboundEmailStatusEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['pending_review', 'approved', 'discarded']),
  { enumValues: ['pending_review', 'approved', 'discarded'] as const }
);

export const paymentPlanStatusEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['pending', 'approved', 'denied', 'cancelled']),
  { enumValues: ['pending', 'approved', 'denied', 'cancelled'] as const }
);

export const paymentStatusEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['Pending', 'Paid', 'Overdue', 'Written Off']),
  { enumValues: ['Pending', 'Paid', 'Overdue', 'Written Off'] as const }
);

export const communicationChannelEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['email', 'sms', 'whatsapp']),
  { enumValues: ['email', 'sms', 'whatsapp'] as const }
);

export const communicationStatusEnum = Object.assign(
  (name: string) => mysqlEnum(name, ['pending', 'sent', 'failed']),
  { enumValues: ['pending', 'sent', 'failed'] as const }
);

export const tenants = mysqlTable('tenants', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: datetime('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const users = mysqlTable(
  'users',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: userRoleEnum('role').notNull().default('viewer'),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    mfaSecret: text('mfa_secret'),
    mfaSecretIv: text('mfa_secret_iv'),
    mfaSecretAuthTag: text('mfa_secret_auth_tag'),
    mfaSecretKeyVersion: int('mfa_secret_key_version'),
    mfaBackupCodes: text('mfa_backup_codes'),
    mfaLastUsedStep: int('mfa_last_used_step'),
    emailVerified: boolean('email_verified').notNull().default(false),
  },
  (table) => [
    uniqueIndex('users_email_tenant_id_uniq').on(table.email, table.tenantId),
  ]
);

export const invoices = mysqlTable(
  'invoices',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    invoiceNo: varchar('invoice_no', { length: 255 }).notNull(),
    clientName: text('client_name').notNull(),
    invoiceAmount: decimal('invoice_amount', { precision: 14, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('INR'),
    dueDate: date('due_date', { mode: 'string' }).notNull(),
    contactEmail: varchar('contact_email', { length: 255 }).notNull(),
    subject: text('subject'),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('Pending'),
    followupCount: int('followup_count').notNull().default(0),
    lastFollowupDate: datetime('last_followup_date', { mode: 'date' }),
    externalRefId: varchar('external_ref_id', { length: 255 }),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime('updated_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: datetime('deleted_at', { mode: 'date' }),
    hasActivePaymentPlan: boolean('has_active_payment_plan').notNull().default(false),
    paymentStatusChangedAt: datetime('payment_status_changed_at', { mode: 'date' }),
  },
  (table) => [
    uniqueIndex('invoices_invoice_no_tenant_id_uniq').on(
      table.invoiceNo,
      table.tenantId
    ),
    index('invoices_tenant_id_payment_status_idx').on(
      table.tenantId,
      table.paymentStatus
    ),
    index('invoices_external_ref_id_idx').on(table.externalRefId),
  ]
);

export const communications = mysqlTable(
  'communications',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    invoiceId: varchar('invoice_id', { length: 36 })
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    channel: communicationChannelEnum('channel').notNull(),
    subject: text('subject'),
    body: text('body'),
    status: communicationStatusEnum('status').notNull().default('pending'),
    sentAt: datetime('sent_at', { mode: 'date' }),
    openedAt: datetime('opened_at', { mode: 'date' }),
    clickedAt: datetime('clicked_at', { mode: 'date' }),
    error: text('error'),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('communications_tenant_id_idx').on(table.tenantId),
    index('communications_invoice_id_status_sent_at_idx').on(
      table.invoiceId,
      table.status,
      table.sentAt
    ),
  ]
);

export const events = mysqlTable(
  'events',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    entityType: varchar('entity_type', { length: 50 }).notNull().default('invoice'),
    entityId: varchar('entity_id', { length: 36 }).notNull(),
    actorId: varchar('actor_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
    actorName: text('actor_name'),
    actorEmail: varchar('actor_email', { length: 255 }),
    actorRole: varchar('actor_role', { length: 50 }),
    actionType: varchar('action_type', { length: 100 }).notNull().default('legacy.event'),
    description: text('description'),
    source: varchar('source', { length: 50 }).notNull().default('system'),
    oldValues: json('old_values'),
    newValues: json('new_values'),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    payload: json('payload'),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('events_entity_audit_idx').on(
      table.tenantId,
      table.entityType,
      table.entityId,
      table.createdAt
    ),
    index('events_actor_id_idx').on(table.actorId),
    index('events_action_type_idx').on(
      table.tenantId,
      table.actionType,
      table.createdAt
    ),
    index('events_source_idx').on(
      table.tenantId,
      table.source,
      table.createdAt
    ),
  ]
);

export const agentRuns = mysqlTable(
  'agent_runs',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).notNull().default('running'),
    startTime: datetime('start_time', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    endTime: datetime('end_time', { mode: 'date' }),
    invoicesProcessed: int('invoices_processed').notNull().default(0),
    emailsSent: int('emails_sent').notNull().default(0),
    errors: int('errors').notNull().default(0),
    errorDetails: text('error_details'),
    chunkSize: int('chunk_size').notNull().default(10),
    totalInvoices: int('total_invoices').notNull().default(0),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('agent_runs_tenant_id_start_time_idx').on(
      table.tenantId,
      table.startTime
    ),
  ]
);

export const agentRunChunks = mysqlTable(
  'agent_run_chunks',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    runId: varchar('run_id', { length: 36 })
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    chunkIndex: int('chunk_index').notNull(),
    totalChunks: int('total_chunks').notNull(),
    invoiceIds: json('invoice_ids').notNull(),
    status: varchar('status', { length: 50 }).notNull().default('queued'),
    invoicesProcessed: int('invoices_processed').notNull().default(0),
    emailsSent: int('emails_sent').notNull().default(0),
    errors: int('errors').notNull().default(0),
    errorDetails: text('error_details'),
    startTime: datetime('start_time', { mode: 'date' }),
    endTime: datetime('end_time', { mode: 'date' }),
    createdAt: datetime('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('agent_run_chunks_run_id_idx').on(table.runId),
    index('agent_run_chunks_tenant_status_idx').on(table.tenantId, table.status),
  ]
);

export const dlqEntries = mysqlTable('dlq_entries', {
  invoiceId: varchar('invoice_id', { length: 36 })
    .primaryKey()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  consecutiveFailures: int('consecutive_failures').notNull().default(1),
  lastError: text('last_error'),
  lastErrorDisplay: text('last_error_display'),
  lastErrorTechnical: text('last_error_technical'),
  firstFailure: datetime('first_failure', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastFailure: datetime('last_failure', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('dlq_entries_tenant_id_idx').on(table.tenantId),
]);

export const tenantSettings = mysqlTable('tenant_settings', {
  tenantId: varchar('tenant_id', { length: 36 })
    .primaryKey()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull().default('Company'),
  senderName: text('sender_name').notNull(),
  senderEmail: varchar('sender_email', { length: 255 }).notNull(),
  replyTo: varchar('reply_to', { length: 255 }),
  paymentLink: text('payment_link'),
  bankDetails: text('bank_details'),
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
  scheduleHour: int('schedule_hour').notNull().default(9),
  idempotencyWindowHours: int('idempotency_window_hours').notNull().default(20),
  updatedAt: datetime('updated_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  defaultEmailProvider: defaultEmailProviderEnum('default_email_provider'),
  webhookToken: varchar('webhook_token', { length: 255 }),
  skipPaymentWarning: boolean('skip_payment_warning').notNull().default(false),
  autoPurgeEnabled: boolean('auto_purge_enabled').notNull().default(false),
  autoPurgeDays: int('auto_purge_days').notNull().default(30),
  dlqThreshold: int('dlq_threshold').notNull().default(3),
  mfaRequired: boolean('mfa_required').notNull().default(false),
  dnsVerifiedAt: datetime('dns_verified_at', { mode: 'date' }),
  inboundBlockedByAdmin: boolean('inbound_blocked_by_admin').notNull().default(false),
});

export const tenantIntegrations = mysqlTable('tenant_integrations', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  ciphertext: text('ciphertext').notNull(),
  iv: varchar('iv', { length: 100 }).notNull(),
  authTag: varchar('auth_tag', { length: 100 }).notNull(),
  keyVersion: int('key_version').notNull().default(1),
  lastValidatedAt: datetime('last_validated_at', { mode: 'date' }),
  lastValidationResult: validationResultEnum('last_validation_result').notNull().default('unknown'),
  lastOperationalErrorCode: varchar('last_operational_error_code', { length: 100 }),
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => {
  return {
    tenantProviderUniq: unique('tenant_integrations_tenant_provider_uniq').on(table.tenantId, table.provider)
  };
});

export const paymentWebhookEvents = mysqlTable('payment_webhook_events', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  externalEventId: varchar('external_event_id', { length: 255 }).notNull(),
  paymentId: varchar('payment_id', { length: 255 }),
  invoiceId: varchar('invoice_id', { length: 36 }).references(() => invoices.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull(),
  rawPayload: json('raw_payload'),
  receivedAt: datetime('received_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  processedAt: datetime('processed_at', { mode: 'date' }),
}, (table) => [
  uniqueIndex('payment_webhook_events_tenant_provider_external_event_uniq').on(table.tenantId, table.provider, table.externalEventId),
  index('payment_webhook_events_tenant_id_idx').on(table.tenantId),
  index('payment_webhook_events_invoice_id_idx').on(table.invoiceId),
  index('payment_webhook_events_payment_id_idx').on(table.paymentId),
]);

export const invoicePaymentLinks = mysqlTable('invoice_payment_links', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 }).notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  providerPaymentLinkId: varchar('provider_payment_link_id', { length: 255 }).notNull(),
  providerOrderId: varchar('provider_order_id', { length: 255 }),
  paymentUrl: text('payment_url').notNull(),
  status: paymentLinkStatusEnum('status').notNull().default('active'),
  amount: decimal('amount', { precision: 14, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  metadata: json('metadata'),
  expiresAt: datetime('expires_at', { mode: 'date' }),
  createdAt: datetime('created_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('invoice_payment_links_tenant_invoice_provider_uniq').on(table.tenantId, table.invoiceId, table.provider),
  index('invoice_payment_links_tenant_id_idx').on(table.tenantId),
  index('invoice_payment_links_invoice_id_idx').on(table.invoiceId),
  index('invoice_payment_links_provider_link_id_idx').on(table.providerPaymentLinkId),
]);

export const teamInvitations = mysqlTable('team_invitations', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('viewer').notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  invitedByUserId: varchar('invited_by_user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  expiresAt: datetime('expires_at', { mode: 'date' }).notNull(),
  acceptedAt: datetime('accepted_at', { mode: 'date' }),
  revokedAt: datetime('revoked_at', { mode: 'date' }),
  deliveryStatus: varchar('delivery_status', { length: 50 }).default('pending').notNull(),
  deliveryError: text('delivery_error'),
  lastSentAt: datetime('last_sent_at', { mode: 'date' }),
  createdAt: datetime('created_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: datetime('updated_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const inboundEmails = mysqlTable('inbound_emails', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 })
    .references(() => invoices.id, { onDelete: 'set null' }),
  sender: varchar('sender', { length: 255 }).notNull(),
  subject: text('subject'),
  body: text('body'),
  classification: varchar('classification', { length: 100 }),
  confidence: decimal('confidence', { precision: 4, scale: 3 }),
  suggestedResponse: text('suggested_response'),
  reasoning: text('reasoning'),
  status: inboundEmailStatusEnum('status').notNull().default('pending_review'),
  reviewedBy: varchar('reviewed_by', { length: 36 })
    .references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: datetime('reviewed_at', { mode: 'date' }),
  createdAt: datetime('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime('updated_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  source: varchar('source', { length: 50 }).notNull().default('email'),
}, (table) => [
  index('inbound_emails_tenant_id_status_idx').on(table.tenantId, table.status),
  index('inbound_emails_invoice_id_idx').on(table.invoiceId),
]);

export const invoicePortalLinks = mysqlTable('invoice_portal_links', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 })
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  createdAt: datetime('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  revokedAt: datetime('revoked_at', { mode: 'date' }),
  viewedAt: datetime('viewed_at', { mode: 'date' }),
}, (table) => [
  index('invoice_portal_links_token_hash_idx').on(table.tokenHash),
  index('invoice_portal_links_invoice_id_idx').on(table.invoiceId),
]);

export const paymentPlanRequests = mysqlTable('payment_plan_requests', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 })
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  installments: int('installments').notNull(),
  proposedAmountPerMonth: decimal('proposed_amount_per_month', { precision: 14, scale: 2 }).notNull(),
  reason: text('reason'),
  status: paymentPlanStatusEnum('status').notNull().default('pending'),
  reviewedBy: varchar('reviewed_by', { length: 36 })
    .references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: datetime('reviewed_at', { mode: 'date' }),
  createdAt: datetime('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('payment_plan_requests_tenant_id_status_idx').on(table.tenantId, table.status),
  index('payment_plan_requests_invoice_id_idx').on(table.invoiceId),
]);

export const tenantsRelations = relations(tenants, ({ many, one }) => ({
  users: many(users),
  invoices: many(invoices),
  agentRuns: many(agentRuns),
  settings: one(tenantSettings, {
    fields: [tenants.id],
    references: [tenantSettings.tenantId],
  }),
  integrations: many(tenantIntegrations),
  inboundEmails: many(inboundEmails),
}));

export const tenantIntegrationsRelations = relations(tenantIntegrations, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantIntegrations.tenantId],
    references: [tenants.id],
  }),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [invoices.tenantId],
    references: [tenants.id],
  }),
  communications: many(communications),
  events: many(events),
  dlqEntry: one(dlqEntries, {
    fields: [invoices.id],
    references: [dlqEntries.invoiceId],
  }),
  inboundEmails: many(inboundEmails),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  invoice: one(invoices, {
    fields: [communications.invoiceId],
    references: [invoices.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  invoice: one(invoices, {
    fields: [events.entityId],
    references: [invoices.id],
  }),
}));

export const agentRunsRelations = relations(agentRuns, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [agentRuns.tenantId],
    references: [tenants.id],
  }),
  chunks: many(agentRunChunks),
}));

export const agentRunChunksRelations = relations(agentRunChunks, ({ one }) => ({
  run: one(agentRuns, {
    fields: [agentRunChunks.runId],
    references: [agentRuns.id],
  }),
}));

export const dlqEntriesRelations = relations(dlqEntries, ({ one }) => ({
  invoice: one(invoices, {
    fields: [dlqEntries.invoiceId],
    references: [invoices.id],
  }),
}));

export const tenantSettingsRelations = relations(tenantSettings, ({ one }) => ({
  tenant: one(tenants, {
    fields: [tenantSettings.tenantId],
    references: [tenants.id],
  }),
}));

export const inboundEmailsRelations = relations(inboundEmails, ({ one }) => ({
  tenant: one(tenants, {
    fields: [inboundEmails.tenantId],
    references: [tenants.id],
  }),
  invoice: one(invoices, {
    fields: [inboundEmails.invoiceId],
    references: [invoices.id],
  }),
  reviewer: one(users, {
    fields: [inboundEmails.reviewedBy],
    references: [users.id],
  }),
}));

export const invoicePortalLinksRelations = relations(invoicePortalLinks, ({ one }) => ({
  tenant: one(tenants, {
    fields: [invoicePortalLinks.tenantId],
    references: [tenants.id],
  }),
  invoice: one(invoices, {
    fields: [invoicePortalLinks.invoiceId],
    references: [invoices.id],
  }),
}));

export const paymentPlanRequestsRelations = relations(paymentPlanRequests, ({ one }) => ({
  tenant: one(tenants, {
    fields: [paymentPlanRequests.tenantId],
    references: [tenants.id],
  }),
  invoice: one(invoices, {
    fields: [paymentPlanRequests.invoiceId],
    references: [invoices.id],
  }),
  reviewer: one(users, {
    fields: [paymentPlanRequests.reviewedBy],
    references: [users.id],
  }),
}));

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
export type Communication = typeof communications.$inferSelect;
export type NewCommunication = typeof communications.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type AgentRun = typeof agentRuns.$inferSelect;
export type NewAgentRun = typeof agentRuns.$inferInsert;
export type AgentRunChunk = typeof agentRunChunks.$inferSelect;
export type NewAgentRunChunk = typeof agentRunChunks.$inferInsert;
export type DlqEntry = typeof dlqEntries.$inferSelect;
export type NewDlqEntry = typeof dlqEntries.$inferInsert;
export type TenantSettings = typeof tenantSettings.$inferSelect;
export type NewTenantSettings = typeof tenantSettings.$inferInsert;
export type TenantIntegration = typeof tenantIntegrations.$inferSelect;
export type NewTenantIntegration = typeof tenantIntegrations.$inferInsert;
export type TeamInvitation = typeof teamInvitations.$inferSelect;
export type NewTeamInvitation = typeof teamInvitations.$inferInsert;
export type InboundEmail = typeof inboundEmails.$inferSelect;
export type NewInboundEmail = typeof inboundEmails.$inferInsert;
export type PaymentWebhookEvent = typeof paymentWebhookEvents.$inferSelect;
export type NewPaymentWebhookEvent = typeof paymentWebhookEvents.$inferInsert;
export type InvoicePaymentLink = typeof invoicePaymentLinks.$inferSelect;
export type NewInvoicePaymentLink = typeof invoicePaymentLinks.$inferInsert;
export type InvoicePortalLink = typeof invoicePortalLinks.$inferSelect;
export type NewInvoicePortalLink = typeof invoicePortalLinks.$inferInsert;
export type PaymentPlanRequest = typeof paymentPlanRequests.$inferSelect;
export type NewPaymentPlanRequest = typeof paymentPlanRequests.$inferInsert;
