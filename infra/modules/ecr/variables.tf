variable "project_name" { type = string }
variable "environment"  { type = string }

variable "repository_names" {
  type    = list(string)
  default = ["backend", "ai-service"]
}

variable "image_count_to_keep" {
  type    = number
  default = 5
}
