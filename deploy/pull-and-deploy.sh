#!/usr/bin/env bash
# На сервере: git pull и полная пересборка (см. deploy/DEPLOY.md).
# Использование: cd /var/www/generate-al-video && bash deploy/pull-and-deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
BRANCH="${DEPLOY_BRANCH:-main}"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

exec bash deploy/deploy-remote.sh
