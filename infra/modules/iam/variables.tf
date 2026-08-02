variable "project_name" { type = string }
variable "environment"  { type = string }
variable "aws_region"   { type = string }

variable "github_org"  { type = string }
variable "github_repo" { type = string }

variable "create_github_oidc_provider" {
  type    = bool
  default = true
}

variable "backend_ecr_arn"     { type = string }
variable "ai_service_ecr_arn"  { type = string }
variable "frontend_bucket_arn" { type = string }
variable "cloudfront_arn"      { type = string }

variable "backend_secret_path_prefix" {
  type = string
}
