-- Migration: 0014_resend_inbound_and_reply_features.sql
-- Add inbound domain, parse verification, webhook URL, reply mode, and mailbox OTP fields to email_integration_resend table

ALTER TABLE `email_integration_resend`
  MODIFY COLUMN `ciphertext` text NULL,
  MODIFY COLUMN `iv` varchar(64) NULL,
  MODIFY COLUMN `auth_tag` varchar(64) NULL,
  ADD COLUMN `inbound_domain` varchar(255) DEFAULT NULL,
  ADD COLUMN `inbound_parse_verified` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN `webhook_url` varchar(512) DEFAULT NULL,
  ADD COLUMN `reply_mode` enum('real_mailbox','webhook_only') NOT NULL DEFAULT 'webhook_only',
  ADD COLUMN `reply_mailbox_email` varchar(255) DEFAULT NULL,
  ADD COLUMN `reply_mailbox_verified` tinyint(1) NOT NULL DEFAULT 0,
  ADD COLUMN `reply_mailbox_otp_code` varchar(6) DEFAULT NULL,
  ADD COLUMN `reply_mailbox_otp_expires_at` datetime DEFAULT NULL;
