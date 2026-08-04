variable "project_name" {
  type    = string
  default = "jaktra"
}

variable "environment" {
  type    = string
  default = "dev"
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
  default = false
}

variable "ssh_public_key" {
  type        = string
  description = "Content of your SSH public key. Generate: ssh-keygen -t rsa -b 4096 -f ~/.ssh/jaktra-dev && cat ~/.ssh/jaktra-dev.pub"
}

variable "ssh_allowed_cidr" {
  type        = string
  default     = "0.0.0.0/0"
  description = "Restrict SSH to your IP for security: \"YOUR_PUBLIC_IP/32\""
}

variable "alert_email" {
  type    = string
  default = ""
}
