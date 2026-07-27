CREATE TYPE "public"."inbound_email_status" AS ENUM('pending_review', 'approved', 'discarded');--> statement-breakpoint
CREATE TYPE "public"."payment_plan_status" AS ENUM('pending', 'approved', 'denied', 'cancelled');--> statement-breakpoint
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
ALTER TABLE "agent_runs" ADD COLUMN "chunk_size" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_runs" ADD COLUMN "total_invoices" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "has_active_payment_plan" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "payment_status_changed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "dns_verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN "inbound_blocked_by_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "agent_run_chunks" ADD CONSTRAINT "agent_run_chunks_run_id_agent_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."agent_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_run_chunks" ADD CONSTRAINT "agent_run_chunks_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_portal_links" ADD CONSTRAINT "invoice_portal_links_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoice_portal_links" ADD CONSTRAINT "invoice_portal_links_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "agent_run_chunks_run_id_idx" ON "agent_run_chunks" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "agent_run_chunks_tenant_status_idx" ON "agent_run_chunks" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "inbound_emails_tenant_id_status_idx" ON "inbound_emails" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "inbound_emails_invoice_id_idx" ON "inbound_emails" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "invoice_portal_links_token_hash_idx" ON "invoice_portal_links" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "invoice_portal_links_invoice_id_idx" ON "invoice_portal_links" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "payment_plan_requests_tenant_id_status_idx" ON "payment_plan_requests" USING btree ("tenant_id","status");--> statement-breakpoint
CREATE INDEX "payment_plan_requests_invoice_id_idx" ON "payment_plan_requests" USING btree ("invoice_id");