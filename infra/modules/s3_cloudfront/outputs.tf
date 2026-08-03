output "bucket_name"               { value = aws_s3_bucket.frontend.bucket }
output "bucket_arn"                { value = aws_s3_bucket.frontend.arn }
output "cloudfront_distribution_id"  { value = aws_cloudfront_distribution.frontend.id }
output "cloudfront_distribution_arn" { value = aws_cloudfront_distribution.frontend.arn }
output "cloudfront_domain_name"    { value = aws_cloudfront_distribution.frontend.domain_name }

output "frontend_url" {
  value = length(var.domain_aliases) > 0 ? "https://${var.domain_aliases[0]}" : "https://${aws_cloudfront_distribution.frontend.domain_name}"
}
