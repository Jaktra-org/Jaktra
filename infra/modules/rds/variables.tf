variable "project_name" { type = string }
variable "environment"  { type = string }

variable "vpc_id" { type = string }
variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for the DB subnet group"
}

variable "allowed_security_group_ids" {
  type    = list(string)
  default = []
}

variable "instance_class" {
  type    = string
  default = "db.t4g.micro"
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "database_name" {
  type    = string
  default = "jaktra"
}

variable "database_username" {
  type    = string
  default = "dbadmin"
}

variable "database_password" {
  type      = string
  sensitive = true
}

variable "skip_final_snapshot" {
  type    = bool
  default = true
}

variable "deletion_protection" {
  type    = bool
  default = true
}
