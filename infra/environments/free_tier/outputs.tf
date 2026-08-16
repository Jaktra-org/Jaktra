output "frontend_url" {
  description = "Vercel Frontend URL"
  value       = length(vercel_project.frontend) > 0 ? "https://${vercel_project.frontend[0].name}.vercel.app" : "https://${var.project_name}.vercel.app"
}

output "backend_url" {
  description = "Render Backend API URL"
  value       = local.backend_url
}

output "ai_service_url" {
  description = "Render AI Service URL"
  value       = local.ai_service_url
}

output "redis_endpoint" {
  description = "Upstash Redis Endpoint"
  value       = length(upstash_redis_database.redis) > 0 ? upstash_redis_database.redis[0].endpoint : "N/A"
}

output "redis_connection_url" {
  description = "Upstash Redis Connection URL"
  value       = local.redis_url
  sensitive   = true
}
