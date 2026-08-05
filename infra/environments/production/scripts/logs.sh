#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="ap-south-1"
SERVICE="${1:-backend}"
LOG_GROUP="/ecs/jaktra-production/${SERVICE}"

echo "Streaming CloudWatch logs for Production '${SERVICE}' (${LOG_GROUP})... (Press Ctrl+C to stop)"
aws logs tail "$LOG_GROUP" --follow --region "$AWS_REGION"
