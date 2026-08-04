#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_DIR="${SCRIPT_DIR}/.."
SSH_KEY="${SSH_KEY_PATH:-$HOME/.ssh/jaktra-dev}"
PULL_IMAGES="${1:-}"

cd "${ENV_DIR}"
EC2_IP=$(terraform output -raw ec2_public_ip 2>/dev/null) || { echo "No public IP found. Deploy first."; exit 1; }

[[ -f "$SSH_KEY" ]] || { echo "SSH key not found: $SSH_KEY"; exit 1; }

echo "Restarting services on EC2: ${EC2_IP}"

if [[ "$PULL_IMAGES" == "--pull" ]]; then
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'sudo /opt/jaktra/start.sh'
else
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no ec2-user@"$EC2_IP" 'sudo docker compose -f /opt/jaktra/docker-compose.yml up -d --remove-orphans'
fi
