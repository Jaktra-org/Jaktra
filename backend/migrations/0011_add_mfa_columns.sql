-- Migration: 0011_add_mfa_columns
-- Adds TOTP-based MFA fields to users table and mfaRequired flag to tenant_settings.
-- All mfa_secret_* columns mirror the encrypted-credential shape used in tenant_integrations.

ALTER TABLE "users"
  ADD COLUMN "mfa_enabled" boolean NOT NULL DEFAULT false,
  ADD COLUMN "mfa_secret" text,
  ADD COLUMN "mfa_secret_iv" text,
  ADD COLUMN "mfa_secret_auth_tag" text,
  ADD COLUMN "mfa_secret_key_version" integer,
  ADD COLUMN "mfa_backup_codes" text,
  ADD COLUMN "mfa_last_used_step" integer;

ALTER TABLE "tenant_settings"
  ADD COLUMN "mfa_required" boolean NOT NULL DEFAULT false;
