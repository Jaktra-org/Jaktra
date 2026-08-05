variable "project_name" {
  type    = string
  default = "jaktra"
}

variable "environment" {
  type    = string
  default = "production"
}

variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "github_org" {
  type = string
}

variable "github_repo" {
  type = string
}

variable "create_github_oidc_provider" {
  type    = bool
  default = true
}

variable "domain_name" {
  type    = string
  default = ""
}

variable "api_subdomain" {
  type    = string
  default = "api"
}

variable "alert_email" {
  type    = string
  default = ""
}
