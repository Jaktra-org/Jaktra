#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."

echo "This will destroy all DEV infrastructure."
read -rp "Type 'yes' to continue: " CONFIRM
[[ "$CONFIRM" == "yes" ]] || { echo "Aborted."; exit 0; }

cd "${ENV_DIR}"

AWS_REGION="ap-south-1"
PROJECT="jaktra"
for REPO in backend ai-service; do
  FULL_REPO="${PROJECT}/dev/${REPO}"
  echo "Emptying ECR repo: ${FULL_REPO}"
  aws ecr list-images --repository-name "$FULL_REPO" --region "$AWS_REGION" \
    --query 'imageIds[*]' --output json 2>/dev/null \
    | jq -e 'length > 0' > /dev/null 2>&1 && \
  aws ecr batch-delete-image --repository-name "$FULL_REPO" --region "$AWS_REGION" \
    --image-ids "$(aws ecr list-images --repository-name "$FULL_REPO" \
      --region "$AWS_REGION" --query 'imageIds[*]' --output json)" \
    --no-cli-pager > /dev/null 2>&1 || true
done

BUCKET=$(terraform output -raw frontend_s3_bucket 2>/dev/null || true)
if [[ -n "$BUCKET" ]]; then
  aws s3 rm "s3://${BUCKET}/" --recursive --quiet || true
fi

terraform destroy -auto-approve
