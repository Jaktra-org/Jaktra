#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."

echo -e "\033[1;36m========================================================\033[0m"
echo -e "\033[1;36m          JAKTRA FREE-TIER INFRASTRUCTURE STATUS        \033[0m"
echo -e "\033[1;36m========================================================\033[0m"
echo ""

cd "${ENV_DIR}"

FRONTEND_URL=$(terraform output -raw frontend_url 2>/dev/null || echo "https://jaktra-frontend.vercel.app")
BACKEND_URL=$(terraform output -raw backend_url 2>/dev/null || echo "https://jaktra-backend.onrender.com")
AI_URL=$(terraform output -raw ai_service_url 2>/dev/null || echo "https://jaktra-ai-service.onrender.com")
REDIS_EP=$(terraform output -raw redis_endpoint 2>/dev/null || echo "N/A")

echo -e "\033[1;34m[1/4] VERCEL FRONTEND\033[0m"
echo -e "  • URL:                 \033[1;32m${FRONTEND_URL}\033[0m"
echo -e "  • Monthly Cost:        \033[1;32m$0.00 / month (Free Tier)\033[0m"
echo ""

echo -e "\033[1;34m[2/4] RENDER BACKEND API\033[0m"
echo -e "  • URL:                 \033[1;32m${BACKEND_URL}\033[0m"
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${BACKEND_URL}/api/health" 2>/dev/null || echo "TIMEOUT/UNREACHABLE")
echo -e "  • Health (/api/health):\033[1;33m${BACKEND_STATUS}\033[0m"
echo -e "  • Monthly Cost:        \033[1;32m$0.00 / month (Free Tier)\033[0m"
echo ""

echo -e "\033[1;34m[3/4] RENDER AI SERVICE\033[0m"
echo -e "  • URL:                 \033[1;32m${AI_URL}\033[0m"
AI_STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "${AI_URL}/health" 2>/dev/null || echo "TIMEOUT/UNREACHABLE")
echo -e "  • Health (/health):    \033[1;33m${AI_STATUS}\033[0m"
echo -e "  • Monthly Cost:        \033[1;32m$0.00 / month (Free Tier)\033[0m"
echo ""

echo -e "\033[1;34m[4/4] UPSTASH SERVERLESS REDIS\033[0m"
echo -e "  • Endpoint:            \033[1;32m${REDIS_EP}\033[0m"
echo -e "  • Monthly Cost:        \033[1;32m$0.00 / month (Free 10k req/day)\033[0m"
echo ""

echo -e "\033[1;36m========================================================\033[0m"
echo -e "  TOTAL ESTIMATED CLOUD BILL: \033[1;32m$0.00 / month\033[0m"
echo -e "\033[1;36m========================================================\033[0m"
