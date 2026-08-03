variable "project_name" { type = string }
variable "environment"  { type = string }


variable "certificate_arn" {
  type    = string
  default = ""
}

variable "domain_aliases" {
  type    = list(string)
  default = []
}

variable "cloudfront_price_class" {
  type    = string
  default = "PriceClass_200"
}

variable "alb_domain_name" {
  type        = string
  description = "Application Load Balancer domain name to route /api traffic to"
  default     = ""
}
