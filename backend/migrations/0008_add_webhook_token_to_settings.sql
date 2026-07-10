-- Add webhook_token to tenant_settings
ALTER TABLE tenant_settings ADD COLUMN webhook_token TEXT;

-- Backfill existing rows with random tokens
UPDATE tenant_settings SET webhook_token = md5(random()::text || clock_timestamp()::text) WHERE webhook_token IS NULL;

-- Enforce UNIQUE constraint after backfill
ALTER TABLE tenant_settings ADD CONSTRAINT tenant_settings_webhook_token_unique UNIQUE (webhook_token);
