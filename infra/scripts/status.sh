#!/usr/bin/env bash
set -euo pipefail

AWS_REGION="ap-south-1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"

echo -e "\033[1;36m========================================================\033[0m"
echo -e "\033[1;36m          JAKTRA CLOUD INFRASTRUCTURE DASHBOARD         \033[0m"
echo -e "\033[1;36m========================================================\033[0m"
echo ""

# ----------------------------------------------------
# 1. BASE LAYER STATUS
# ----------------------------------------------------
echo -e "\033[1;34m[1/3] BASE INFRASTRUCTURE (Foundation)\033[0m"
RDS_STATUS=$(aws rds describe-db-instances --db-instance-identifier "jaktra-base-mysql" --region "$AWS_REGION" --query "DBInstances[0].DBInstanceStatus" --output text 2>/dev/null || echo "NOT CREATED")
CF_DIST_ID=$(cd "${ROOT_DIR}/infra/environments/base" 2>/dev/null && terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")
CF_STATUS="NOT CREATED"
if [[ -n "$CF_DIST_ID" ]]; then
  CF_STATUS=$(aws cloudfront get-distribution --id "$CF_DIST_ID" --query "Distribution.Status" --output text 2>/dev/null || echo "NOT CREATED")
fi

echo -e "  • RDS MySQL Database:  \033[1;32m${RDS_STATUS}\033[0m (db.t4g.micro, ~\$14/mo)"
echo -e "  • CloudFront CDN:      \033[1;32m${CF_STATUS}\033[0m (${CF_DIST_ID:-N/A}, Pay-per-request)"
echo -e "  • S3 Frontend Bucket:  \033[1;32mACTIVE\033[0m (jaktra-base-frontend)"
echo -e "  • ECR Container Repos: \033[1;32mACTIVE\033[0m (backend, ai-service)"
echo ""

# ----------------------------------------------------
# 2. DEV ENVIRONMENT STATUS
# ----------------------------------------------------
echo -e "\033[1;34m[2/3] DEV ENVIRONMENT (EC2 Compute)\033[0m"
DEV_INSTANCES=$(aws ec2 describe-instances --filters "Name=tag:Name,Values=jaktra-dev-ec2" "Name=instance-state-name,Values=running,stopped" --region "$AWS_REGION" --query "Reservations[0].Instances[0]" --output json 2>/dev/null || echo "null")

if [[ "$DEV_INSTANCES" != "null" && "$DEV_INSTANCES" != "" ]]; then
  DEV_ID=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.InstanceId)" "$DEV_INSTANCES")
  DEV_STATE=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.State.Name)" "$DEV_INSTANCES")
  DEV_IP=$(node -e "const d=JSON.parse(process.argv[1]); console.log(d.PublicIpAddress||'N/A')" "$DEV_INSTANCES")
  
  if [[ "$DEV_STATE" == "running" ]]; then
    echo -e "  • Status:               \033[1;32mACTIVE (RUNNING)\033[0m"
    echo -e "  • EC2 Instance ID:      ${DEV_ID}"
    echo -e "  • Public IP:            ${DEV_IP}"
    echo -e "  • Backend API URL:      http://${DEV_IP}:3001"
    echo -e "  • Estimated Dev Cost:   ~\$15 - \$30/month (active)"
  else
    echo -e "  • Status:               \033[1;33mSTOPPED\033[0m (${DEV_ID})"
    echo -e "  • Estimated Dev Cost:   \$0 compute cost while stopped"
  fi
else
  echo -e "  • Status:               \033[1;30mDESTROYED (NOT DEPLOYED)\033[0m"
  echo -e "  • Estimated Dev Cost:   \033[1;32m\$0/month\033[0m"
fi
echo ""

# ----------------------------------------------------
# 3. PRODUCTION ENVIRONMENT STATUS
# ----------------------------------------------------
echo -e "\033[1;34m[3/3] PRODUCTION ENVIRONMENT (ECS Fargate + ALB + NAT)\033[0m"
PROD_CLUSTER=$(aws ecs describe-clusters --clusters "jaktra-production" --region "$AWS_REGION" --query "clusters[0].status" --output text 2>/dev/null || echo "INACTIVE")

if [[ "$PROD_CLUSTER" == "ACTIVE" ]]; then
  PROD_SERVICES=$(aws ecs list-services --cluster "jaktra-production" --region "$AWS_REGION" --query "serviceArns" --output json 2>/dev/null || echo "[]")
  SVC_COUNT=$(node -e "const s=JSON.parse(process.argv[1]); console.log(s.length)" "$PROD_SERVICES")
  
  ALB_NAME=$(aws elbv2 describe-load-balancers --names "jaktra-production-alb" --region "$AWS_REGION" --query "LoadBalancers[0].DNSName" --output text 2>/dev/null || echo "N/A")
  NAT_STATE=$(aws ec2 describe-nat-gateways --filter "Name=tag:Name,Values=jaktra-production-nat" "Name=state,Values=available,pending" --region "$AWS_REGION" --query "NatGateways[0].State" --output text 2>/dev/null || echo "N/A")

  echo -e "  • Status:               \033[1;32mACTIVE (RUNNING)\033[0m"
  echo -e "  • ECS Cluster:          jaktra-production (${SVC_COUNT} services active)"
  echo -e "  • ALB Endpoint:         http://${ALB_NAME}"
  echo -e "  • NAT Gateway State:    ${NAT_STATE} (~\$32/mo)"
  echo -e "  • Estimated Prod Cost:  ~\$50 - \$70/month"
else
  echo -e "  • Status:               \033[1;30mDESTROYED (NOT DEPLOYED)\033[0m"
  echo -e "  • Estimated Prod Cost:  \033[1;32m\$0/month\033[0m"
fi

echo ""
echo -e "\033[1;36m========================================================\033[0m"
