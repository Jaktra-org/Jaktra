output "backend_secret_arn"      { value = aws_secretsmanager_secret.backend.arn }
output "ai_service_secret_arn"   { value = aws_secretsmanager_secret.ai_service.arn }
output "backend_secrets_map"     { value = local.backend_secrets_map }
output "ai_service_secrets_map"  { value = local.ai_service_secrets_map }
