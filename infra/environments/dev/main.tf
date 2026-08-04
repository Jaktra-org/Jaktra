locals {
  name         = "${var.project_name}-${var.environment}"
  backend_url  = "http://${module.ec2.public_ip}:3001"
  frontend_url = data.terraform_remote_state.base.outputs.frontend_bucket_arn # Or read from output
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

resource "aws_security_group_rule" "allow_backend_to_rds" {
  type                     = "ingress"
  from_port                = 3306
  to_port                  = 3306
  protocol                 = "tcp"
  security_group_id        = data.terraform_remote_state.base.outputs.rds_security_group_id
  source_security_group_id = module.ec2.ec2_sg_id
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

module "ec2" {
  source = "../../modules/ec2_dev"

  project_name = var.project_name
  environment  = var.environment
  aws_region   = var.aws_region
  vpc_id       = data.terraform_remote_state.base.outputs.vpc_id
  subnet_id    = data.terraform_remote_state.base.outputs.public_subnet_ids[0]

  instance_type    = "t3.micro"
  ssh_public_key   = var.ssh_public_key
  ssh_allowed_cidr = var.ssh_allowed_cidr

  backend_ecr_url    = data.terraform_remote_state.base.outputs.backend_ecr_url
  ai_service_ecr_url = data.terraform_remote_state.base.outputs.ai_service_ecr_url

  backend_secret_id    = data.terraform_remote_state.base.outputs.dev_backend_secret_arn
  ai_service_secret_id = data.terraform_remote_state.base.outputs.dev_ai_service_secret_arn

  backend_port    = 3001
  ai_service_port = 8000
}

module "cloudwatch" {
  source = "../../modules/cloudwatch"

  project_name  = var.project_name
  environment   = var.environment
  aws_region    = var.aws_region
  enable_alarms = false
  alert_email   = var.alert_email
}
