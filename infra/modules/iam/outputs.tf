output "ecs_task_execution_role_arn" { value = aws_iam_role.ecs_task_execution.arn }
output "backend_task_role_arn"        { value = aws_iam_role.backend_task.arn }
output "ai_service_task_role_arn"     { value = aws_iam_role.ai_service_task.arn }
output "github_actions_role_arn"      { value = aws_iam_role.github_actions.arn }
output "oidc_provider_arn"            { value = local.oidc_provider_arn }
