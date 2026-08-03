output "alb_arn"           { value = aws_lb.main.arn }
output "alb_arn_suffix"    { value = aws_lb.main.arn_suffix }
output "alb_dns_name"      { value = aws_lb.main.dns_name }
output "backend_tg_arn"    { value = aws_lb_target_group.backend.arn }
output "http_listener_arn" { value = aws_lb_listener.http.arn }
output "https_listener_arn" {
  value = length(aws_lb_listener.https) > 0 ? aws_lb_listener.https[0].arn : null
}
