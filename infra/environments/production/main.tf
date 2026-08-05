locals {
  env  = var.environment
  name = "${var.project_name}-${var.environment}"

  api_base_url = var.domain_name != "" ? (
    "https://${var.api_subdomain}.${var.domain_name}"
  ) : (
    "http://${module.alb.alb_dns_name}"
  )
}

data "terraform_remote_state" "base" {
  backend = "s3"
  config = {
    bucket         = "jaktra-terraform-state"
    key            = "base/terraform.tfstate"
    region         = var.aws_region
    dynamodb_table = "jaktra-terraform-locks"
  }
}

# Production-scoped NAT Gateway (created on deploy, destroyed on destroy to ensure $0 background cost)
resource "aws_eip" "nat" {
  domain = "vpc"
  tags   = { Name = "${local.name}-nat-eip" }
}

resource "aws_nat_gateway" "production" {
  allocation_id = aws_eip.nat.id
  subnet_id     = data.terraform_remote_state.base.outputs.public_subnet_ids[0]
  tags          = { Name = "${local.name}-nat" }
}

resource "aws_route" "production_private_nat" {
  route_table_id         = data.terraform_remote_state.base.outputs.private_route_table_id
  destination_cidr_block = "0.0.0.0/0"
  nat_gateway_id         = aws_nat_gateway.production.id
}

module "security_groups" {
  source = "../../modules/security_groups"

  project_name    = var.project_name
  environment     = var.environment
  vpc_id          = data.terraform_remote_state.base.outputs.vpc_id
  backend_port    = 3001
  ai_service_port = 8000
}

# Ingress rule dynamically added to RDS SG to allow access from ECS backend tasks
resource "aws_security_group_rule" "allow_backend_to_rds" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = data.terraform_remote_state.base.outputs.rds_security_group_id
  source_security_group_id = module.security_groups.backend_ecs_sg_id
}

module "iam" {
  source = "../../modules/iam"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  github_org   = var.github_org
  github_repo  = var.github_repo

  create_github_oidc_provider = var.create_github_oidc_provider

  backend_ecr_arn     = data.terraform_remote_state.base.outputs.backend_ecr_arn
  ai_service_ecr_arn  = data.terraform_remote_state.base.outputs.ai_service_ecr_arn
  frontend_bucket_arn = data.terraform_remote_state.base.outputs.frontend_bucket_arn
  cloudfront_arn      = data.terraform_remote_state.base.outputs.cloudfront_distribution_arn

  backend_secret_path_prefix = "${var.project_name}/${var.environment}"
}

module "alb" {
  source = "../../modules/alb"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = data.terraform_remote_state.base.outputs.vpc_id
  public_subnet_ids = data.terraform_remote_state.base.outputs.public_subnet_ids
  alb_sg_id         = module.security_groups.alb_sg_id
  backend_port      = 3001
  health_check_path = "/api/health"
  certificate_arn   = data.terraform_remote_state.base.outputs.api_cert_arn
}

module "ecs" {
  source = "../../modules/ecs"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region

  vpc_id           = data.terraform_remote_state.base.outputs.vpc_id
  task_subnet_ids  = data.terraform_remote_state.base.outputs.private_subnet_ids
  backend_sg_id    = module.security_groups.backend_ecs_sg_id
  ai_service_sg_id = module.security_groups.ai_service_ecs_sg_id
  assign_public_ip = false

  task_execution_role_arn  = module.iam.ecs_task_execution_role_arn
  backend_task_role_arn    = module.iam.backend_task_role_arn
  ai_service_task_role_arn = module.iam.ai_service_task_role_arn

  backend_ecr_url    = data.terraform_remote_state.base.outputs.backend_ecr_url
  ai_service_ecr_url = data.terraform_remote_state.base.outputs.ai_service_ecr_url

  backend_secrets_map    = data.terraform_remote_state.base.outputs.production_backend_secrets_map
  ai_service_secrets_map = data.terraform_remote_state.base.outputs.production_ai_service_secrets_map

  backend_tg_arn    = module.alb.backend_tg_arn
  http_listener_arn = module.alb.http_listener_arn

  backend_cpu    = 256
  backend_memory = 512
  ai_service_cpu    = 512
  ai_service_memory = 1024

  backend_desired_count    = 1
  ai_service_desired_count = 1

  enable_container_insights = true
  backend_use_spot          = false
  log_retention_days        = 14
}

module "cloudwatch" {
  source = "../../modules/cloudwatch"

  project_name            = var.project_name
  environment             = var.environment
  aws_region              = var.aws_region
  enable_alarms           = true
  cluster_name            = module.ecs.cluster_name
  backend_service_name    = module.ecs.backend_service_name
  ai_service_service_name = module.ecs.ai_service_service_name
  alb_arn_suffix          = module.alb.alb_arn_suffix
  alert_email             = var.alert_email
  cpu_alarm_threshold     = 80
  memory_alarm_threshold  = 85
}
