#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."
SSH_KEY="${SSH_KEY_PATH:-$HOME/.ssh/jaktra-dev}"

EC2_IP=$(cd "$ENV_DIR" && terraform output -raw ec2_public_ip 2>/dev/null || echo "")

if [[ -z "$EC2_IP" ]]; then
  echo "Error: Could not retrieve EC2 IP from Terraform output."
  exit 1
fi

SERVICE="${1:-backend}"

echo "Streaming live logs for '${SERVICE}' from EC2 (${EC2_IP})... (Press Ctrl+C to stop)"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null ec2-user@"$EC2_IP" \
  "docker logs -f jaktra-dev-${SERVICE} --tail 100"
