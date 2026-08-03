output "db_instance_id" {
  value = aws_db_instance.mysql.id
}

output "endpoint" {
  value = aws_db_instance.mysql.endpoint
}

output "address" {
  value = aws_db_instance.mysql.address
}

output "port" {
  value = aws_db_instance.mysql.port
}

output "username" {
  value = aws_db_instance.mysql.username
}

output "security_group_id" {
  value = aws_security_group.rds.id
}

output "connection_url" {
  value     = "mysql://${aws_db_instance.mysql.username}:${var.database_password}@${aws_db_instance.mysql.endpoint}/${aws_db_instance.mysql.db_name}"
  sensitive = true
}
