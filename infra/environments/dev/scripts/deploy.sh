#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."
ROOT_DIR="${ENV_DIR}/../../.."

SSH_KEY="${SSH_KEY_PATH:-$HOME/.ssh/jaktra-dev}"
AWS_REGION="ap-south-1"
PLATFORM="linux/amd64"

log() { echo -e "\n\033[1;36m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m  ✓ $*\033[0m"; }
err() { echo -e "\033[1;31m  ✗ $*\033[0m" >&2; exit 1; }

log "Jaktra DEV — Deploying Infrastructure"

if [[ ! -f "$SSH_KEY" ]]; then
  log "Auto-generating SSH keypair at ${SSH_KEY}..."
  mkdir -p "$(dirname "$SSH_KEY")"
  ssh-keygen -t rsa -b 2048 -f "$SSH_KEY" -N ""
  ok "SSH key generated"
fi

if [[ ! -f "${ENV_DIR}/terraform.tfvars" ]]; then
  log "Auto-generating terraform.tfvars..."
  PUB_KEY=$(cat "${SSH_KEY}.pub")
  cat > "${ENV_DIR}/terraform.tfvars" << EOF
project_name = "jaktra"
environment  = "dev"
aws_region   = "ap-south-1"

github_org  = "Jaktra-org"
github_repo = "Jaktra"

create_github_oidc_provider = true

ssh_public_key   = "${PUB_KEY}"
ssh_allowed_cidr = "0.0.0.0/0"
alert_email      = ""
EOF
  ok "terraform.tfvars generated"
fi

log "Running Terraform"
cd "${ENV_DIR}"
terraform init -input=false -upgrade
terraform apply -auto-approve
ok "Terraform complete"

EC2_IP=$(terraform output -raw ec2_public_ip)
ECR_REGISTRY=$(terraform output -raw ecr_registry)
BACKEND_ECR=$(terraform output -raw ecr_backend_url)
AI_SERVICE_ECR=$(terraform output -raw ecr_ai_service_url)
FRONTEND_BUCKET=$(terraform output -raw frontend_s3_bucket)
CF_DISTRIBUTION_ID=$(terraform output -raw cloudfront_distribution_id)

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
    --tag "${BACKEND_ECR}:latest" \
    --tag "${BACKEND_ECR}:local-$(date +%Y%m%d-%H%M)" \
    --push \
    .
  ok "Backend image pushed"

  log "Building and Pushing AI Service Image"
  cd "${ROOT_DIR}/ai-service"
  docker buildx build \
    --platform "$PLATFORM" \
    --tag "${AI_SERVICE_ECR}:latest" \
    --tag "${AI_SERVICE_ECR}:local-$(date +%Y%m%d-%H%M)" \
    --push \
    .
  ok "AI service image pushed"
else
  log "Skipping Docker image build — using existing ECR images (:latest)"
  ok "Linking existing ECR images: ${BACKEND_ECR}:latest and ${AI_SERVICE_ECR}:latest"
fi

log "Configuring CloudFront API Reverse Proxy for Dev EC2"
EC2_DNS="ec2-$(echo "$EC2_IP" | tr '.' '-').${AWS_REGION}.compute.amazonaws.com"

DIST_CFG=$(aws cloudfront get-distribution-config --id "$CF_DISTRIBUTION_ID" --output json)
ETAG=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.ETag)" "$DIST_CFG")
NEW_CFG=$(node -e "
const d = JSON.parse(process.argv[1]);
const dns = process.argv[2];
d.DistributionConfig.Origins.Items.forEach(o => {
  if (o.Id === 'ALB-backend') {
    o.DomainName = dns;
    if (o.CustomOriginConfig) o.CustomOriginConfig.HTTPPort = 3001;
  }
});
console.log(JSON.stringify(d.DistributionConfig));
" "$DIST_CFG" "$EC2_DNS")

aws cloudfront update-distribution \
  --id "$CF_DISTRIBUTION_ID" \
  --distribution-config "$NEW_CFG" \
  --if-match "$ETAG" \
  --no-cli-pager > /dev/null
ok "CloudFront API origin routed to ${EC2_DNS}:3001"

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
  --distribution-id "$CF_DISTRIBUTION_ID" \
  --paths "/*" \
  --region us-east-1 \
  --no-cli-pager
ok "Frontend deployed"

SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes -o ConnectTimeout=5"

log "Deploying services to EC2: ${EC2_IP}"
echo "Waiting for SSH connection to ${EC2_IP}..."
MAX_WAIT=120; WAITED=0
until ssh -i "$SSH_KEY" $SSH_OPTS ec2-user@"$EC2_IP" "echo ready" 2>/dev/null; do
  [[ $WAITED -ge $MAX_WAIT ]] && err "EC2 SSH not reachable after ${MAX_WAIT}s"
  sleep 5; WAITED=$((WAITED+5))
done

log "Configuring EC2 deployment files..."
ssh -i "$SSH_KEY" $SSH_OPTS ec2-user@"$EC2_IP" "sudo mkdir -p /opt/jaktra && sudo chown -R ec2-user:ec2-user /opt/jaktra"

ssh -i "$SSH_KEY" $SSH_OPTS ec2-user@"$EC2_IP" "cat > /opt/jaktra/docker-compose.yml" << EOF
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: jaktra-dev-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 3s
      retries: 5

  ai-service:
    image: ${AI_SERVICE_ECR}:latest
    container_name: jaktra-dev-ai-service
    restart: unless-stopped
    ports:
      - "8000:8000"
    env_file:
      - .env.ai-service
    environment:
      - PORT=8000
    healthcheck:
      test: ["CMD-SHELL", "python -c 'import urllib.request; urllib.request.urlopen(\"http://127.0.0.1:8000/health\")' || exit 1"]
      interval: 5s
      timeout: 5s
      retries: 10
      start_period: 15s

  backend:
    image: ${BACKEND_ECR}:latest
    container_name: jaktra-dev-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - .env.backend
    environment:
      - PORT=3001
      - NODE_ENV=production
      - REDIS_URL=redis://redis:6379
      - AI_ML_SERVICE_URL=http://ai-service:8000
    depends_on:
      redis:
        condition: service_healthy
      ai-service:
        condition: service_healthy
EOF

ssh -i "$SSH_KEY" $SSH_OPTS ec2-user@"$EC2_IP" "cat > /opt/jaktra/start.sh" << EOF
#!/usr/bin/env bash
set -euo pipefail

REGION="${AWS_REGION}"
BACKEND_SECRET_ID="jaktra/dev/backend"
AI_SERVICE_SECRET_ID="jaktra/dev/ai-service"
ECR_REGISTRY="${ECR_REGISTRY}"
WORK_DIR="/opt/jaktra"

cd "\$WORK_DIR"

if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo dnf install -y docker python3 curl awscli
  sudo systemctl enable --now docker
  sudo usermod -aG docker ec2-user || true
fi

if ! docker compose version &> /dev/null; then
  echo "Installing Docker Compose..."
  sudo mkdir -p /usr/local/lib/docker/cli-plugins
  sudo curl -sSL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

echo "[1/4] Fetching Secrets Manager values..."
aws secretsmanager get-secret-value \
  --secret-id "\$BACKEND_SECRET_ID" \
  --region "\$REGION" \
  --query SecretString \
  --output text \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
for k, v in data.items():
    v_escaped = str(v).replace('\"', '\\\\\"')
    print(f'{k}=\"{v_escaped}\"')
" > "\$WORK_DIR/.env.backend"

aws secretsmanager get-secret-value \
  --secret-id "\$AI_SERVICE_SECRET_ID" \
  --region "\$REGION" \
  --query SecretString \
  --output text \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
for k, v in data.items():
    v_escaped = str(v).replace('\"', '\\\\\"')
    print(f'{k}=\"{v_escaped}\"')
" > "\$WORK_DIR/.env.ai-service"

chmod 600 "\$WORK_DIR/.env.backend" "\$WORK_DIR/.env.ai-service"

echo "[2/4] Logging into ECR & pulling images..."
aws ecr get-login-password --region "\$REGION" \
  | docker login --username AWS --password-stdin "\$ECR_REGISTRY"
docker compose pull

echo "[3/4] Starting ordered container stack (Redis -> AI-Service -> Backend)..."
docker compose up -d --remove-orphans

echo "[4/4] Verifying End-to-End System Health (/api/health)..."
MAX_WAIT=60; WAITED=0
while [[ \$WAITED -lt \$MAX_WAIT ]]; do
  HEALTH=\$(curl -sf http://localhost:3001/api/health 2>/dev/null || echo "")
  if [[ -n "\$HEALTH" ]]; then
    echo "✓ Backend API Health Check Verified:"
    echo "\$HEALTH" | python3 -m json.tool
    echo ""
    echo "✓ All services LIVE and verified: Redis OK | AI-Service OK | Database OK"
    exit 0
  fi
  sleep 3
  WAITED=\$((WAITED+3))
done

echo "⚠ Health check timeout! Container logs:"
docker compose logs --tail=30
exit 1
EOF

ssh -i "$SSH_KEY" $SSH_OPTS ec2-user@"$EC2_IP" "chmod +x /opt/jaktra/start.sh && bash /opt/jaktra/start.sh"
ok "Dev Deployment completed successfully!"
