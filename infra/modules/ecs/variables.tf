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

variable "task_subnet_ids" {
  type        = list(string)
  description = "Subnets where ECS tasks are placed"
}

variable "backend_sg_id" {
  type = string
}

variable "ai_service_sg_id" {
  type = string
}

variable "assign_public_ip" {
  type    = bool
  default = false
}

variable "task_execution_role_arn" {
  type = string
}

variable "backend_task_role_arn" {
  type = string
}

variable "ai_service_task_role_arn" {
  type = string
}

variable "backend_ecr_url" {
  type = string
}

variable "ai_service_ecr_url" {
  type = string
}

variable "backend_image_tag" {
  type    = string
  default = "latest"
}

variable "ai_service_image_tag" {
  type    = string
  default = "latest"
}

variable "backend_secrets_map" {
  type = map(string)
}

variable "ai_service_secrets_map" {
  type = map(string)
}

variable "backend_tg_arn" {
  type = string
}

variable "http_listener_arn" {
  type = string
}

variable "backend_cpu" {
  type    = number
  default = 256
}

variable "backend_memory" {
  type    = number
  default = 512
}

variable "backend_port" {
  type    = number
  default = 3001
}

variable "backend_desired_count" {
  type    = number
  default = 1
}

variable "ai_service_cpu" {
  type    = number
  default = 512
}

variable "ai_service_memory" {
  type    = number
  default = 1024
}

variable "ai_service_port" {
  type    = number
  default = 8000
}

variable "ai_service_desired_count" {
  type    = number
  default = 1
}

variable "enable_container_insights" {
  type    = bool
  default = true
}

variable "backend_use_spot" {
  type    = bool
  default = false
}

variable "log_retention_days" {
  type    = number
  default = 14
}

variable "llm_model" {
  type    = string
  default = "llama-3.1-8b-instant"
}

variable "enable_execute_command" {
  type    = bool
  default = true
}
