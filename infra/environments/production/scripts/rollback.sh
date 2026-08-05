#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."
AWS_REGION="ap-south-1"
TARGET="${1:-all}"

log() { echo -e "\033[1;33m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m  ✓ $*\033[0m"; }

cd "${ENV_DIR}"
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
BACKEND_SVC=$(terraform output -raw backend_service_name)
AI_SVC=$(terraform output -raw ai_service_service_name)
BACKEND_TASK_FAMILY=$(terraform output -raw backend_task_family)
AI_TASK_FAMILY=$(terraform output -raw ai_service_task_family)

rollback_service() {
  local FAMILY="$1"; local SERVICE="$2"
  log "Rolling back $SERVICE..."

  CURRENT_REVISION=$(aws ecs describe-services \
    --cluster "$CLUSTER_NAME" --services "$SERVICE" --region "$AWS_REGION" \
    --query 'services[0].taskDefinition' --output text \
    | grep -o '[0-9]*$')

  PREV_REVISION=$((CURRENT_REVISION - 1))
  [[ $PREV_REVISION -lt 1 ]] && { echo "  No previous revision to roll back to."; return; }

  PREV_TASK_DEF="${FAMILY}:${PREV_REVISION}"
  aws ecs update-service \
    --cluster "$CLUSTER_NAME" \
    --service "$SERVICE" \
    --task-definition "$PREV_TASK_DEF" \
    --force-new-deployment \
    --region "$AWS_REGION" \
    --no-cli-pager > /dev/null
  ok "Rolled back $SERVICE → $PREV_TASK_DEF"
}

echo "Production rollback requested for: $TARGET"
read -rp "Confirm (yes): " C; [[ "$C" == "yes" ]] || { echo "Aborted."; exit 0; }

[[ "$TARGET" == "all" || "$TARGET" == "backend" ]]    && rollback_service "$BACKEND_TASK_FAMILY" "$BACKEND_SVC"
[[ "$TARGET" == "all" || "$TARGET" == "ai-service" ]] && rollback_service "$AI_TASK_FAMILY" "$AI_SVC"

log "Waiting for ECS stability post-rollback..."
aws ecs wait services-stable \
  --cluster "$CLUSTER_NAME" --services "$BACKEND_SVC" "$AI_SVC" \
  --region "$AWS_REGION"
ok "Rollback complete."
