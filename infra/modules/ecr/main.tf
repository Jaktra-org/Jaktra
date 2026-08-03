locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_ecr_repository" "repos" {
  for_each = toset(var.repository_names)

  name                 = "${var.project_name}/${var.environment}/${each.key}"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  encryption_configuration { encryption_type = "AES256" }
  image_scanning_configuration { scan_on_push = true }

  tags = { Name = "${local.name_prefix}-ecr-${each.key}" }
}

resource "aws_ecr_lifecycle_policy" "repos" {
  for_each   = aws_ecr_repository.repos
  repository = each.value.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Remove untagged (dangling) images after 1 day"
        selection = {
          tagStatus   = "untagged"
          countType   = "sinceImagePushed"
          countUnit   = "days"
          countNumber = 1
        }
        action = { type = "expire" }
      },
      {
        rulePriority = 2
        description  = "Keep last ${var.image_count_to_keep} tagged images"
        selection = {
          tagStatus     = "tagged"
          tagPrefixList = ["sha-", "v", "latest"]
          countType     = "imageCountMoreThan"
          countNumber   = var.image_count_to_keep
        }
        action = { type = "expire" }
      }
    ]
  })
}
