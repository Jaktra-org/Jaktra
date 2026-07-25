CREATE TABLE IF NOT EXISTS "invoice_portal_links" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" uuid NOT NULL REFERENCES "tenants"("id") ON DELETE CASCADE,
  "invoice_id" uuid NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE,
  "token_hash" text NOT NULL UNIQUE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "revoked_at" timestamp with time zone,
  "viewed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_portal_links_token_hash_idx" ON "invoice_portal_links" ("token_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "invoice_portal_links_invoice_id_idx" ON "invoice_portal_links" ("invoice_id");
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "has_active_payment_plan" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "payment_status_changed_at" timestamp with time zone;
--> statement-breakpoint
UPDATE "invoices" SET "payment_status_changed_at" = "updated_at" WHERE "payment_status_changed_at" IS NULL;
--> statement-breakpoint
ALTER TABLE "inbound_emails" ADD COLUMN IF NOT EXISTS "source" text DEFAULT 'email' NOT NULL;
