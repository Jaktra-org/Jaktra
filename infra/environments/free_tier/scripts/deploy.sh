#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo ""
echo "========================================================"
echo ">>> Jaktra FREE-TIER — Deploying All Live Services"
echo "========================================================"

cd "${ENV_DIR}"

if [ ! -f "terraform.tfvars" ]; then
    echo "Error: terraform.tfvars not found in ${ENV_DIR}"
    exit 1
fi

echo ""
echo "[1/3] Initializing Terraform..."
terraform init -input=false

echo ""
echo "[2/3] Validating Configuration..."
terraform validate

echo ""
echo "[3/3] Deploying Upstash Redis, Render Backend, Render AI Service, and Vercel Frontend..."
terraform apply -auto-approve

echo ""
echo "========================================================"
echo "✓ DEPLOYMENT SUCCESSFUL — All services are live!"
echo "========================================================"
terraform output
