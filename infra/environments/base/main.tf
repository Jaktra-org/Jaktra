locals {
  name = "${var.project_name}-${var.environment}"

  cloudfront_aliases  = var.domain_name != "" ? [var.domain_name, "www.${var.domain_name}"] : []
  frontend_cert_arn   = var.domain_name != "" ? aws_acm_certificate_validation.frontend[0].certificate_arn : ""

  has_dev_secrets  = fileexists("${path.module}/secrets.dev.json")
  has_prod_secrets = fileexists("${path.module}/secrets.production.json")

  secrets_dev  = local.has_dev_secrets ? jsondecode(file("${path.module}/secrets.dev.json")) : null
  secrets_prod = local.has_prod_secrets ? jsondecode(file("${path.module}/secrets.production.json")) : null

  database_password = try(local.secrets_prod.database_password, try(local.secrets_dev.database_password, "placeholder_password"))
}

resource "aws_acm_certificate" "frontend" {
  count    = var.domain_name != "" ? 1 : 0
  provider = aws.us_east_1

  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
  validation_method         = "DNS"
  lifecycle { create_before_destroy = true }

  tags = { Name = "${local.name}-frontend-cert" }
}

resource "aws_acm_certificate_validation" "frontend" {
  count    = var.domain_name != "" ? 1 : 0
  provider = aws.us_east_1

  certificate_arn = aws_acm_certificate.frontend[0].arn
  timeouts { create = "10m" }
}

resource "aws_acm_certificate" "api" {
  count = var.domain_name != "" ? 1 : 0

  domain_name       = "${var.api_subdomain}.${var.domain_name}"
  validation_method = "DNS"
  lifecycle { create_before_destroy = true }

  tags = { Name = "${local.name}-api-cert" }
}

resource "aws_acm_certificate_validation" "api" {
  count = var.domain_name != "" ? 1 : 0

  certificate_arn = aws_acm_certificate.api[0].arn
  timeouts { create = "10m" }
}

module "vpc" {
  source = "../../modules/vpc"

  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs

  enable_nat_gateway = var.enable_nat_gateway
  enable_flow_logs   = true
}

module "ecr" {
  source = "../../modules/ecr"

  project_name        = var.project_name
  environment         = var.environment
  repository_names    = ["backend", "ai-service"]
  image_count_to_keep = 2
}

module "s3_cloudfront" {
  source = "../../modules/s3_cloudfront"

  project_name           = var.project_name
  environment            = var.environment
  cloudfront_price_class = "PriceClass_200"
  certificate_arn        = local.frontend_cert_arn
  domain_aliases         = local.cloudfront_aliases
  alb_domain_name        = var.alb_domain_name
}

module "rds" {
  source = "../../modules/rds"

  project_name = var.project_name
  environment  = var.environment

  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.private_subnet_ids
  instance_class      = var.rds_instance_class
  allocated_storage   = var.rds_allocated_storage
  database_name       = var.database_name
  database_username   = var.database_username
  database_password   = local.database_password
  deletion_protection = var.rds_deletion_protection
  skip_final_snapshot = false

  allowed_security_group_ids = []
}

module "secrets_dev" {
  count  = local.has_dev_secrets ? 1 : 0
  source = "../../modules/secrets"

  project_name            = var.project_name
  environment             = "dev"
  recovery_window_in_days = 0

  database_url                  = module.rds.connection_url
  jwt_secret                    = try(local.secrets_dev.jwt_secret, "")
  encryption_key                = try(local.secrets_dev.encryption_key, "")
  sendgrid_api_key              = try(local.secrets_dev.sendgrid_api_key, "REPLACE_ME")
  sendgrid_webhook_public_key   = try(local.secrets_dev.sendgrid_webhook_public_key, "REPLACE_ME")
  stripe_webhook_secret         = try(local.secrets_dev.stripe_webhook_secret, "REPLACE_ME")
  razorpay_webhook_secret       = try(local.secrets_dev.razorpay_webhook_secret, "REPLACE_ME")
  sendgrid_inbound_parse_secret = try(local.secrets_dev.sendgrid_inbound_parse_secret, "REPLACE_ME")
  inbound_parse_domain          = try(local.secrets_dev.inbound_parse_domain, "REPLACE_ME")
  ai_ml_service_key             = try(local.secrets_dev.ai_ml_service_key, "")
  cors_origins                  = try(local.secrets_dev.cors_origins, "")
  frontend_url                  = var.domain_name != "" ? "https://${var.domain_name}" : module.s3_cloudfront.frontend_url
  platform_smtp_url             = try(local.secrets_dev.platform_smtp_url, "REPLACE_ME")
  platform_email_provider       = try(local.secrets_dev.platform_email_provider, "smtp")

  llm_api_key  = try(local.secrets_dev.llm_api_key, "")
  llm_provider = try(local.secrets_dev.llm_provider, "groq")
  llm_model    = try(local.secrets_dev.llm_model, "llama-3.1-8b-instant")
}

module "secrets_production" {
  count  = local.has_prod_secrets ? 1 : 0
  source = "../../modules/secrets"

  project_name            = var.project_name
  environment             = "production"
  recovery_window_in_days = 0

  database_url                  = module.rds.connection_url
  jwt_secret                    = try(local.secrets_prod.jwt_secret, "")
  encryption_key                = try(local.secrets_prod.encryption_key, "")
  sendgrid_api_key              = try(local.secrets_prod.sendgrid_api_key, "REPLACE_ME")
  sendgrid_webhook_public_key   = try(local.secrets_prod.sendgrid_webhook_public_key, "REPLACE_ME")
  stripe_webhook_secret         = try(local.secrets_prod.stripe_webhook_secret, "REPLACE_ME")
  razorpay_webhook_secret       = try(local.secrets_prod.razorpay_webhook_secret, "REPLACE_ME")
  sendgrid_inbound_parse_secret = try(local.secrets_prod.sendgrid_inbound_parse_secret, "REPLACE_ME")
  inbound_parse_domain          = try(local.secrets_prod.inbound_parse_domain, "REPLACE_ME")
  ai_ml_service_key             = try(local.secrets_prod.ai_ml_service_key, "")
  cors_origins                  = try(local.secrets_prod.cors_origins, "")
  frontend_url                  = var.domain_name != "" ? "https://${var.domain_name}" : module.s3_cloudfront.frontend_url
  platform_smtp_url             = try(local.secrets_prod.platform_smtp_url, "REPLACE_ME")
  platform_email_provider       = try(local.secrets_prod.platform_email_provider, "smtp")

  llm_api_key  = try(local.secrets_prod.llm_api_key, "")
  llm_provider = try(local.secrets_prod.llm_provider, "groq")
  llm_model    = try(local.secrets_prod.llm_model, "llama-3.1-8b-instant")
}

