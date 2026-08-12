-- 1. Extend emailProviderEnum on email_integrations table
ALTER TABLE `email_integrations`
  MODIFY COLUMN `provider` enum('sendgrid','smtp','resend') NOT NULL;

-- 2. Create the Resend integration detail table
CREATE TABLE IF NOT EXISTS `email_integration_resend` (
  `id` varchar(36) NOT NULL,
  `integration_id` varchar(36) NOT NULL,
  `ciphertext` text NOT NULL,
  `iv` varchar(64) NOT NULL,
  `auth_tag` varchar(64) NOT NULL,
  `key_version` int NOT NULL DEFAULT 1,
  `last_validation_result` enum('valid','invalid','untested') NOT NULL DEFAULT 'untested',
  `last_validated_at` datetime DEFAULT NULL,
  CONSTRAINT `email_integration_resend_id` PRIMARY KEY (`id`),
  CONSTRAINT `unq_resend_integration_id` UNIQUE (`integration_id`),
  CONSTRAINT `fk_resend_email_integration` FOREIGN KEY (`integration_id`) 
    REFERENCES `email_integrations` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);
