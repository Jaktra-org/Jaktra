locals {
  name_prefix = "${var.project_name}-${var.environment}"

  ai_service_internal_url = "http://ai-service.${var.project_name}.local:${var.ai_service_port}"

  backend_capacity_provider = var.backend_use_spot ? "FARGATE_SPOT" : "FARGATE"
}

resource "aws_ecs_cluster" "main" {
  name = local.name_prefix

  setting {
    name  = "containerInsights"
    value = var.enable_container_insights ? "enabled" : "disabled"
  }

  tags = { Name = "${local.name_prefix}-cluster" }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
}

resource "aws_cloudwatch_log_group" "backend" {
  name              = "/ecs/${local.name_prefix}/backend"
  retention_in_days = var.log_retention_days
  tags              = { Name = "${local.name_prefix}-backend-logs" }
}

resource "aws_cloudwatch_log_group" "ai_service" {
  name              = "/ecs/${local.name_prefix}/ai-service"
  retention_in_days = var.log_retention_days
  tags              = { Name = "${local.name_prefix}-ai-service-logs" }
}

resource "aws_service_discovery_private_dns_namespace" "main" {
  name        = "${var.project_name}.local"
  description = "Private DNS namespace for ${local.name_prefix} ECS services"
  vpc         = var.vpc_id
  tags        = { Name = "${local.name_prefix}-dns-namespace" }
}

resource "aws_service_discovery_service" "ai_service" {
  name = "ai-service"

  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.main.id
    routing_policy = "MULTIVALUE"
    dns_records {
      ttl  = 10
      type = "A"
    }
  }

  health_check_custom_config { failure_threshold = 1 }
  tags       = { Name = "${local.name_prefix}-ai-service-discovery" }
  depends_on = [aws_service_discovery_private_dns_namespace.main]
}

resource "aws_ecs_task_definition" "backend" {
  family                   = "${local.name_prefix}-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.backend_cpu
  memory                   = var.backend_memory
  execution_role_arn       = var.task_execution_role_arn
  task_role_arn            = var.backend_task_role_arn

  container_definitions = jsonencode([
    {
      name      = "redis"
      image     = "redis:7-alpine"
      essential = true

      portMappings = [{
        containerPort = 6379
        hostPort      = 6379
        protocol      = "tcp"
      }]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.backend.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "redis"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "redis-cli ping || exit 1"]
        interval    = 10
        timeout     = 5
        retries     = 3
        startPeriod = 10
      }
    },
    {
      name      = "backend"
      image     = "${var.backend_ecr_url}:${var.backend_image_tag}"
      essential = true

      dependsOn = [{
        containerName = "redis"
        condition     = "HEALTHY"
      }]

      portMappings = [{
        containerPort = var.backend_port
        hostPort      = var.backend_port
        protocol      = "tcp"
      }]

      environment = [
        { name = "NODE_ENV",                        value = "production" },
        { name = "PORT",                            value = tostring(var.backend_port) },
        { name = "REDIS_HOST",                      value = "127.0.0.1" },
        { name = "REDIS_PORT",                      value = "6379" },
        { name = "JWT_EXPIRES_IN",                  value = "7d" },
        { name = "AI_ML_SERVICE_URL",               value = local.ai_service_internal_url },
        { name = "AUTH_LOCKOUT_THRESHOLD",         value = "5" },
        { name = "AUTH_LOCKOUT_BASE_MINUTES",      value = "15" },
        { name = "AUTH_LOCKOUT_MAX_MINUTES",       value = "1440" },
        { name = "AUTH_MFA_MAX_ATTEMPTS",          value = "5" },
        { name = "DISPUTE_LIMIT_PER_TENANT_HOURLY", value = "100" },
        { name = "DISPUTE_LIMIT_PER_SENDER_HOURLY", value = "15" },
      ]

    secrets = [
      for name, valueFrom in var.backend_secrets_map : {
        name      = name
        valueFrom = valueFrom
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.backend.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "node -e \"require('http').get('http://127.0.0.1:${var.backend_port}/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))\""]
      interval    = 15
      timeout     = 5
      retries     = 3
      startPeriod = 30
    }

    stopTimeout = 35

    linuxParameters = { initProcessEnabled = true }
  }])

  tags = {
    Name     = "${local.name_prefix}-backend-task"
    ImageTag = var.backend_image_tag
  }
}

resource "aws_ecs_service" "backend" {
  name                   = "${local.name_prefix}-backend"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.backend.arn
  desired_count          = var.backend_desired_count
  enable_execute_command = var.enable_execute_command

  capacity_provider_strategy {
    capacity_provider = local.backend_capacity_provider
    weight            = 1
    base              = 1
  }

  network_configuration {
    subnets          = var.task_subnet_ids
    security_groups  = [var.backend_sg_id]
    assign_public_ip = var.assign_public_ip
  }

  load_balancer {
    target_group_arn = var.backend_tg_arn
    container_name   = "backend"
    container_port   = var.backend_port
  }

  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  depends_on = [var.http_listener_arn]

  lifecycle {
    # CI/CD manages task_definition after first deploy
    ignore_changes = [task_definition, desired_count]
  }

  tags = { Name = "${local.name_prefix}-backend-service" }
}

resource "aws_ecs_task_definition" "ai_service" {
  family                   = "${local.name_prefix}-ai-service"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.ai_service_cpu
  memory                   = var.ai_service_memory
  execution_role_arn       = var.task_execution_role_arn
  task_role_arn            = var.ai_service_task_role_arn

  container_definitions = jsonencode([{
    name      = "ai-service"
    image     = "${var.ai_service_ecr_url}:${var.ai_service_image_tag}"
    essential = true

    portMappings = [{
      containerPort = var.ai_service_port
      hostPort      = var.ai_service_port
      protocol      = "tcp"
    }]

    environment = [
      { name = "PYTHONUNBUFFERED",         value = "1" },
      { name = "PYTHONDONTWRITEBYTECODE",   value = "1" },
      { name = "ENVIRONMENT",              value = "production" },
      { name = "SERVICE_HOST",             value = "0.0.0.0" },
      { name = "SERVICE_PORT",             value = tostring(var.ai_service_port) },
      { name = "LLM_PROVIDER",            value = "groq" },
      { name = "LLM_MODEL",               value = var.llm_model },
      { name = "LLM_TEMPERATURE",         value = "0.4" },
      { name = "LLM_MAX_TOKENS",          value = "1024" },
      { name = "LLM_TIMEOUT_SECONDS",     value = "30" },
      { name = "RISK_MODEL_PATH",         value = "src/models/risk_scorer.joblib" },
      { name = "LOG_LEVEL",               value = "INFO" },
      { name = "LOG_FORMAT",              value = "json" },
    ]

    secrets = [
      for name, valueFrom in var.ai_service_secrets_map : {
        name      = name
        valueFrom = valueFrom
      }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.ai_service.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "python3 -c \"import urllib.request; urllib.request.urlopen('http://localhost:${var.ai_service_port}/health')\" || exit 1"]
      interval    = 30
      timeout     = 10
      retries     = 3
      startPeriod = 90
    }

    stopTimeout = 15

    linuxParameters = { initProcessEnabled = true }
  }])

  tags = {
    Name     = "${local.name_prefix}-ai-service-task"
    ImageTag = var.ai_service_image_tag
  }
}

resource "aws_ecs_service" "ai_service" {
  name                   = "${local.name_prefix}-ai-service"
  cluster                = aws_ecs_cluster.main.id
  task_definition        = aws_ecs_task_definition.ai_service.arn
  desired_count          = var.ai_service_desired_count
  enable_execute_command = var.enable_execute_command

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 4
    base              = 0
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }

  network_configuration {
    subnets          = var.task_subnet_ids
    security_groups  = [var.ai_service_sg_id]
    assign_public_ip = var.assign_public_ip
  }

  service_registries {
    registry_arn   = aws_service_discovery_service.ai_service.arn
  }

  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  lifecycle {
    ignore_changes = [task_definition, desired_count]
  }

  tags = { Name = "${local.name_prefix}-ai-service-service" }
}
