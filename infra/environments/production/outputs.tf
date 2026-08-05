output "api_base_url"    { value = local.api_base_url }
output "frontend_url"    { value = data.terraform_remote_state.base.outputs.frontend_bucket_arn }
output "alb_dns_name"    { value = module.alb.alb_dns_name }
output "backend_tg_arn"  { value = module.alb.backend_tg_arn }

output "backend_ecr_url"    { value = data.terraform_remote_state.base.outputs.backend_ecr_url }
output "ai_service_ecr_url" { value = data.terraform_remote_state.base.outputs.ai_service_ecr_url }
output "registry_hostname"   { value = split("/", data.terraform_remote_state.base.outputs.backend_ecr_url)[0] }


output "ecs_cluster_name"        { value = module.ecs.cluster_name }
output "backend_service_name"    { value = module.ecs.backend_service_name }
output "ai_service_service_name" { value = module.ecs.ai_service_service_name }
output "backend_task_family"     { value = module.ecs.backend_task_family }
output "ai_service_task_family"  { value = module.ecs.ai_service_task_family }

output "frontend_s3_bucket"         { value = data.terraform_remote_state.base.outputs.frontend_s3_bucket }
output "cloudfront_distribution_id" { value = data.terraform_remote_state.base.outputs.cloudfront_distribution_id }
output "github_actions_role_arn"    { value = module.iam.github_actions_role_arn }

output "github_secrets_to_configure" {
  description = "Copy-paste these into your GitHub repository production environment secrets."
  value = {
    AWS_ROLE_ARN               = module.iam.github_actions_role_arn
    AWS_REGION                 = var.aws_region
    ECR_BACKEND_REPO_URL       = data.terraform_remote_state.base.outputs.backend_ecr_url
    ECR_AI_SERVICE_REPO_URL    = data.terraform_remote_state.base.outputs.ai_service_ecr_url
    FRONTEND_S3_BUCKET         = data.terraform_remote_state.base.outputs.frontend_s3_bucket
    CLOUDFRONT_DISTRIBUTION_ID = data.terraform_remote_state.base.outputs.cloudfront_distribution_id
    ECS_CLUSTER_NAME           = module.ecs.cluster_name
    BACKEND_SERVICE_NAME       = module.ecs.backend_service_name
    AI_SERVICE_SERVICE_NAME    = module.ecs.ai_service_service_name
    BACKEND_TASK_FAMILY        = module.ecs.backend_task_family
    AI_SERVICE_TASK_FAMILY     = module.ecs.ai_service_task_family
    VITE_API_BASE_URL          = local.api_base_url
  }
}
