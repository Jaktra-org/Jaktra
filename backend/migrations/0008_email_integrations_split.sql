DROP TABLE IF EXISTS `email_integration_sendgrid`;
--> statement-breakpoint
DROP TABLE IF EXISTS `email_integration_smtp`;
--> statement-breakpoint
DROP TABLE IF EXISTS `email_integrations`;
--> statement-breakpoint
CREATE TABLE `email_integrations` (
  `id` varchar(36) NOT NULL,
  `tenant_id` varchar(36) NOT NULL,
  `provider` enum('sendgrid','smtp') NOT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `sender_email` varchar(255) DEFAULT NULL,
  `reply_to` varchar(255) DEFAULT NULL,
  `overall_status` enum('not_configured','partially_configured','active') NOT NULL DEFAULT 'not_configured',
  `is_active` boolean NOT NULL DEFAULT false,
  `active_tenant_id` varchar(36) GENERATED ALWAYS AS (CASE WHEN `is_active` = 1 THEN `tenant_id` ELSE NULL END) VIRTUAL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unq_tenant_provider` (`tenant_id`, `provider`),
  UNIQUE KEY `unq_single_active_provider` (`active_tenant_id`),
  KEY `idx_email_integrations_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint
CREATE TABLE `email_integration_sendgrid` (
  `id` varchar(36) NOT NULL,
  `integration_id` varchar(36) NOT NULL,
  `ciphertext` text DEFAULT NULL,
  `iv` varchar(64) DEFAULT NULL,
  `auth_tag` varchar(64) DEFAULT NULL,
  `key_version` int NOT NULL DEFAULT 1,
  `inbound_domain` varchar(255) DEFAULT NULL,
  `inbound_parse_verified` boolean NOT NULL DEFAULT false,
  `webhook_url` varchar(512) DEFAULT NULL,
  `reply_mode` enum('real_mailbox','webhook_only') NOT NULL DEFAULT 'webhook_only',
  `reply_mailbox_email` varchar(255) DEFAULT NULL,
  `reply_mailbox_verified` boolean NOT NULL DEFAULT false,
  `reply_mailbox_otp_code` varchar(6) DEFAULT NULL,
  `reply_mailbox_otp_expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unq_sendgrid_integration_id` (`integration_id`),
  CONSTRAINT `fk_sendgrid_integration` FOREIGN KEY (`integration_id`) REFERENCES `email_integrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint
CREATE TABLE `email_integration_smtp` (
  `id` varchar(36) NOT NULL,
  `integration_id` varchar(36) NOT NULL,
  `host` varchar(255) NOT NULL,
  `port` int NOT NULL DEFAULT 587,
  `username` varchar(255) DEFAULT NULL,
  `ciphertext` text NOT NULL,
  `iv` varchar(64) NOT NULL,
  `auth_tag` varchar(64) NOT NULL,
  `key_version` int NOT NULL DEFAULT 1,
  `encryption_type` enum('tls','ssl','none') NOT NULL DEFAULT 'tls',
  `allow_self_signed` boolean NOT NULL DEFAULT false,
  `last_validation_result` enum('valid','invalid','untested') NOT NULL DEFAULT 'untested',
  `last_validated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unq_smtp_integration_id` (`integration_id`),
  CONSTRAINT `fk_smtp_integration` FOREIGN KEY (`integration_id`) REFERENCES `email_integrations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `default_email_provider`;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `reply_mode`;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `reply_mailbox_email`;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `reply_mailbox_verified`;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `reply_mailbox_otp`;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `reply_mailbox_otp_expires_at`;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `inbound_parse_verified`;
--> statement-breakpoint
ALTER TABLE `tenant_settings` DROP COLUMN IF EXISTS `inbound_domain`;

