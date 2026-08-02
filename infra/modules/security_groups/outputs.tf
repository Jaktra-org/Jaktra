output "alb_sg_id"          { value = aws_security_group.alb.id }
output "backend_ecs_sg_id"  { value = aws_security_group.backend_ecs.id }
output "ai_service_ecs_sg_id" { value = aws_security_group.ai_service_ecs.id }
