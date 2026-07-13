ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "dns_verified_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "tenant_settings" ADD COLUMN IF NOT EXISTS "inbound_blocked_by_admin" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "tenant_settings" DROP COLUMN IF EXISTS "inbound_parse_active";
