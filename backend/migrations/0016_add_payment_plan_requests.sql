CREATE TYPE "public"."payment_plan_status" AS ENUM('pending', 'approved', 'denied', 'cancelled');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payment_plan_requests" (
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
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payment_plan_requests" ADD CONSTRAINT "payment_plan_requests_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_plan_requests_tenant_id_status_idx" ON "payment_plan_requests" ("tenant_id", "status");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payment_plan_requests_invoice_id_idx" ON "payment_plan_requests" ("invoice_id");
