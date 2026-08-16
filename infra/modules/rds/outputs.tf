output "db_instance_id" {
  value = aws_db_instance.postgres.id
}

output "endpoint" {
  value = aws_db_instance.postgres.endpoint
}

output "address" {
  value = aws_db_instance.postgres.address
}

output "port" {
  value = aws_db_instance.postgres.port
}

output "username" {
  value = aws_db_instance.postgres.username
}

output "security_group_id" {
  value = aws_security_group.rds.id
}

output "connection_url" {
  value     = "postgresql://${aws_db_instance.postgres.username}:${var.database_password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
  sensitive = true
}
