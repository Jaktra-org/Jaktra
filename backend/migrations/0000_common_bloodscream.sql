CREATE TYPE "public"."communication_channel" AS ENUM('email', 'sms', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."communication_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."default_email_provider" AS ENUM('sendgrid', 'smtp');--> statement-breakpoint
CREATE TYPE "public"."inbound_email_status" AS ENUM('pending_review', 'approved', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."payment_link_status" AS ENUM('active', 'paid', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_plan_status" AS ENUM('pending', 'approved', 'denied', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('Pending', 'Paid', 'Overdue', 'Written Off');--> statement-breakpoint
CREATE TYPE "public"."integration_provider" AS ENUM('sendgrid', 'smtp', 'razorpay');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."validation_result" AS ENUM('valid', 'invalid', 'revoked', 'insufficient_scope', 'unverified_sender', 'unknown');--> statement-breakpoint
CREATE TABLE "agent_run_chunks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"chunk_index" integer NOT NULL,
	"total_chunks" integer NOT NULL,
	"invoice_ids" jsonb NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"invoices_processed" integer DEFAULT 0 NOT NULL,
	"emails_sent" integer DEFAULT 0 NOT NULL,
	"errors" integer DEFAULT 0 NOT NULL,
	"error_details" text,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"status" text DEFAULT 'running' NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"invoices_processed" integer DEFAULT 0 NOT NULL,
	"emails_sent" integer DEFAULT 0 NOT NULL,
	"errors" integer DEFAULT 0 NOT NULL,
	"error_details" text,
	"chunk_size" integer DEFAULT 10 NOT NULL,
	"total_invoices" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "communications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"channel" "communication_channel" NOT NULL,
	"subject" text,
	"body" text,
	"status" "communication_status" DEFAULT 'pending' NOT NULL,
	"sent_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dlq_entries" (
	"invoice_id" uuid PRIMARY KEY NOT NULL,
	"tenant_id" uuid NOT NULL,
	"consecutive_failures" integer DEFAULT 1 NOT NULL,
	"last_error" text,
	"last_error_display" text,
	"last_error_technical" text,
	"first_failure" timestamp with time zone DEFAULT now() NOT NULL,
	"last_failure" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" text DEFAULT 'invoice' NOT NULL,
	"entity_id" uuid NOT NULL,
	"actor_id" uuid,
	"actor_name" text,
	"actor_email" text,
	"actor_role" text,
	"action_type" text DEFAULT 'legacy.event' NOT NULL,
	"description" text,
	"source" text DEFAULT 'system' NOT NULL,
	"old_values" jsonb,
	"new_values" jsonb,
	"event_type" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inbound_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid,
	"sender" text NOT NULL,
	"subject" text,
	"body" text,
	"classification" text,
	"confidence" numeric(4, 3),
	"suggested_response" text,
	"reasoning" text,
	"status" "inbound_email_status" DEFAULT 'pending_review' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" text DEFAULT 'email' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_payment_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"provider_payment_link_id" text NOT NULL,
	"provider_order_id" text,
	"payment_url" text NOT NULL,
	"status" "payment_link_status" DEFAULT 'active' NOT NULL,
	"amount" numeric(14, 2) NOT NULL,
	"currency" text NOT NULL,
	"metadata" jsonb,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_portal_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"revoked_at" timestamp with time zone,
	"viewed_at" timestamp with time zone,
	CONSTRAINT "invoice_portal_links_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_no" text NOT NULL,
	"client_name" text NOT NULL,
	"invoice_amount" numeric(14, 2) NOT NULL,
	"currency" text DEFAULT 'INR' NOT NULL,
	"due_date" date NOT NULL,
	"contact_email" text NOT NULL,
	"subject" text,
	"payment_status" "payment_status" DEFAULT 'Pending' NOT NULL,
	"followup_count" integer DEFAULT 0 NOT NULL,
	"last_followup_date" timestamp with time zone,
	"external_ref_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"has_active_payment_plan" boolean DEFAULT false NOT NULL,
	"payment_status_changed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "payment_plan_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"invoice_id" uuid NOT NULL,
	"installments" integer NOT NULL,
	"proposed_amount_per_month" numeric(14, 2) NOT NULL,
	"reason" text,
	"status" "payment_plan_status" DEFAULT 'pending' NOT NULL,
	"reviewed_by" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_webhook_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"external_event_id" text NOT NULL,
	"payment_id" text,
	"invoice_id" uuid,
	"status" text NOT NULL,
	"raw_payload" jsonb,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "team_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"token_hash" text NOT NULL,
	"invited_by_user_id" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"delivery_status" text DEFAULT 'pending' NOT NULL,
	"delivery_error" text,
	"last_sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "team_invitations_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "tenant_integrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"provider" "integration_provider" NOT NULL,
	"ciphertext" text NOT NULL,
	"iv" text NOT NULL,
	"auth_tag" text NOT NULL,
	"key_version" integer DEFAULT 1 NOT NULL,
	"last_validated_at" timestamp with time zone,
	"last_validation_result" "validation_result" DEFAULT 'unknown' NOT NULL,
	"last_operational_error_code" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenant_integrations_tenant_provider_uniq" UNIQUE("tenant_id","provider")
);
--> statement-breakpoint
CREATE TABLE "tenant_settings" (
	"tenant_id" uuid PRIMARY KEY NOT NULL,
	"company_name" text DEFAULT 'Company' NOT NULL,
	"sender_name" text NOT NULL,
	"sender_email" text NOT NULL,
	"reply_to" text,
	"payment_link" text,
	"bank_details" text,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"schedule_hour" integer DEFAULT 9 NOT NULL,
	"idempotency_window_hours" integer DEFAULT 20 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"default_email_provider" "default_email_provider",
	"webhook_token" text,
	"skip_payment_warning" boolean DEFAULT false NOT NULL,
	"auto_purge_enabled" boolean DEFAULT false NOT NULL,
	"auto_purge_days" integer DEFAULT 30 NOT NULL,
	"dlq_threshold" integer DEFAULT 3 NOT NULL,
	"mfa_required" boolean DEFAULT false NOT NULL,
	"dns_verified_at" timestamp with time zone,
	"inbound_blocked_by_admin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "tenant_settings_webhook_token_unique" UNIQUE("webhook_token")
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
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
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_webhook_events" ADD CONSTRAINT "payment_webhook_events_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
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
CREATE INDEX "events_entity_audit_idx" ON "events" USING btree ("tenant_id","entity_type","entity_id","created_at");--> statement-breakpoint
CREATE INDEX "events_actor_id_idx" ON "events" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "events_action_type_idx" ON "events" USING btree ("tenant_id","action_type","created_at");--> statement-breakpoint
CREATE INDEX "events_source_idx" ON "events" USING btree ("tenant_id","source","created_at");--> statement-breakpoint
CREATE INDEX "events_payload_run_id_idx" ON "events" USING btree (("payload"->>'runId'));--> statement-breakpoint
CREATE INDEX "inbound_emails_tenant_id_status_idx" ON "inbound_emails" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "inbound_emails_invoice_id_idx" ON "inbound_emails" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_payment_links_tenant_invoice_provider_active_uniq" ON "invoice_payment_links" USING btree ("tenant_id","invoice_id","provider") WHERE "invoice_payment_links"."status" = 'active';--> statement-breakpoint
CREATE INDEX "invoice_payment_links_tenant_id_idx" ON "invoice_payment_links" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "invoice_payment_links_invoice_id_idx" ON "invoice_payment_links" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_payment_links_provider_link_id_idx" ON "invoice_payment_links" USING btree ("provider_payment_link_id");--> statement-breakpoint
CREATE INDEX "invoice_portal_links_token_hash_idx" ON "invoice_portal_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invoice_portal_links_invoice_id_idx" ON "invoice_portal_links" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "invoices_invoice_no_tenant_id_uniq" ON "invoices" USING btree ("invoice_no","tenant_id");--> statement-breakpoint
CREATE INDEX "invoices_tenant_id_payment_status_idx" ON "invoices" USING btree ("tenant_id","payment_status");--> statement-breakpoint
CREATE INDEX "invoices_external_ref_id_idx" ON "invoices" USING btree ("external_ref_id");--> statement-breakpoint
CREATE INDEX "payment_plan_requests_tenant_id_status_idx" ON "payment_plan_requests" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "payment_plan_requests_invoice_id_idx" ON "payment_plan_requests" USING btree ("invoice_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_webhook_events_tenant_provider_external_event_uniq" ON "payment_webhook_events" USING btree ("tenant_id","provider","external_event_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_tenant_id_idx" ON "payment_webhook_events" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_invoice_id_idx" ON "payment_webhook_events" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_webhook_events_payment_id_idx" ON "payment_webhook_events" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_tenant_id_uniq" ON "users" USING btree ("email","tenant_id");