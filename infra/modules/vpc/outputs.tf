output "vpc_id"             { value = aws_vpc.main.id }
output "public_subnet_ids"  { value = aws_subnet.public[*].id }
output "private_subnet_ids" { value = aws_subnet.private[*].id }
output "igw_id"             { value = aws_internet_gateway.main.id }

output "nat_gateway_id" {
  value = var.enable_nat_gateway ? aws_nat_gateway.main[0].id : null
}

output "ecs_subnet_ids" {
  description = "Subnet IDs for task placement (private subnets if NAT is enabled, public otherwise)"
  value       = var.enable_nat_gateway ? aws_subnet.private[*].id : aws_subnet.public[*].id
}

output "private_route_table_id" {
  value = aws_route_table.private.id
}
