#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."

log() { echo -e "\n\033[1;34m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m  ✓ $*\033[0m"; }

log "Jaktra BASE — Destroying Infrastructure (VPC, RDS, S3, ECR)"
cd "${ENV_DIR}"
terraform destroy -auto-approve
ok "Base infrastructure destroyed successfully"
