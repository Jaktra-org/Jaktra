
locals {
  name_prefix = "${var.project_name}-${var.environment}"
}


resource "aws_sns_topic" "alerts" {
  name = "${local.name_prefix}-alerts"
  tags = { Name = "${local.name_prefix}-alerts-topic" }
}

resource "aws_sns_topic_subscription" "email" {
  count = var.alert_email != "" ? 1 : 0

  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}



resource "aws_cloudwatch_metric_alarm" "backend_cpu" {
  count = var.enable_alarms ? 1 : 0

  alarm_name          = "${local.name_prefix}-backend-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.cpu_alarm_threshold

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = var.backend_service_name
  }

  alarm_description  = "${local.name_prefix} backend CPU > ${var.cpu_alarm_threshold}%"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  ok_actions         = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"

  tags = { Name = "${local.name_prefix}-backend-cpu-alarm" }
}

resource "aws_cloudwatch_metric_alarm" "backend_memory" {
  count = var.enable_alarms ? 1 : 0

  alarm_name          = "${local.name_prefix}-backend-memory-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "MemoryUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.memory_alarm_threshold

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = var.backend_service_name
  }

  alarm_description  = "${local.name_prefix} backend memory > ${var.memory_alarm_threshold}%"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  ok_actions         = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"

  tags = { Name = "${local.name_prefix}-backend-memory-alarm" }
}

resource "aws_cloudwatch_metric_alarm" "alb_5xx" {
  count = var.enable_alarms ? 1 : 0

  alarm_name          = "${local.name_prefix}-alb-5xx"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "HTTPCode_Target_5XX_Count"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  statistic           = "Sum"
  threshold           = 10

  dimensions = { LoadBalancer = var.alb_arn_suffix }

  alarm_description  = "${local.name_prefix} ALB returning >10 5xx/min"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  ok_actions         = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"

  tags = { Name = "${local.name_prefix}-alb-5xx-alarm" }
}

resource "aws_cloudwatch_metric_alarm" "alb_latency" {
  count = var.enable_alarms ? 1 : 0

  alarm_name          = "${local.name_prefix}-alb-latency-p99"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "TargetResponseTime"
  namespace           = "AWS/ApplicationELB"
  period              = 60
  extended_statistic  = "p99"
  threshold           = 5

  dimensions = { LoadBalancer = var.alb_arn_suffix }

  alarm_description  = "${local.name_prefix} ALB p99 latency > 5s for 3 consecutive minutes"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"

  tags = { Name = "${local.name_prefix}-alb-latency-alarm" }
}

resource "aws_cloudwatch_metric_alarm" "backend_tasks_zero" {
  count = var.enable_alarms ? 1 : 0

  alarm_name          = "${local.name_prefix}-backend-tasks-zero"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = 1
  metric_name         = "RunningTaskCount"
  namespace           = "ECS/ContainerInsights"
  period              = 60
  statistic           = "Average"
  threshold           = 1

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = var.backend_service_name
  }

  alarm_description  = "CRITICAL: ${local.name_prefix} backend has 0 running tasks"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  treat_missing_data = "breaching"

  tags = { Name = "${local.name_prefix}-backend-down-alarm" }
}

resource "aws_cloudwatch_metric_alarm" "ai_service_cpu" {
  count = var.enable_alarms && var.ai_service_service_name != "" ? 1 : 0

  alarm_name          = "${local.name_prefix}-ai-service-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ECS"
  period              = 60
  statistic           = "Average"
  threshold           = var.ai_service_cpu_threshold

  dimensions = {
    ClusterName = var.cluster_name
    ServiceName = var.ai_service_service_name
  }

  alarm_description  = "${local.name_prefix} ai-service CPU > ${var.ai_service_cpu_threshold}%"
  alarm_actions      = [aws_sns_topic.alerts.arn]
  ok_actions         = [aws_sns_topic.alerts.arn]
  treat_missing_data = "notBreaching"

  tags = { Name = "${local.name_prefix}-ai-service-cpu-alarm" }
}

resource "aws_budgets_budget" "cost" {
  count             = var.enable_alarms && var.alert_email != "" && var.budget_limit_usd > 0 ? 1 : 0
  name              = "${local.name_prefix}-monthly-budget"
  budget_type       = "COST"
  limit_amount      = tostring(var.budget_limit_usd)
  limit_unit        = "USD"
  time_unit         = "MONTHLY"
  time_period_start = "2026-01-01_00:00"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 100
    threshold_type             = "PERCENTAGE"
    notification_type          = "FORECASTED"
    subscriber_email_addresses = [var.alert_email]
  }

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = [var.alert_email]
  }
}

