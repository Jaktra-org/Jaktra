CREATE TYPE "public"."inbound_email_status" AS ENUM('pending_review', 'approved', 'discarded');

CREATE TABLE IF NOT EXISTS "inbound_emails" (
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
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE "tenant_settings" ADD COLUMN "inbound_parse_active" boolean DEFAULT false NOT NULL;

ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "inbound_emails" ADD CONSTRAINT "inbound_emails_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

CREATE INDEX IF NOT EXISTS "inbound_emails_tenant_id_status_idx" ON "inbound_emails" ("tenant_id", "status");
CREATE INDEX IF NOT EXISTS "inbound_emails_invoice_id_idx" ON "inbound_emails" ("invoice_id");
