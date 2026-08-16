terraform {
  required_version = ">= 1.5.0"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
    render = {
      source  = "render-oss/render"
      version = "~> 1.3"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "~> 1.5"
    }
  }

  backend "local" {
    path = "terraform.tfstate"
  }
}


provider "vercel" {
  api_token = var.vercel_api_token
}

provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}

provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}


resource "upstash_redis_database" "redis" {
  count          = var.upstash_api_key != "" ? 1 : 0
  database_name  = "${var.project_name}-${var.environment}-redis"
  region         = "global"
  primary_region = var.upstash_region
  tls            = true
}

locals {
  github_repo_url = "https://github.com/${var.github_repo}"

  redis_url = length(upstash_redis_database.redis) > 0 ? (
    "rediss://default:${upstash_redis_database.redis[0].password}@${upstash_redis_database.redis[0].endpoint}:${upstash_redis_database.redis[0].port}"
  ) : "redis://localhost:6379"

  ai_service_url = length(render_web_service.ai_service) > 0 ? (
    "https://${render_web_service.ai_service[0].slug}.onrender.com"
  ) : "http://localhost:8000"

  backend_url = length(render_web_service.backend) > 0 ? (
    "https://${render_web_service.backend[0].slug}.onrender.com"
  ) : "http://localhost:3001"
}


resource "render_web_service" "ai_service" {
  count          = var.render_api_key != "" ? 1 : 0
  name           = "${var.project_name}-ai-service"
  plan           = "free"
  region         = var.render_region
  root_directory = "ai-service"
  start_command  = "uvicorn src.api.main:app --host 0.0.0.0 --port 8000"

  runtime_source = {
    docker = {
      repo_url        = local.github_repo_url
      branch          = "main"
      docker_context  = "."
      dockerfile_path = "Dockerfile"
    }
  }

  env_vars = {
    # Model Configuration (ai-service/.env)
    MODEL_NAME   = { value = "all-MiniLM-L6-v2" }
    MODEL_DEVICE = { value = "cpu" }

    # Groq API Configuration (ai-service/.env)
    LLM_API_KEY  = { value = var.groq_api_key }
    LLM_PROVIDER = { value = "groq" }
    LLM_MODEL    = { value = var.llm_model }

    # Service Configuration (ai-service/.env)
    SERVICE_KEY       = { value = var.ai_ml_service_key }
    AI_ML_SERVICE_KEY = { value = var.ai_ml_service_key }
    ENVIRONMENT       = { value = "production" }
    SERVICE_HOST      = { value = "0.0.0.0" }
    SERVICE_PORT      = { value = "8000" }
    LOG_LEVEL         = { value = "INFO" }
    LOG_FORMAT        = { value = "json" }
  }
}

# RENDER: Backend API 
resource "render_web_service" "backend" {
  count          = var.render_api_key != "" ? 1 : 0
  name           = "${var.project_name}-backend"
  plan           = "free"
  region         = var.render_region
  root_directory = "backend"
  start_command  = "node dist/index.js"

  runtime_source = {
    docker = {
      repo_url        = local.github_repo_url
      branch          = "main"
      docker_context  = "."
      dockerfile_path = "Dockerfile"
    }
  }

  env_vars = {
    # Core (backend/.env)
    PORT         = { value = "3001" }
    NODE_ENV     = { value = "production" }
    DATABASE_URL = { value = var.neon_database_url }

    # Auth & Security (backend/.env)
    JWT_SECRET     = { value = var.jwt_secret }
    JWT_EXPIRES_IN = { value = var.jwt_expires_in }
    ENCRYPTION_KEY = { value = var.encryption_key }

    # AI Service Connection (backend/.env)
    AI_ML_SERVICE_URL = { value = local.ai_service_url }
    AI_ML_SERVICE_KEY = { value = var.ai_ml_service_key }

    # Redis (backend/.env)
    REDIS_URL = { value = local.redis_url }

    # Network & URLs (backend/.env)
    CORS_ORIGINS = { value = "https://${var.project_name}-frontend.vercel.app,https://frontend-eouuckoe5-sureshjakharofficial-gmailcoms-projects.vercel.app,http://localhost:5173" }
    FRONTEND_URL = { value = "https://${var.project_name}-frontend.vercel.app" }

    # Platform Email Provider & Keys (backend/.env)
    PLATFORM_EMAIL_PROVIDER       = { value = var.platform_email_provider }
    PLATFORM_RESEND_API_KEY       = { value = var.platform_resend_api_key }
    PLATFORM_SENDGRID_API_KEY     = { value = var.platform_sendgrid_api_key }
    PLATFORM_SMTP_URL             = { value = var.platform_smtp_url }
    PLATFORM_SMTP_PASSWORD        = { value = var.platform_smtp_password }
    PLATFORM_FROM_EMAIL           = { value = var.platform_from_email }
    PLATFORM_FROM_NAME            = { value = var.platform_from_name }
    SENDGRID_INBOUND_PARSE_SECRET = { value = var.sendgrid_inbound_parse_secret }
  }

  depends_on = [
    upstash_redis_database.redis,
    render_web_service.ai_service
  ]
}

# 4. VERCEL: Frontend (React + Vite)
resource "vercel_project" "frontend" {
  count          = var.vercel_api_token != "" ? 1 : 0
  name           = "${var.project_name}-frontend"
  framework      = "vite"
  root_directory = "frontend"
}

resource "vercel_project_environment_variable" "api_base_url" {
  count      = var.vercel_api_token != "" ? 1 : 0
  project_id = vercel_project.frontend[0].id
  key        = "VITE_API_BASE_URL"
  value      = local.backend_url
  target     = ["production", "preview", "development"]
}
