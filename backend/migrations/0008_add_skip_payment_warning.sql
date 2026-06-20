-- Add skip_payment_warning preference to tenant_settings
-- When true, the UI will skip showing the "no payment integration" warning modal
ALTER TABLE tenant_settings
  ADD COLUMN skip_payment_warning BOOLEAN NOT NULL DEFAULT FALSE;
