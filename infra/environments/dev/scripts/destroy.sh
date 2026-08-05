#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."

log() { echo -e "\n\033[1;36m[$(date '+%H:%M:%S')] $*\033[0m"; }
ok()  { echo -e "\033[1;32m  ✓ $*\033[0m"; }

log "Jaktra DEV — Destroying Infrastructure compute layer"
cd "${ENV_DIR}"
terraform destroy -auto-approve
ok "Dev compute destroyed successfully"
