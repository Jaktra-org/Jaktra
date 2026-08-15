CREATE TYPE "public"."communication_channel" AS ENUM('email', 'sms', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."communication_source" AS ENUM('bulk_ai_agent', 'invoice_manual', 'dispute_agent', 'system');--> statement-breakpoint
CREATE TYPE "public"."communication_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."default_email_provider" AS ENUM('sendgrid', 'smtp');--> statement-breakpoint
CREATE TYPE "public"."email_provider" AS ENUM('sendgrid', 'smtp', 'resend');--> statement-breakpoint
CREATE TYPE "public"."inbound_email_status" AS ENUM('pending', 'resolved', 'archived');--> statement-breakpoint
CREATE TYPE "public"."installment_status" AS ENUM('pending', 'paid', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."integration_overall_status" AS ENUM('not_configured', 'partially_configured', 'active');--> statement-breakpoint
CREATE TYPE "public"."payment_link_status" AS ENUM('active', 'paid', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_plan_status" AS ENUM('pending', 'approved', 'denied', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Paid', 'Overdue', 'Written Off');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('sendgrid', 'smtp', 'razorpay');--> statement-breakpoint
CREATE TYPE "public"."resend_reply_mode" AS ENUM('real_mailbox', 'webhook_only');--> statement-breakpoint
CREATE TYPE "public"."resend_validation_result" AS ENUM('valid', 'invalid', 'untested');--> statement-breakpoint
CREATE TYPE "public"."sendgrid_reply_mode" AS ENUM('real_mailbox', 'webhook_only');--> statement-breakpoint
CREATE TYPE "public"."smtp_encryption_type" AS ENUM('tls', 'ssl', 'none');--> statement-breakpoint
CREATE TYPE "public"."smtp_validation_result" AS ENUM('valid', 'invalid', 'untested');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."validation_result" AS ENUM('valid', 'invalid', 'revoked', 'insufficient_scope', 'unverified_sender', 'unknown');--> statement-breakpoint
CREATE TABLE "agent_run_chunks" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"run_id" varchar(36) NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"chunk_index" integer NOT NULL,
	"total_chunks" integer NOT NULL,
	"invoice_ids" jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'queued' NOT NULL,
	"invoices_processed" integer DEFAULT 0 NOT NULL,
	"emails_sent" integer DEFAULT 0 NOT NULL,
	"errors" integer DEFAULT 0 NOT NULL,
	"error_details" text,
	"start_time" timestamp,
	"end_time" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"status" varchar(50) DEFAULT 'running' NOT NULL,
	"start_time" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"end_time" timestamp,
	"invoices_processed" integer DEFAULT 0 NOT NULL,
	"emails_sent" integer DEFAULT 0 NOT NULL,
	"errors" integer DEFAULT 0 NOT NULL,
	"error_details" text,
	"chunk_size" integer DEFAULT 10 NOT NULL,
	"total_invoices" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36) NOT NULL,
	"channel" "communication_channel" NOT NULL,
	"subject" text,
	"body" text,
	"status" "communication_status" DEFAULT 'pending' NOT NULL,
	"source" "communication_source" DEFAULT 'system' NOT NULL,
	"ai_summary" text,
	"sent_at" timestamp,
	"error" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dlq_entries" (
	"invoice_id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"consecutive_failures" integer DEFAULT 1 NOT NULL,
	"last_error" text,
	"last_error_display" text,
	"last_error_technical" text,
	"first_failure" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"last_failure" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_integration_resend" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"integration_id" varchar(36) NOT NULL,
	"ciphertext" text,
	"iv" varchar(64),
	"auth_tag" varchar(64),
	"key_version" integer DEFAULT 1 NOT NULL,
	"last_validation_result" "resend_validation_result" DEFAULT 'untested' NOT NULL,
	"last_validated_at" timestamp,
	"inbound_domain" varchar(255),
	"inbound_parse_verified" boolean DEFAULT false NOT NULL,
	"webhook_url" varchar(512),
	"reply_mode" "resend_reply_mode" DEFAULT 'webhook_only' NOT NULL,
	"reply_mailbox_email" varchar(255),
	"reply_mailbox_verified" boolean DEFAULT false NOT NULL,
	"reply_mailbox_otp_code" varchar(6),
	"reply_mailbox_otp_expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_integration_sendgrid" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"integration_id" varchar(36) NOT NULL,
	"ciphertext" text,
	"iv" varchar(64),
	"auth_tag" varchar(64),
	"key_version" integer DEFAULT 1 NOT NULL,
	"inbound_domain" varchar(255),
	"inbound_parse_verified" boolean DEFAULT false NOT NULL,
	"webhook_url" varchar(512),
	"reply_mode" "sendgrid_reply_mode" DEFAULT 'webhook_only' NOT NULL,
	"reply_mailbox_email" varchar(255),
	"reply_mailbox_verified" boolean DEFAULT false NOT NULL,
	"reply_mailbox_otp_code" varchar(6),
	"reply_mailbox_otp_expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_integration_smtp" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"integration_id" varchar(36) NOT NULL,
	"host" varchar(255) NOT NULL,
	"port" integer DEFAULT 587 NOT NULL,
	"username" varchar(255),
	"ciphertext" text NOT NULL,
	"iv" varchar(64) NOT NULL,
	"auth_tag" varchar(64) NOT NULL,
	"key_version" integer DEFAULT 1 NOT NULL,
	"encryption_type" "smtp_encryption_type" DEFAULT 'tls' NOT NULL,
	"allow_self_signed" boolean DEFAULT false NOT NULL,
	"last_validation_result" "smtp_validation_result" DEFAULT 'untested' NOT NULL,
	"last_validated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_integrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"provider" "email_provider" NOT NULL,
	"sender_name" varchar(255),
	"sender_email" varchar(255),
	"reply_to" varchar(255),
	"overall_status" "integration_overall_status" DEFAULT 'not_configured' NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"active_tenant_id" varchar(36),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"entity_type" varchar(50) DEFAULT 'invoice' NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"actor_id" varchar(36),
	"actor_name" text,
	"actor_email" varchar(255),
	"actor_role" varchar(50),
	"action_type" varchar(100) DEFAULT 'legacy.event' NOT NULL,
	"description" text,
	"source" varchar(50) DEFAULT 'system' NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"event_type" varchar(100) NOT NULL,
	"payload" jsonb,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbound_emails" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36),
	"sender" varchar(255) NOT NULL,
	"subject" text,
	"body" text,
	"classification" varchar(100),
	"confidence" numeric(4, 3),
	"reasoning" text,
	"ai_summary" text,
	"status" "inbound_email_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(36),
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"source" varchar(50) DEFAULT 'email' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_payment_links" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36) NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_payment_link_id" varchar(255) NOT NULL,
	"provider_order_id" varchar(255),
	"payment_url" text NOT NULL,
	"status" "payment_link_status" DEFAULT 'active' NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(10) NOT NULL,
	"metadata" jsonb,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_portal_links" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"revoked_at" timestamp,
	"viewed_at" timestamp,
	CONSTRAINT "invoice_portal_links_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"invoice_no" varchar(255) NOT NULL,
	"client_name" text NOT NULL,
	"invoice_amount" numeric(14, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"due_date" date NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"subject" text,
	"payment_status" "payment_status" DEFAULT 'Pending' NOT NULL,
	"followup_count" integer DEFAULT 0 NOT NULL,
	"last_followup_date" timestamp,
	"external_ref_id" varchar(255),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"deleted_at" timestamp,
	"has_active_payment_plan" boolean DEFAULT false NOT NULL,
	"payment_status_changed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "payment_plan_installments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"plan_request_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36) NOT NULL,
	"installment_number" integer NOT NULL,
	"due_date" date NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'INR' NOT NULL,
	"status" "installment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"payment_transaction_id" varchar(255),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_plan_requests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"invoice_id" varchar(36) NOT NULL,
	"installments" integer NOT NULL,
	"proposed_amount_per_month" numeric(14, 2) NOT NULL,
	"reason" text,
	"status" "payment_plan_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" varchar(36),
	"reviewed_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"provider" "provider" NOT NULL,
	"external_event_id" varchar(255) NOT NULL,
	"payment_id" varchar(255),
	"invoice_id" varchar(36),
	"status" varchar(50) NOT NULL,
	"raw_payload" jsonb,
	"received_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reply_tokens" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"communication_id" varchar(36),
	"invoice_id" varchar(36),
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"last_used_at" timestamp,
	"reply_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_invitations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"invited_by_user_id" varchar(36),
	"expires_at" timestamp NOT NULL,
	"accepted_at" timestamp,
	"revoked_at" timestamp,
	"delivery_status" varchar(50) DEFAULT 'pending' NOT NULL,
	"delivery_error" text,
	"last_sent_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "team_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "tenant_integrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"provider" "provider" NOT NULL,
	"ciphertext" text NOT NULL,
	"iv" varchar(100) NOT NULL,
	"auth_tag" varchar(100) NOT NULL,
	"key_version" integer DEFAULT 1 NOT NULL,
	"last_validated_at" timestamp,
	"last_validation_result" "validation_result" DEFAULT 'unknown' NOT NULL,
	"last_operational_error_code" varchar(100),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_settings" (
	"tenant_id" varchar(36) PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'Company' NOT NULL,
	"payment_link" text,
	"bank_details" text,
	"timezone" varchar(100) DEFAULT 'UTC' NOT NULL,
	"schedule_hour" integer DEFAULT 9 NOT NULL,
	"idempotency_window_hours" integer DEFAULT 20 NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"webhook_token" varchar(255),
	"skip_payment_warning" boolean DEFAULT false NOT NULL,
	"auto_purge_enabled" boolean DEFAULT false NOT NULL,
	"auto_purge_days" integer DEFAULT 30 NOT NULL,
	"dlq_threshold" integer DEFAULT 3 NOT NULL,
	"mfa_required" boolean DEFAULT false NOT NULL,
	"inbound_blocked_by_admin" boolean DEFAULT false NOT NULL,
	"auto_purge_archived_disputes_days" integer DEFAULT 30 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_secret" text,
	"mfa_secret_iv" text,
	"mfa_secret_auth_tag" text,
	"mfa_secret_key_version" integer,
	"mfa_backup_codes" text,
	"mfa_last_used_step" integer,
	"email_verified" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agent_run_chunks" ADD CONSTRAINT "agent_run_chunks_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_run_chunks" ADD CONSTRAINT "agent_run_chunks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD CONSTRAINT "agent_runs_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "communications" ADD CONSTRAINT "communications_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dlq_entries" ADD CONSTRAINT "dlq_entries_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dlq_entries" ADD CONSTRAINT "dlq_entries_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_integration_resend" ADD CONSTRAINT "email_integration_resend_integration_id_email_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."email_integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_integration_sendgrid" ADD CONSTRAINT "email_integration_sendgrid_integration_id_email_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."email_integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_integration_smtp" ADD CONSTRAINT "email_integration_smtp_integration_id_email_integrations_id_fk" FOREIGN KEY ("integration_id") REFERENCES "public"."email_integrations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_integrations" ADD CONSTRAINT "email_integrations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_actor_id_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_links" ADD CONSTRAINT "invoice_payment_links_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_payment_links" ADD CONSTRAINT "invoice_payment_links_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_portal_links" ADD CONSTRAINT "invoice_portal_links_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_portal_links" ADD CONSTRAINT "invoice_portal_links_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_installments" ADD CONSTRAINT "payment_plan_installments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_installments" ADD CONSTRAINT "payment_plan_installments_plan_request_id_payment_plan_requests_id_fk" FOREIGN KEY ("plan_request_id") REFERENCES "public"."payment_plan_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_installments" ADD CONSTRAINT "payment_plan_installments_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reply_tokens" ADD CONSTRAINT "reply_tokens_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reply_tokens" ADD CONSTRAINT "reply_tokens_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_integrations" ADD CONSTRAINT "tenant_integrations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_run_chunks_run_id_idx" ON "agent_run_chunks" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "agent_run_chunks_tenant_status_idx" ON "agent_run_chunks" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "agent_runs_tenant_id_start_time_idx" ON "agent_runs" USING btree ("tenant_id","start_time");--> statement-breakpoint
CREATE INDEX "communications_tenant_id_idx" ON "communications" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "communications_invoice_id_status_sent_at_idx" ON "communications" USING btree ("invoice_id","status","sent_at");--> statement-breakpoint
CREATE INDEX "dlq_entries_tenant_id_idx" ON "dlq_entries" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_resend_integration_id" ON "email_integration_resend" USING btree ("integration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_sendgrid_integration_id" ON "email_integration_sendgrid" USING btree ("integration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_smtp_integration_id" ON "email_integration_smtp" USING btree ("integration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_tenant_provider" ON "email_integrations" USING btree ("tenant_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "unq_single_active_provider" ON "email_integrations" USING btree ("active_tenant_id");--> statement-breakpoint
CREATE INDEX "idx_email_integrations_tenant" ON "email_integrations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "events_entity_audit_idx" ON "events" USING btree ("tenant_id","entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "events_actor_id_idx" ON "events" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "events_action_type_idx" ON "events" USING btree ("tenant_id","action_type","created_at");--> statement-breakpoint
CREATE INDEX "events_source_idx" ON "events" USING btree ("tenant_id","source","created_at");--> statement-breakpoint
CREATE INDEX "inbound_emails_tenant_id_status_idx" ON "inbound_emails" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "inbound_emails_invoice_id_idx" ON "inbound_emails" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_payment_links_tenant_invoice_provider_uniq" ON "invoice_payment_links" USING btree ("tenant_id","invoice_id","provider");--> statement-breakpoint
CREATE INDEX "invoice_payment_links_tenant_id_idx" ON "invoice_payment_links" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "invoice_payment_links_invoice_id_idx" ON "invoice_payment_links" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_payment_links_provider_link_id_idx" ON "invoice_payment_links" USING btree ("provider_payment_link_id");--> statement-breakpoint
CREATE INDEX "invoice_portal_links_token_hash_idx" ON "invoice_portal_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invoice_portal_links_invoice_id_idx" ON "invoice_portal_links" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_invoice_no_tenant_id_uniq" ON "invoices" USING btree ("invoice_no","tenant_id");--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_payment_status_idx" ON "invoices" USING btree ("tenant_id","payment_status");--> statement-breakpoint
CREATE INDEX "invoices_external_ref_id_idx" ON "invoices" USING btree ("external_ref_id");--> statement-breakpoint
CREATE INDEX "payment_plan_installments_tenant_idx" ON "payment_plan_installments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_plan_installments_plan_idx" ON "payment_plan_installments" USING btree ("plan_request_id");--> statement-breakpoint
CREATE INDEX "payment_plan_installments_invoice_idx" ON "payment_plan_installments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_plan_requests_tenant_id_status_idx" ON "payment_plan_requests" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "payment_plan_requests_invoice_id_idx" ON "payment_plan_requests" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_webhook_events_tenant_provider_external_event_uniq" ON "payment_webhook_events" USING btree ("tenant_id","provider","external_event_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_tenant_id_idx" ON "payment_webhook_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_invoice_id_idx" ON "payment_webhook_events" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_payment_id_idx" ON "payment_webhook_events" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "reply_tokens_tenant_comm_idx" ON "reply_tokens" USING btree ("tenant_id","communication_id");--> statement-breakpoint
CREATE INDEX "reply_tokens_tenant_inv_idx" ON "reply_tokens" USING btree ("tenant_id","invoice_id");--> statement-breakpoint
CREATE INDEX "reply_tokens_expires_at_idx" ON "reply_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_integrations_tenant_provider_uniq" ON "tenant_integrations" USING btree ("tenant_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_tenant_id_uniq" ON "users" USING btree ("email","tenant_id");