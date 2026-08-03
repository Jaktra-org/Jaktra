variable "project_name" {
  type    = string
  default = "jaktra"
}

variable "environment" {
  type    = string
  default = "base"
}

variable "aws_region" {
  type    = string
  default = "ap-south-1"
}

variable "availability_zones" {
  type    = list(string)
  default = ["ap-south-1a", "ap-south-1b"]
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.1.0/24", "10.0.2.0/24"]
}

variable "private_subnet_cidrs" {
  type    = list(string)
  default = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "domain_name" {
  type    = string
  default = ""
}

variable "api_subdomain" {
  type    = string
  default = "api"
}

variable "database_name" {
  type    = string
  default = "jaktra"
}

variable "database_username" {
  type    = string
  default = "dbadmin"
}

variable "rds_instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  type    = number
  default = 20
}

variable "rds_deletion_protection" {
  type    = bool
  default = true
}

variable "alb_domain_name" {
  type        = string
  description = "Application Load Balancer domain name to route /api traffic to"
  default     = ""
}

variable "enable_nat_gateway" {
  type        = bool
  default     = false
  description = "Enable NAT Gateway in VPC (production manages its own NAT Gateway on deploy)"
}
