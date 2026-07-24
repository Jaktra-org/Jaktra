#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."
AWS_REGION="ap-south-1"

echo "PRODUCTION TEARDOWN — THIS IS IRREVERSIBLE"
read -rp "Type 'production' to confirm destruction: " CONFIRM
[[ "$CONFIRM" == "production" ]] || { echo "Aborted."; exit 0; }
read -rp "Are you absolutely sure? Type 'yes I am sure': " CONFIRM2
[[ "$CONFIRM2" == "yes I am sure" ]] || { echo "Aborted."; exit 0; }

cd "${ENV_DIR}"

for REPO in backend ai-service; do
  FULL_REPO="jaktra/production/${REPO}"
  echo "Emptying repository: ${FULL_REPO}"
  IMAGE_IDS=$(aws ecr list-images --repository-name "$FULL_REPO" --region "$AWS_REGION" \
    --query 'imageIds[*]' --output json 2>/dev/null || echo "[]")
  if [[ "$IMAGE_IDS" != "[]" && "$IMAGE_IDS" != "null" ]]; then
    aws ecr batch-delete-image --repository-name "$FULL_REPO" --region "$AWS_REGION" \
      --image-ids "$IMAGE_IDS" --no-cli-pager > /dev/null 2>&1 || true
  fi
done

BUCKET=$(terraform output -raw frontend_s3_bucket 2>/dev/null || true)
if [[ -n "$BUCKET" ]]; then
  aws s3 rm "s3://${BUCKET}/" --recursive --quiet || true
fi

terraform destroy -auto-approve
