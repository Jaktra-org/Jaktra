output "ec2_public_ip"  { value = module.ec2.public_ip }
output "ec2_instance_id" { value = module.ec2.instance_id }
output "backend_url"    { value = module.ec2.backend_url }
output "ai_service_url" { value = module.ec2.ai_service_url }
output "frontend_url"   { value = data.terraform_remote_state.base.outputs.frontend_bucket_arn }

output "ecr_backend_url"    { value = data.terraform_remote_state.base.outputs.backend_ecr_url }
output "ecr_ai_service_url" { value = data.terraform_remote_state.base.outputs.ai_service_ecr_url }
output "ecr_registry"       { value = split("/", data.terraform_remote_state.base.outputs.backend_ecr_url)[0] }


output "frontend_s3_bucket"         { value = data.terraform_remote_state.base.outputs.frontend_s3_bucket }
output "cloudfront_distribution_id" { value = data.terraform_remote_state.base.outputs.cloudfront_distribution_id }
output "github_actions_role_arn"    { value = module.iam.github_actions_role_arn }

output "ssh_command" {
  value       = module.ec2.ssh_command
  description = "SSH into the dev EC2 instance"
}

output "start_command" {
  value       = module.ec2.start_command
  description = "Pull latest images and restart all services on EC2"
}

output "github_secrets_to_configure" {
  description = "Copy-paste into GitHub repository dev environment secrets."
  value = {
    AWS_ROLE_ARN               = module.iam.github_actions_role_arn
    AWS_REGION                 = var.aws_region
    ECR_BACKEND_REPO_URL       = data.terraform_remote_state.base.outputs.backend_ecr_url
    ECR_AI_SERVICE_REPO_URL    = data.terraform_remote_state.base.outputs.ai_service_ecr_url
    FRONTEND_S3_BUCKET         = data.terraform_remote_state.base.outputs.frontend_s3_bucket
    CLOUDFRONT_DISTRIBUTION_ID = data.terraform_remote_state.base.outputs.cloudfront_distribution_id
    EC2_PUBLIC_IP              = module.ec2.public_ip
    VITE_API_BASE_URL          = module.ec2.backend_url
  }
}
