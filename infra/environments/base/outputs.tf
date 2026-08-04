output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "private_route_table_id" {
  value = module.vpc.private_route_table_id
}

output "backend_ecr_url" {
  value = module.ecr.repository_urls["backend"]
}

output "ai_service_ecr_url" {
  value = module.ecr.repository_urls["ai-service"]
}

output "backend_ecr_arn" {
  value = module.ecr.repository_arns["backend"]
}

output "ai_service_ecr_arn" {
  value = module.ecr.repository_arns["ai-service"]
}

output "frontend_s3_bucket" {
  value = module.s3_cloudfront.bucket_name
}

output "frontend_bucket_arn" {
  value = module.s3_cloudfront.bucket_arn
}

output "cloudfront_distribution_id" {
  value = module.s3_cloudfront.cloudfront_distribution_id
}

output "cloudfront_distribution_arn" {
  value = module.s3_cloudfront.cloudfront_distribution_arn
}

output "rds_security_group_id" {
  value = module.rds.security_group_id
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "api_cert_arn" {
  value = var.domain_name != "" ? aws_acm_certificate_validation.api[0].certificate_arn : ""
}

# Dev secret outputs
output "dev_backend_secret_arn" {
  value = local.has_dev_secrets ? module.secrets_dev[0].backend_secret_arn : ""
}

output "dev_ai_service_secret_arn" {
  value = local.has_dev_secrets ? module.secrets_dev[0].ai_service_secret_arn : ""
}

output "dev_backend_secrets_map" {
  value = local.has_dev_secrets ? module.secrets_dev[0].backend_secrets_map : null
}

output "dev_ai_service_secrets_map" {
  value = local.has_dev_secrets ? module.secrets_dev[0].ai_service_secrets_map : null
}

# Production secret outputs
output "production_backend_secret_arn" {
  value = local.has_prod_secrets ? module.secrets_production[0].backend_secret_arn : ""
}

output "production_ai_service_secret_arn" {
  value = local.has_prod_secrets ? module.secrets_production[0].ai_service_secret_arn : ""
}

output "production_backend_secrets_map" {
  value = local.has_prod_secrets ? module.secrets_production[0].backend_secrets_map : null
}

output "production_ai_service_secrets_map" {
  value = local.has_prod_secrets ? module.secrets_production[0].ai_service_secrets_map : null
}
