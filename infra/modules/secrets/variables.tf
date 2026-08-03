variable "project_name" {
  type = string
}

variable "environment" {
  type = string
}

variable "recovery_window_in_days" {
  type    = number
  default = 7
}

variable "database_url" {
  type      = string
  sensitive = true
}

variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "encryption_key" {
  type      = string
  sensitive = true
}

variable "sendgrid_api_key" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

variable "sendgrid_webhook_public_key" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

variable "stripe_webhook_secret" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

variable "razorpay_webhook_secret" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

variable "sendgrid_inbound_parse_secret" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

variable "inbound_parse_domain" {
  type    = string
  default = "REPLACE_ME"
}

variable "ai_ml_service_key" {
  type      = string
  sensitive = true
}

variable "cors_origins" {
  type = string
}

variable "frontend_url" {
  type = string
}

variable "platform_smtp_url" {
  type      = string
  sensitive = true
  default   = "REPLACE_ME"
}

variable "platform_email_provider" {
  type    = string
  default = "smtp"
}

variable "llm_api_key" {
  type      = string
  sensitive = true
}

variable "llm_provider" {
  type    = string
  default = "groq"
}

variable "llm_model" {
  type    = string
  default = "llama-3.1-8b-instant"
}
