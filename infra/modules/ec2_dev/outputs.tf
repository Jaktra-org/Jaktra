output "instance_id"    { value = aws_instance.dev.id }
output "public_ip"      { value = aws_eip.dev.public_ip }
output "ec2_sg_id"      { value = aws_security_group.ec2.id }
output "instance_role_arn" { value = aws_iam_role.ec2_instance.arn }

output "backend_url" {
  value = "http://${aws_eip.dev.public_ip}:${var.backend_port}"
}

output "ai_service_url" {
  value = "http://${aws_eip.dev.public_ip}:${var.ai_service_port}"
}

output "ssh_command" {
  description = "Run this to SSH into the dev instance."
  value       = "ssh -i ~/.ssh/jaktra-dev ec2-user@${aws_eip.dev.public_ip}"
}

output "start_command" {
  description = "Run this after pushing new images to restart all services."
  value       = "ssh -i ~/.ssh/jaktra-dev ec2-user@${aws_eip.dev.public_ip} 'sudo /opt/jaktra/start.sh'"
}
