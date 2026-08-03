variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "enable_alarms" {
  type    = bool
  default = true
}

variable "cluster_name" {
  type    = string
  default = ""
}

variable "backend_service_name" {
  type    = string
  default = ""
}

variable "ai_service_service_name" {
  type    = string
  default = ""
}

variable "alb_arn_suffix" {
  type    = string
  default = ""
}

variable "alert_email" {
  type    = string
  default = ""
}

variable "cpu_alarm_threshold" {
  type    = number
  default = 80
}

variable "ai_service_cpu_threshold" {
  type    = number
  default = 85
}

variable "memory_alarm_threshold" {
  type    = number
  default = 85
}

variable "budget_limit_usd" {
  type    = number
  default = 50
}
