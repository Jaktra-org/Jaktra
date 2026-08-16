variable "project_name" {
  type        = string
  description = "Project name prefix for resources"
  default     = "jaktra"
}

variable "environment" {
  type        = string
  description = "Environment name"
  default     = "free-tier"
}


variable "vercel_api_token" {
  type        = string
  description = "Vercel API Token (from Vercel Account Settings -> Tokens)"
  sensitive   = true
}

variable "vercel_team_id" {
  type        = string
  description = "Vercel Team / Org ID (optional if using personal account)"
  default     = null
}

variable "github_repo" {
  type        = string
  description = "GitHub repository in the format org/repo (e.g. your-org/Jaktra)"
  default     = "Jaktra-org/Jaktra"
}


variable "upstash_email" {
  type        = string
  description = "Upstash account email"
}

variable "upstash_api_key" {
  type        = string
  description = "Upstash API Key (from Upstash Console -> Account -> API Key)"
  sensitive   = true
}

variable "upstash_region" {
  type        = string
  description = "Upstash Redis primary region"
  default     = "ap-south-1" # Mumbai
}


variable "render_api_key" {
  type        = string
  description = "Render API Key (from Render Dashboard -> Account Settings -> API Keys)"
  sensitive   = true
}

variable "render_owner_id" {
  type        = string
  description = "Render Workspace / Owner ID"
}

variable "render_region" {
  type        = string
  description = "Render service region (singapore, oregon, frankfurt, ohio)"
  default     = "singapore"
}


variable "neon_database_url" {
  type        = string
  description = "External PostgreSQL Connection URL from Neon Tech"
  sensitive   = true
}

variable "jwt_secret" {
  type        = string
  description = "JWT Signing secret (min 32 chars)"
  sensitive   = true
}

variable "jwt_expires_in" {
  type        = string
  description = "JWT Token expiry"
  default     = "7d"
}

variable "ai_ml_service_key" {
  type        = string
  description = "Shared service key between backend and AI service"
  sensitive   = true
}

variable "groq_api_key" {
  type        = string
  description = "Groq LLM API Key for AI Service"
  sensitive   = true
}

variable "llm_model" {
  type        = string
  description = "LLM Model to use in AI Service"
  default     = "llama-3.1-8b-instant"
}

variable "platform_email_provider" {
  type        = string
  description = "Email provider: resend, sendgrid, or smtp"
  default     = "resend"
}

variable "platform_resend_api_key" {
  type        = string
  description = "Resend API key"
  sensitive   = true
  default     = ""
}

variable "platform_sendgrid_api_key" {
  type        = string
  description = "SendGrid API key"
  sensitive   = true
  default     = ""
}

variable "platform_smtp_url" {
  type        = string
  description = "SMTP URL for email"
  sensitive   = true
  default     = ""
}

variable "platform_smtp_password" {
  type        = string
  description = "SMTP password"
  sensitive   = true
  default     = ""
}

variable "platform_from_email" {
  type        = string
  description = "Sender email address"
  default     = "no-reply@jaktra.site"
}

variable "platform_from_name" {
  type        = string
  description = "Sender name"
  default     = "Jaktra"
}

variable "sendgrid_inbound_parse_secret" {
  type        = string
  description = "Inbound parse webhook secret"
  sensitive   = true
  default     = ""
}

variable "encryption_key" {
  type        = string
  description = "32-byte Base64 encryption key"
  sensitive   = true
}
