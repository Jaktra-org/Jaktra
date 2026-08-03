variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_id" {
  type = string
}

variable "ssh_public_key" {
  type        = string
  description = "Public key content for SSH access to the dev EC2 instance."
}

variable "ssh_allowed_cidr" {
  type    = string
  default = "0.0.0.0/0"
}

variable "instance_type" {
  type    = string
  default = "t3.micro"
}

variable "backend_ecr_url" {
  type = string
}

variable "ai_service_ecr_url" {
  type = string
}

variable "backend_secret_id" {
  type = string
}

variable "ai_service_secret_id" {
  type = string
}

variable "backend_port" {
  type    = number
  default = 3001
}

variable "ai_service_port" {
  type    = number
  default = 8000
}
