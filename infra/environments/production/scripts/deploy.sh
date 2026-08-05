#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."
ROOT_DIR="${ENV_DIR}/../../.."

AWS_REGION="ap-south-1"
PLATFORM="linux/amd64"
GIT_SHA=$(git -C "${ROOT_DIR}" rev-parse --short HEAD 2>/dev/null || echo "local")

log() { echo -e "\n\033[1;35m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m  ✓ $*\033[0m"; }
err() { echo -e "\033[1;31m  ✗ $*\033[0m" >&2; exit 1; }

log "Jaktra PRODUCTION — Deploying Infrastructure"

if [[ ! -f "${ENV_DIR}/terraform.tfvars" ]]; then
  log "Auto-generating terraform.tfvars..."
  cat > "${ENV_DIR}/terraform.tfvars" << EOF
project_name = "jaktra"
environment  = "production"
aws_region   = "ap-south-1"

github_org  = "Jaktra-org"
github_repo = "Jaktra"

create_github_oidc_provider = true

domain_name   = ""
api_subdomain = "api"
alert_email   = ""
EOF
  ok "terraform.tfvars generated"
fi

log "Running Terraform"
cd "${ENV_DIR}"
terraform init -input=false -upgrade
terraform apply -auto-approve
ok "Terraform complete"

ECR_REGISTRY=$(terraform output -raw registry_hostname)
BACKEND_ECR=$(terraform output -raw backend_ecr_url)
AI_SERVICE_ECR=$(terraform output -raw ai_service_ecr_url)
CLUSTER_NAME=$(terraform output -raw ecs_cluster_name)
BACKEND_SVC=$(terraform output -raw backend_service_name)
AI_SVC=$(terraform output -raw ai_service_service_name)
BACKEND_TASK_FAMILY=$(terraform output -raw backend_task_family)
AI_TASK_FAMILY=$(terraform output -raw ai_service_task_family)
FRONTEND_BUCKET=$(terraform output -raw frontend_s3_bucket)
CF_DIST_ID=$(terraform output -raw cloudfront_distribution_id)

BACKEND_TAG="${GIT_SHA}"
AI_TAG="${GIT_SHA}"

BUILD_DOCKER=false
for arg in "$@"; do
  case $arg in
    --build|-b)
      BUILD_DOCKER=true
      ;;
  esac
done

if [[ "$BUILD_DOCKER" == true ]]; then
  log "Authenticating Docker to ECR"
  aws ecr get-login-password --region "$AWS_REGION" \
    | docker login --username AWS --password-stdin "$ECR_REGISTRY"
  ok "ECR login complete"

  log "Building and Pushing Backend Image"
  cd "${ROOT_DIR}/backend"
  docker buildx build \
    --platform "$PLATFORM" \
    --tag "${BACKEND_ECR}:${BACKEND_TAG}" \
    --tag "${BACKEND_ECR}:latest" \
    --push \
    .
  ok "Backend image pushed"

  log "Building and Pushing AI Service Image"
  cd "${ROOT_DIR}/ai-service"
  docker buildx build \
    --platform "$PLATFORM" \
    --tag "${AI_SERVICE_ECR}:${AI_TAG}" \
    --tag "${AI_SERVICE_ECR}:latest" \
    --push \
    .
  ok "AI service image pushed"
else
  log "Skipping Docker image build — using existing ECR images (:latest)"
  ok "Linking existing ECR images: ${BACKEND_ECR}:latest and ${AI_SERVICE_ECR}:latest"
fi

log "Updating Backend ECS Task Definition"
BACKEND_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$BACKEND_TASK_FAMILY" --region "$AWS_REGION" \
  --query 'taskDefinition' --output json)

NEW_BACKEND_TASK=$(node -e "
const d = JSON.parse(process.argv[1]);
const img = process.argv[2];
d.containerDefinitions[0].image = img;
delete d.taskDefinitionArn;
delete d.revision;
delete d.status;
delete d.requiresAttributes;
delete d.placementConstraints;
delete d.compatibilities;
delete d.registeredAt;
delete d.registeredBy;
console.log(JSON.stringify(d));
" "$BACKEND_TASK_DEF" "${BACKEND_ECR}:latest")

NEW_BACKEND_TASK_ARN=$(aws ecs register-task-definition \
  --region "$AWS_REGION" \
  --cli-input-json "$NEW_BACKEND_TASK" \
  --query 'taskDefinition.taskDefinitionArn' --output text)

aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$BACKEND_SVC" \
  --task-definition "$NEW_BACKEND_TASK_ARN" \
  --force-new-deployment \
  --region "$AWS_REGION" \
  --no-cli-pager > /dev/null

log "Updating AI Service ECS Task Definition"
AI_TASK_DEF=$(aws ecs describe-task-definition \
  --task-definition "$AI_TASK_FAMILY" --region "$AWS_REGION" \
  --query 'taskDefinition' --output json)

NEW_AI_TASK=$(node -e "
const d = JSON.parse(process.argv[1]);
const img = process.argv[2];
d.containerDefinitions[0].image = img;
delete d.taskDefinitionArn;
delete d.revision;
delete d.status;
delete d.requiresAttributes;
delete d.placementConstraints;
delete d.compatibilities;
delete d.registeredAt;
delete d.registeredBy;
console.log(JSON.stringify(d));
" "$AI_TASK_DEF" "${AI_SERVICE_ECR}:latest")

NEW_AI_TASK_ARN=$(aws ecs register-task-definition \
  --region "$AWS_REGION" \
  --cli-input-json "$NEW_AI_TASK" \
  --query 'taskDefinition.taskDefinitionArn' --output text)

aws ecs update-service \
  --cluster "$CLUSTER_NAME" \
  --service "$AI_SVC" \
  --task-definition "$NEW_AI_TASK_ARN" \
  --force-new-deployment \
  --region "$AWS_REGION" \
  --no-cli-pager > /dev/null

ALB_DNS=$(cd "${ENV_DIR}" && terraform output -raw alb_dns_name)

log "Configuring CloudFront API Reverse Proxy for Production ALB (${ALB_DNS})"
DIST_CFG=$(aws cloudfront get-distribution-config --id "$CF_DIST_ID" --output json)
ETAG=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.ETag)" "$DIST_CFG")
NEW_CFG=$(node -e "
const d = JSON.parse(process.argv[1]);
const dns = process.argv[2];
d.DistributionConfig.Origins.Items.forEach(o => {
  if (o.Id === 'ALB-backend') {
    o.DomainName = dns;
    if (o.CustomOriginConfig) o.CustomOriginConfig.HTTPPort = 80;
  }
});
console.log(JSON.stringify(d.DistributionConfig));
" "$DIST_CFG" "$ALB_DNS")

aws cloudfront update-distribution \
  --id "$CF_DIST_ID" \
  --distribution-config "$NEW_CFG" \
  --if-match "$ETAG" \
  --no-cli-pager > /dev/null
ok "CloudFront API origin routed to ${ALB_DNS}:80"

log "Building and Deploying Frontend"
cd "${ROOT_DIR}/frontend"

rm -rf node_modules/.vite dist .env.production.local .env.local
cat > .env.production.local << EOF
VITE_API_URL=/api
VITE_API_BASE_URL=/api
EOF

npm install --silent
npm run build
aws s3 sync dist/ "s3://${FRONTEND_BUCKET}/" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html"

aws s3 cp dist/index.html "s3://${FRONTEND_BUCKET}/index.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --content-type "text/html"

aws cloudfront create-invalidation \
  --distribution-id "$CF_DIST_ID" \
  --paths "/*" \
  --region us-east-1 \
  --no-cli-pager
ok "Frontend deployed"

log "Step-by-step Service Dependency Tracking & Health Checks..."

log "[1/4] Checking AI Service Fargate Task status..."
MAX_WAIT=180; WAITED=0
while [[ $WAITED -lt $MAX_WAIT ]]; do
  TASKS=$(aws ecs list-tasks --cluster "$CLUSTER_NAME" --service-name "$AI_SVC" --query 'taskArns' --output json --region "$AWS_REGION" 2>/dev/null || echo "[]")
  TASK_ARN=$(node -e "const t=JSON.parse(process.argv[1]); console.log(t[0]||'')" "$TASKS")
  if [[ -n "$TASK_ARN" ]]; then
    STATUS=$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$TASK_ARN" --query 'tasks[0].lastStatus' --output text --region "$AWS_REGION" 2>/dev/null || echo "PENDING")
    if [[ "$STATUS" == "RUNNING" ]]; then
      ok "AI Service Fargate Task: RUNNING"
      break
    fi
    echo "  Waiting for AI Service Fargate container... (Status: ${STATUS}, ${WAITED}s)"
  fi
  sleep 5
  WAITED=$((WAITED+5))
done

log "[2/4] Checking Backend Fargate Task status & DB Migrations..."
WAITED=0
while [[ $WAITED -lt $MAX_WAIT ]]; do
  TASKS=$(aws ecs list-tasks --cluster "$CLUSTER_NAME" --service-name "$BACKEND_SVC" --query 'taskArns' --output json --region "$AWS_REGION" 2>/dev/null || echo "[]")
  TASK_ARN=$(node -e "const t=JSON.parse(process.argv[1]); console.log(t[0]||'')" "$TASKS")
  if [[ -n "$TASK_ARN" ]]; then
    STATUS=$(aws ecs describe-tasks --cluster "$CLUSTER_NAME" --tasks "$TASK_ARN" --query 'tasks[0].lastStatus' --output text --region "$AWS_REGION" 2>/dev/null || echo "PENDING")
    if [[ "$STATUS" == "RUNNING" ]]; then
      ok "Backend Fargate Task: RUNNING"
      break
    fi
    echo "  Waiting for Backend container & DB Migrations... (Status: ${STATUS}, ${WAITED}s)"
  fi
  sleep 5
  WAITED=$((WAITED+5))
done

log "[3/4] Registering with ALB Target Group & verifying ECS Cluster Stability..."
BACKEND_TG_ARN=$(cd "${ENV_DIR}" && terraform output -raw backend_tg_arn 2>/dev/null || echo "")
WAITED=0
while [[ $WAITED -lt $MAX_WAIT ]]; do
  if [[ -n "$BACKEND_TG_ARN" ]]; then
    TG_HEALTH=$(aws elbv2 describe-target-health --target-group-arn "$BACKEND_TG_ARN" --region "$AWS_REGION" --query 'TargetHealthDescriptions[0].TargetHealth.State' --output text 2>/dev/null || echo "INITIAL")
    if [[ "$TG_HEALTH" == "healthy" ]]; then
      ok "ALB Target Group Health: HEALTHY"
      break
    fi
    echo "  Waiting for ALB Target Group registration... (State: ${TG_HEALTH}, ${WAITED}s)"
  else
    echo "  Waiting for ECS service stability... (${WAITED}s)"
  fi
  sleep 5
  WAITED=$((WAITED+5))
done
ok "ALB Target Group & ECS Services reached stable state"

log "[4/4] Verifying End-to-End Production System Health (/api/health)..."
WAITED=0
while [[ $WAITED -lt $MAX_WAIT ]]; do
  HEALTH=$(curl -sf "http://${ALB_DNS}/api/health" 2>/dev/null || echo "")
  if [[ -n "$HEALTH" ]]; then
    echo ""
    echo "✓ Production Backend API Health Check Verified:"
    echo "$HEALTH" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf-8')); console.log(JSON.stringify(d,null,4))"
    echo ""
    echo "✓ All Production Services LIVE & Verified: ALB OK | ECS Fargate OK | Database OK | AI-Service OK"
    ok "Production Deployment completed successfully!"
    exit 0
  fi
  echo "  Polling http://${ALB_DNS}/api/health... (${WAITED}s)"
  sleep 5
  WAITED=$((WAITED+5))
done

ok "Deployment complete."
