locals {
  name_prefix   = "${var.project_name}-${var.environment}"
  secret_prefix = "${var.project_name}/${var.environment}"
}

resource "aws_secretsmanager_secret" "backend" {
  name                    = "${local.secret_prefix}/backend"
  description             = "Runtime env vars for the ${local.name_prefix} backend"
  recovery_window_in_days = var.recovery_window_in_days

  tags = { Name = "${local.name_prefix}-backend-secret" }
}

resource "aws_secretsmanager_secret_version" "backend" {
  secret_id = aws_secretsmanager_secret.backend.id

  secret_string = jsonencode({
    DATABASE_URL                  = var.database_url
    JWT_SECRET                    = var.jwt_secret
    ENCRYPTION_KEY                = var.encryption_key
    SENDGRID_API_KEY              = var.sendgrid_api_key
    SENDGRID_WEBHOOK_PUBLIC_KEY   = var.sendgrid_webhook_public_key
    STRIPE_WEBHOOK_SECRET         = var.stripe_webhook_secret
    RAZORPAY_WEBHOOK_SECRET       = var.razorpay_webhook_secret
    SENDGRID_INBOUND_PARSE_SECRET = var.sendgrid_inbound_parse_secret
    INBOUND_PARSE_DOMAIN          = var.inbound_parse_domain
    AI_ML_SERVICE_KEY             = var.ai_ml_service_key
    CORS_ORIGINS                  = var.cors_origins
    FRONTEND_URL                  = var.frontend_url
    PLATFORM_SMTP_URL             = var.platform_smtp_url
    PLATFORM_EMAIL_PROVIDER       = var.platform_email_provider
  })

  # lifecycle {
  #   # Allow manual secret updates in AWS console/CLI without Terraform overwriting on apply
  #   ignore_changes = [secret_string]
  # }
}

resource "aws_secretsmanager_secret" "ai_service" {
  name                    = "${local.secret_prefix}/ai-service"
  description             = "Runtime env vars for the ${local.name_prefix} ai-service"
  recovery_window_in_days = var.recovery_window_in_days

  tags = { Name = "${local.name_prefix}-ai-service-secret" }
}

resource "aws_secretsmanager_secret_version" "ai_service" {
  secret_id = aws_secretsmanager_secret.ai_service.id

  secret_string = jsonencode({
    LLM_API_KEY   = var.llm_api_key
    SERVICE_KEY   = var.ai_ml_service_key
  })

  # lifecycle {
  #   ignore_changes = [secret_string]
  # }
}

locals {
  backend_arn    = aws_secretsmanager_secret.backend.arn
  ai_service_arn = aws_secretsmanager_secret.ai_service.arn

  backend_secrets_map = {
    DATABASE_URL                  = "${local.backend_arn}:DATABASE_URL::"
    JWT_SECRET                    = "${local.backend_arn}:JWT_SECRET::"
    ENCRYPTION_KEY                = "${local.backend_arn}:ENCRYPTION_KEY::"
    SENDGRID_API_KEY              = "${local.backend_arn}:SENDGRID_API_KEY::"
    SENDGRID_WEBHOOK_PUBLIC_KEY   = "${local.backend_arn}:SENDGRID_WEBHOOK_PUBLIC_KEY::"
    STRIPE_WEBHOOK_SECRET         = "${local.backend_arn}:STRIPE_WEBHOOK_SECRET::"
    RAZORPAY_WEBHOOK_SECRET       = "${local.backend_arn}:RAZORPAY_WEBHOOK_SECRET::"
    SENDGRID_INBOUND_PARSE_SECRET = "${local.backend_arn}:SENDGRID_INBOUND_PARSE_SECRET::"
    INBOUND_PARSE_DOMAIN          = "${local.backend_arn}:INBOUND_PARSE_DOMAIN::"
    AI_ML_SERVICE_KEY             = "${local.backend_arn}:AI_ML_SERVICE_KEY::"
    CORS_ORIGINS                  = "${local.backend_arn}:CORS_ORIGINS::"
    FRONTEND_URL                  = "${local.backend_arn}:FRONTEND_URL::"
    PLATFORM_SMTP_URL             = "${local.backend_arn}:PLATFORM_SMTP_URL::"
    PLATFORM_EMAIL_PROVIDER       = "${local.backend_arn}:PLATFORM_EMAIL_PROVIDER::"
  }

  ai_service_secrets_map = {
    LLM_API_KEY  = "${local.ai_service_arn}:LLM_API_KEY::"
    SERVICE_KEY  = "${local.ai_service_arn}:SERVICE_KEY::"
  }
}
