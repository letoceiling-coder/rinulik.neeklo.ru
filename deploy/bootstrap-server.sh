#!/usr/bin/env bash
# Однократно на сервере (Ubuntu): зависимости для сборки и PM2.
set -euo pipefail
apt-get update -y
apt-get install -y ca-certificates curl gnupg
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
if ! command -v pm2 >/dev/null 2>&1; then
  npm install -g pm2
fi
