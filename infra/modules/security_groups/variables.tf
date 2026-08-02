variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
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
