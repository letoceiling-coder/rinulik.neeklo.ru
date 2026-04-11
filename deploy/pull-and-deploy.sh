#!/usr/bin/env bash
# На сервере: обновить код из Git и пересобрать.
# Использование: cd /var/www/generate-al-video && bash deploy/pull-and-deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
BRANCH="${DEPLOY_BRANCH:-main}"
git fetch origin
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

exec bash deploy/deploy-remote.sh
