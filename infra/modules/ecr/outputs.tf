output "repository_urls" {
  value = { for k, v in aws_ecr_repository.repos : k => v.repository_url }
}

output "repository_arns" {
  value = { for k, v in aws_ecr_repository.repos : k => v.arn }
}

output "registry_hostname" {
  value = split("/", values(aws_ecr_repository.repos)[0].repository_url)[0]
}
