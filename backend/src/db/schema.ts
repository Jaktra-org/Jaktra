import {
  pgTable,
  pgEnum,
  varchar,
  text,
  integer,
  timestamp,
  date,
  numeric,
  jsonb,
  uniqueIndex,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import crypto from 'crypto';

export const userRoleEnum = pgEnum('user_role', ['admin', 'manager', 'viewer']);

export const providerEnum = pgEnum('provider', ['sendgrid', 'smtp', 'razorpay']);

export const paymentLinkStatusEnum = pgEnum('payment_link_status', ['active', 'paid', 'expired', 'cancelled']);

export const defaultEmailProviderEnum = pgEnum('default_email_provider', ['sendgrid', 'smtp']);

export const validationResultEnum = pgEnum('validation_result', ['valid', 'invalid', 'revoked', 'insufficient_scope', 'unverified_sender', 'unknown']);

export const communicationSourceEnum = pgEnum('communication_source', ['bulk_ai_agent', 'invoice_manual', 'dispute_agent', 'system']);

export const inboundEmailStatusEnum = pgEnum('inbound_email_status', ['pending', 'resolved', 'archived']);

export const paymentPlanStatusEnum = pgEnum('payment_plan_status', ['pending', 'approved', 'denied', 'cancelled']);

export const installmentStatusEnum = pgEnum('installment_status', ['pending', 'paid', 'overdue']);

export const paymentStatusEnum = pgEnum('payment_status', ['Pending', 'Paid', 'Overdue', 'Written Off']);

export const communicationChannelEnum = pgEnum('communication_channel', ['email', 'sms', 'whatsapp']);

export const communicationStatusEnum = pgEnum('communication_status', ['pending', 'sent', 'failed']);

export const emailProviderEnum = pgEnum('email_provider', ['sendgrid', 'smtp', 'resend']);

export const integrationOverallStatusEnum = pgEnum('integration_overall_status', ['not_configured', 'partially_configured', 'active']);

export const sendgridReplyModeEnum = pgEnum('sendgrid_reply_mode', ['real_mailbox', 'webhook_only']);

export const smtpEncryptionTypeEnum = pgEnum('smtp_encryption_type', ['tls', 'ssl', 'none']);

export const smtpValidationResultEnum = pgEnum('smtp_validation_result', ['valid', 'invalid', 'untested']);

export const resendValidationResultEnum = pgEnum('resend_validation_result', ['valid', 'invalid', 'untested']);

export const resendReplyModeEnum = pgEnum('resend_reply_mode', ['real_mailbox', 'webhook_only']);

export const tenants = pgTable('tenants', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const users = pgTable(
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
    createdAt: timestamp('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    mfaEnabled: boolean('mfa_enabled').notNull().default(false),
    mfaSecret: text('mfa_secret'),
    mfaSecretIv: text('mfa_secret_iv'),
    mfaSecretAuthTag: text('mfa_secret_auth_tag'),
    mfaSecretKeyVersion: integer('mfa_secret_key_version'),
    mfaBackupCodes: text('mfa_backup_codes'),
    mfaLastUsedStep: integer('mfa_last_used_step'),
    emailVerified: boolean('email_verified').notNull().default(false),
  },
  (table) => [
    uniqueIndex('users_email_tenant_id_uniq').on(table.email, table.tenantId),
  ]
);

export const invoices = pgTable(
  'invoices',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    invoiceNo: varchar('invoice_no', { length: 255 }).notNull(),
    clientName: text('client_name').notNull(),
    invoiceAmount: numeric('invoice_amount', { precision: 14, scale: 2 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('INR'),
    dueDate: date('due_date', { mode: 'string' }).notNull(),
    contactEmail: varchar('contact_email', { length: 255 }).notNull(),
    subject: text('subject'),
    paymentStatus: paymentStatusEnum('payment_status').notNull().default('Pending'),
    followupCount: integer('followup_count').notNull().default(0),
    lastFollowupDate: timestamp('last_followup_date', { mode: 'date' }),
    externalRefId: varchar('external_ref_id', { length: 255 }),
    createdAt: timestamp('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    deletedAt: timestamp('deleted_at', { mode: 'date' }),
    hasActivePaymentPlan: boolean('has_active_payment_plan').notNull().default(false),
    paymentStatusChangedAt: timestamp('payment_status_changed_at', { mode: 'date' }),
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

export const communications = pgTable(
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
    source: communicationSourceEnum('source').notNull().default('system'),
    aiSummary: text('ai_summary'),
    sentAt: timestamp('sent_at', { mode: 'date' }),
    error: text('error'),
    createdAt: timestamp('created_at', { mode: 'date' })
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

export const events = pgTable(
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
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    payload: jsonb('payload'),
    createdAt: timestamp('created_at', { mode: 'date' })
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

export const agentRuns = pgTable(
  'agent_runs',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 50 }).notNull().default('running'),
    startTime: timestamp('start_time', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    endTime: timestamp('end_time', { mode: 'date' }),
    invoicesProcessed: integer('invoices_processed').notNull().default(0),
    emailsSent: integer('emails_sent').notNull().default(0),
    errors: integer('errors').notNull().default(0),
    errorDetails: text('error_details'),
    chunkSize: integer('chunk_size').notNull().default(10),
    totalInvoices: integer('total_invoices').notNull().default(0),
    createdAt: timestamp('created_at', { mode: 'date' })
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

export const agentRunChunks = pgTable(
  'agent_run_chunks',
  {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    runId: varchar('run_id', { length: 36 })
      .notNull()
      .references(() => agentRuns.id, { onDelete: 'cascade' }),
    tenantId: varchar('tenant_id', { length: 36 })
      .notNull()
      .references(() => tenants.id, { onDelete: 'cascade' }),
    chunkIndex: integer('chunk_index').notNull(),
    totalChunks: integer('total_chunks').notNull(),
    invoiceIds: jsonb('invoice_ids').notNull(),
    status: varchar('status', { length: 50 }).notNull().default('queued'),
    invoicesProcessed: integer('invoices_processed').notNull().default(0),
    emailsSent: integer('emails_sent').notNull().default(0),
    errors: integer('errors').notNull().default(0),
    errorDetails: text('error_details'),
    startTime: timestamp('start_time', { mode: 'date' }),
    endTime: timestamp('end_time', { mode: 'date' }),
    createdAt: timestamp('created_at', { mode: 'date' })
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index('agent_run_chunks_run_id_idx').on(table.runId),
    index('agent_run_chunks_tenant_status_idx').on(table.tenantId, table.status),
  ]
);

export const dlqEntries = pgTable('dlq_entries', {
  invoiceId: varchar('invoice_id', { length: 36 })
    .primaryKey()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  consecutiveFailures: integer('consecutive_failures').notNull().default(1),
  lastError: text('last_error'),
  lastErrorDisplay: text('last_error_display'),
  lastErrorTechnical: text('last_error_technical'),
  firstFailure: timestamp('first_failure', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  lastFailure: timestamp('last_failure', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('dlq_entries_tenant_id_idx').on(table.tenantId),
]);

export const tenantSettings = pgTable('tenant_settings', {
  tenantId: varchar('tenant_id', { length: 36 })
    .primaryKey()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull().default('Company'),
  paymentLink: text('payment_link'),
  bankDetails: text('bank_details'),
  timezone: varchar('timezone', { length: 100 }).notNull().default('UTC'),
  scheduleHour: integer('schedule_hour').notNull().default(9),
  idempotencyWindowHours: integer('idempotency_window_hours').notNull().default(20),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  webhookToken: varchar('webhook_token', { length: 255 }),
  skipPaymentWarning: boolean('skip_payment_warning').notNull().default(false),
  autoPurgeEnabled: boolean('auto_purge_enabled').notNull().default(false),
  autoPurgeDays: integer('auto_purge_days').notNull().default(30),
  dlqThreshold: integer('dlq_threshold').notNull().default(3),
  mfaRequired: boolean('mfa_required').notNull().default(false),
  inboundBlockedByAdmin: boolean('inbound_blocked_by_admin').notNull().default(false),
  autoPurgeArchivedDisputesDays: integer('auto_purge_archived_disputes_days').notNull().default(30),
});

export const emailIntegrations = pgTable('email_integrations', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  provider: emailProviderEnum('provider').notNull(),
  senderName: varchar('sender_name', { length: 255 }),
  senderEmail: varchar('sender_email', { length: 255 }),
  replyTo: varchar('reply_to', { length: 255 }),
  overallStatus: integrationOverallStatusEnum('overall_status').notNull().default('not_configured'),
  isActive: boolean('is_active').notNull().default(false),
  activeTenantId: varchar('active_tenant_id', { length: 36 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('unq_tenant_provider').on(table.tenantId, table.provider),
  uniqueIndex('unq_single_active_provider').on(table.activeTenantId),
  index('idx_email_integrations_tenant').on(table.tenantId),
]);

export const emailIntegrationSendgrid = pgTable('email_integration_sendgrid', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  integrationId: varchar('integration_id', { length: 36 })
    .notNull()
    .references(() => emailIntegrations.id, { onDelete: 'cascade' }),
  ciphertext: text('ciphertext'),
  iv: varchar('iv', { length: 64 }),
  authTag: varchar('auth_tag', { length: 64 }),
  keyVersion: integer('key_version').notNull().default(1),
  inboundDomain: varchar('inbound_domain', { length: 255 }),
  inboundParseVerified: boolean('inbound_parse_verified').notNull().default(false),
  webhookUrl: varchar('webhook_url', { length: 512 }),
  replyMode: sendgridReplyModeEnum('reply_mode').notNull().default('webhook_only'),
  replyMailboxEmail: varchar('reply_mailbox_email', { length: 255 }),
  replyMailboxVerified: boolean('reply_mailbox_verified').notNull().default(false),
  replyMailboxOtpCode: varchar('reply_mailbox_otp_code', { length: 6 }),
  replyMailboxOtpExpiresAt: timestamp('reply_mailbox_otp_expires_at', { mode: 'date' }),
}, (table) => [
  uniqueIndex('unq_sendgrid_integration_id').on(table.integrationId),
]);

export const emailIntegrationSmtp = pgTable('email_integration_smtp', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  integrationId: varchar('integration_id', { length: 36 })
    .notNull()
    .references(() => emailIntegrations.id, { onDelete: 'cascade' }),
  host: varchar('host', { length: 255 }).notNull(),
  port: integer('port').notNull().default(587),
  username: varchar('username', { length: 255 }),
  ciphertext: text('ciphertext').notNull(),
  iv: varchar('iv', { length: 64 }).notNull(),
  authTag: varchar('auth_tag', { length: 64 }).notNull(),
  keyVersion: integer('key_version').notNull().default(1),
  encryptionType: smtpEncryptionTypeEnum('encryption_type').notNull().default('tls'),
  allowSelfSigned: boolean('allow_self_signed').notNull().default(false),
  lastValidationResult: smtpValidationResultEnum('last_validation_result').notNull().default('untested'),
  lastValidatedAt: timestamp('last_validated_at', { mode: 'date' }),
}, (table) => [
  uniqueIndex('unq_smtp_integration_id').on(table.integrationId),
]);

export const emailIntegrationResend = pgTable('email_integration_resend', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  integrationId: varchar('integration_id', { length: 36 })
    .notNull()
    .references(() => emailIntegrations.id, { onDelete: 'cascade' }),
  ciphertext: text('ciphertext'),
  iv: varchar('iv', { length: 64 }),
  authTag: varchar('auth_tag', { length: 64 }),
  keyVersion: integer('key_version').notNull().default(1),
  lastValidationResult: resendValidationResultEnum('last_validation_result').notNull().default('untested'),
  lastValidatedAt: timestamp('last_validated_at', { mode: 'date' }),
  inboundDomain: varchar('inbound_domain', { length: 255 }),
  inboundParseVerified: boolean('inbound_parse_verified').notNull().default(false),
  webhookUrl: varchar('webhook_url', { length: 512 }),
  replyMode: resendReplyModeEnum('reply_mode').notNull().default('webhook_only'),
  replyMailboxEmail: varchar('reply_mailbox_email', { length: 255 }),
  replyMailboxVerified: boolean('reply_mailbox_verified').notNull().default(false),
  replyMailboxOtpCode: varchar('reply_mailbox_otp_code', { length: 6 }),
  replyMailboxOtpExpiresAt: timestamp('reply_mailbox_otp_expires_at', { mode: 'date' }),
}, (table) => [
  uniqueIndex('unq_resend_integration_id').on(table.integrationId),
]);

export const tenantIntegrations = pgTable('tenant_integrations', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  ciphertext: text('ciphertext').notNull(),
  iv: varchar('iv', { length: 100 }).notNull(),
  authTag: varchar('auth_tag', { length: 100 }).notNull(),
  keyVersion: integer('key_version').notNull().default(1),
  lastValidatedAt: timestamp('last_validated_at', { mode: 'date' }),
  lastValidationResult: validationResultEnum('last_validation_result').notNull().default('unknown'),
  lastOperationalErrorCode: varchar('last_operational_error_code', { length: 100 }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('tenant_integrations_tenant_provider_uniq').on(table.tenantId, table.provider),
]);

export const paymentWebhookEvents = pgTable('payment_webhook_events', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  externalEventId: varchar('external_event_id', { length: 255 }).notNull(),
  paymentId: varchar('payment_id', { length: 255 }),
  invoiceId: varchar('invoice_id', { length: 36 }).references(() => invoices.id, { onDelete: 'set null' }),
  status: varchar('status', { length: 50 }).notNull(),
  rawPayload: jsonb('raw_payload'),
  receivedAt: timestamp('received_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  processedAt: timestamp('processed_at', { mode: 'date' }),
}, (table) => [
  uniqueIndex('payment_webhook_events_tenant_provider_external_event_uniq').on(table.tenantId, table.provider, table.externalEventId),
  index('payment_webhook_events_tenant_id_idx').on(table.tenantId),
  index('payment_webhook_events_invoice_id_idx').on(table.invoiceId),
  index('payment_webhook_events_payment_id_idx').on(table.paymentId),
]);

export const invoicePaymentLinks = pgTable('invoice_payment_links', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 }).notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  provider: providerEnum('provider').notNull(),
  providerPaymentLinkId: varchar('provider_payment_link_id', { length: 255 }).notNull(),
  providerOrderId: varchar('provider_order_id', { length: 255 }),
  paymentUrl: text('payment_url').notNull(),
  status: paymentLinkStatusEnum('status').notNull().default('active'),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull(),
  metadata: jsonb('metadata'),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex('invoice_payment_links_tenant_invoice_provider_uniq').on(table.tenantId, table.invoiceId, table.provider),
  index('invoice_payment_links_tenant_id_idx').on(table.tenantId),
  index('invoice_payment_links_invoice_id_idx').on(table.invoiceId),
  index('invoice_payment_links_provider_link_id_idx').on(table.providerPaymentLinkId),
]);

export const teamInvitations = pgTable('team_invitations', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  email: varchar('email', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('viewer').notNull(),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  invitedByUserId: varchar('invited_by_user_id', { length: 36 }).references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }).notNull(),
  acceptedAt: timestamp('accepted_at', { mode: 'date' }),
  revokedAt: timestamp('revoked_at', { mode: 'date' }),
  deliveryStatus: varchar('delivery_status', { length: 50 }).default('pending').notNull(),
  deliveryError: text('delivery_error'),
  lastSentAt: timestamp('last_sent_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const inboundEmails = pgTable('inbound_emails', {
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
  confidence: numeric('confidence', { precision: 4, scale: 3 }),
  reasoning: text('reasoning'),
  aiSummary: text('ai_summary'),
  status: inboundEmailStatusEnum('status').notNull().default('pending'),
  reviewedBy: varchar('reviewed_by', { length: 36 })
    .references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  source: varchar('source', { length: 50 }).notNull().default('email'),
}, (table) => [
  index('inbound_emails_tenant_id_status_idx').on(table.tenantId, table.status),
  index('inbound_emails_invoice_id_idx').on(table.invoiceId),
]);

export const replyTokens = pgTable('reply_tokens', {
  tokenHash: varchar('token_hash', { length: 64 }).primaryKey(),
  tenantId: varchar('tenant_id', { length: 36 }).notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  communicationId: varchar('communication_id', { length: 36 }),
  invoiceId: varchar('invoice_id', { length: 36 }).references(() => invoices.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  revokedAt: timestamp('revoked_at', { mode: 'date' }),
  lastUsedAt: timestamp('last_used_at', { mode: 'date' }),
  replyCount: integer('reply_count').notNull().default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('reply_tokens_tenant_comm_idx').on(table.tenantId, table.communicationId),
  index('reply_tokens_tenant_inv_idx').on(table.tenantId, table.invoiceId),
  index('reply_tokens_expires_at_idx').on(table.expiresAt),
]);

export const invoicePortalLinks = pgTable('invoice_portal_links', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 })
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  revokedAt: timestamp('revoked_at', { mode: 'date' }),
  viewedAt: timestamp('viewed_at', { mode: 'date' }),
}, (table) => [
  index('invoice_portal_links_token_hash_idx').on(table.tokenHash),
  index('invoice_portal_links_invoice_id_idx').on(table.invoiceId),
]);

export const paymentPlanRequests = pgTable('payment_plan_requests', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 })
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  installments: integer('installments').notNull(),
  proposedAmountPerMonth: numeric('proposed_amount_per_month', { precision: 14, scale: 2 }).notNull(),
  reason: text('reason'),
  status: paymentPlanStatusEnum('status').notNull().default('pending'),
  reviewedBy: varchar('reviewed_by', { length: 36 })
    .references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('payment_plan_requests_tenant_id_status_idx').on(table.tenantId, table.status),
  index('payment_plan_requests_invoice_id_idx').on(table.invoiceId),
]);

export const paymentPlanInstallments = pgTable('payment_plan_installments', {
  id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
  tenantId: varchar('tenant_id', { length: 36 })
    .notNull()
    .references(() => tenants.id, { onDelete: 'cascade' }),
  planRequestId: varchar('plan_request_id', { length: 36 })
    .notNull()
    .references(() => paymentPlanRequests.id, { onDelete: 'cascade' }),
  invoiceId: varchar('invoice_id', { length: 36 })
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  installmentNumber: integer('installment_number').notNull(),
  dueDate: date('due_date', { mode: 'string' }).notNull(),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).notNull().default('INR'),
  status: installmentStatusEnum('status').notNull().default('pending'),
  paidAt: timestamp('paid_at', { mode: 'date' }),
  paymentTransactionId: varchar('payment_transaction_id', { length: 255 }),
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index('payment_plan_installments_tenant_idx').on(table.tenantId),
  index('payment_plan_installments_plan_idx').on(table.planRequestId),
  index('payment_plan_installments_invoice_idx').on(table.invoiceId),
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

export const paymentPlanRequestsRelations = relations(paymentPlanRequests, ({ one, many }) => ({
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
  installments: many(paymentPlanInstallments),
}));

export const paymentPlanInstallmentsRelations = relations(paymentPlanInstallments, ({ one }) => ({
  tenant: one(tenants, {
    fields: [paymentPlanInstallments.tenantId],
    references: [tenants.id],
  }),
  planRequest: one(paymentPlanRequests, {
    fields: [paymentPlanInstallments.planRequestId],
    references: [paymentPlanRequests.id],
  }),
  invoice: one(invoices, {
    fields: [paymentPlanInstallments.invoiceId],
    references: [invoices.id],
  }),
}));

export const replyTokensRelations = relations(replyTokens, ({ one }) => ({
  tenant: one(tenants, {
    fields: [replyTokens.tenantId],
    references: [tenants.id],
  }),
  communication: one(communications, {
    fields: [replyTokens.communicationId],
    references: [communications.id],
  }),
  invoice: one(invoices, {
    fields: [replyTokens.invoiceId],
    references: [invoices.id],
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
export type PaymentPlanInstallment = typeof paymentPlanInstallments.$inferSelect;
export type NewPaymentPlanInstallment = typeof paymentPlanInstallments.$inferInsert;
export type ReplyToken = typeof replyTokens.$inferSelect;
export type NewReplyToken = typeof replyTokens.$inferInsert;
export type EmailIntegration = typeof emailIntegrations.$inferSelect;
export type NewEmailIntegration = typeof emailIntegrations.$inferInsert;
export type EmailIntegrationSendgrid = typeof emailIntegrationSendgrid.$inferSelect;
export type NewEmailIntegrationSendgrid = typeof emailIntegrationSendgrid.$inferInsert;
export type EmailIntegrationSmtp = typeof emailIntegrationSmtp.$inferSelect;
export type NewEmailIntegrationSmtp = typeof emailIntegrationSmtp.$inferInsert;
export type EmailIntegrationResend = typeof emailIntegrationResend.$inferSelect;
export type NewEmailIntegrationResend = typeof emailIntegrationResend.$inferInsert;
