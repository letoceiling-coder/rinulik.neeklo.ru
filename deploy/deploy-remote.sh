#!/usr/bin/env bash
# НА СЕРВЕРЕ из корня клона: cd /var/www/rinulik-build && bash deploy/deploy-remote.sh
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

if [[ ! -f .env ]]; then
  echo "Создайте .env (см. deploy/env.production.example)" >&2
  exit 1
fi

# Не ставить NODE_ENV=production до сборки — иначе npm ci пропустит devDependencies (vite, tsx, typescript).
npm ci
npx prisma generate
npx prisma db push
npm run db:seed || true
NODE_ENV=production npm run build

# Статика для nginx (rinulik.neeklo.ru); см. deploy/DEPLOY.md
if [[ -d /var/www/rinulik.neeklo.ru ]]; then
  rsync -a --delete dist/ /var/www/rinulik.neeklo.ru/
fi

pm2 restart generate-ai-video 2>/dev/null || pm2 start deploy/ecosystem.config.cjs
pm2 save
echo "OK — http://127.0.0.1:4010 (через nginx — ваш домен)"
