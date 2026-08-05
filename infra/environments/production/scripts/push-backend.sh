#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="ap-south-1"
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
BACKEND_ECR="${ECR_REGISTRY}/jaktra/base/backend"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "▶ Authenticating Docker with AWS ECR..."
aws ecr get-login-password --region "$AWS_REGION" | docker login --username AWS --password-stdin "$ECR_REGISTRY"

echo "▶ Building and pushing Backend Docker Image (${BACKEND_ECR}:latest)..."
cd "${ROOT_DIR}/backend"
docker buildx build \
  --platform linux/amd64 \
  --tag "${BACKEND_ECR}:latest" \
  --push \
  .

echo "✓ Backend image successfully pushed to ECR!"
