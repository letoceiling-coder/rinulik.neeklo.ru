#!/usr/bin/env bash
# Запускать НА СЕРВЕРЕ из корня проекта: bash deploy/deploy-remote.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

if [[ ! -f .env ]]; then
  echo "Создайте .env (см. deploy/env.production.example)" >&2
  exit 1
fi

export NODE_ENV=production
npm ci
npx prisma generate
npx prisma db push
npm run db:seed || true
npm run build

pm2 restart generate-ai-video 2>/dev/null || pm2 start deploy/ecosystem.config.cjs
pm2 save
echo "OK — http://127.0.0.1:4010 (через nginx — ваш домен)"
