locals {
  name_prefix = "${var.project_name}-${var.environment}"
}

resource "aws_db_subnet_group" "postgres" {
  name       = "${local.name_prefix}-rds-subnet-group"
  subnet_ids = var.subnet_ids

  tags = { Name = "${local.name_prefix}-rds-subnet-group" }
}

resource "aws_security_group" "rds" {
  name        = "${local.name_prefix}-rds-sg"
  description = "Access to RDS PostgreSQL instance"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name_prefix}-rds-sg" }
}

resource "aws_security_group_rule" "rds_ingress" {
  count = length(var.allowed_security_group_ids) > 0 ? 1 : 0

  type                     = "ingress"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = var.allowed_security_group_ids[count.index]
}

resource "aws_db_instance" "postgres" {
  identifier        = "${local.name_prefix}-postgres"
  engine            = "postgres"
  engine_version    = "18"
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage

  db_name  = var.database_name
  username = var.database_username
  password = var.database_password
  port     = 5432

  db_subnet_group_name   = aws_db_subnet_group.postgres.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot       = var.skip_final_snapshot
  final_snapshot_identifier = "${local.name_prefix}-postgres-final-snapshot"

  deletion_protection = var.deletion_protection

  tags = { Name = "${local.name_prefix}-postgres" }
}
