# Деплой Generate AI Video (через Git)

## Стек

- Один процесс **Node** отдаёт **API** + статику **Vite `dist/`** в `NODE_ENV=production`.
- **SQLite** (`prisma/prod.db` на сервере — в репозиторий не коммитится), загрузки в `uploads/`.
- **PM2** + опционально **nginx** (TLS, прокси на `127.0.0.1:4010`).

---

## 1. Подготовка сервера (один раз)

```bash
sudo bash deploy/bootstrap-server.sh
sudo mkdir -p /var/www && sudo chown -R "$USER":"$USER" /var/www
```

Клонирование репозитория (подставьте URL своего remote):

```bash
cd /var/www
git clone https://github.com/ВАШ_АККАУНТ/ВАШ_РЕПО.git generate-al-video
cd generate-al-video
```

Для **приватного** репозитория: [Deploy key](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys) на сервере или `git clone` по HTTPS с access token.

---

## 2. Переменные окружения (один раз)

```bash
cd /var/www/generate-al-video
cp deploy/env.production.example .env
nano .env
```

Обязательно: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN` (публичный URL сайта), `PORT=4010`.

Файл `.env` **не в Git** — на сервере хранится только локально.

---

## 3. Первая сборка и PM2

```bash
cd /var/www/generate-al-video
bash deploy/deploy-remote.sh
```

Проверка: `curl -sS http://127.0.0.1:4010/api/health`

---

## 4. Обновление после `git push` (основной цикл)

На **локальной машине**:

```bash
git add -A && git commit -m "..." && git push origin main
```

На **сервере**:

```bash
cd /var/www/generate-al-video
bash deploy/pull-and-deploy.sh
```

Либо вручную:

```bash
git pull origin main
bash deploy/deploy-remote.sh
```

Ветку можно переопределить: `DEPLOY_BRANCH=develop bash deploy/pull-and-deploy.sh`

---

## 5. Nginx + SSL (по желанию)

```bash
sudo cp deploy/nginx-site.conf.example /etc/nginx/sites-available/generate-ai-video.conf
# Замените YOUR_DOMAIN.ru и пути к сертификатам
sudo ln -sf /etc/nginx/sites-available/generate-ai-video.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Сертификат: `certbot certonly --nginx -d YOUR_DOMAIN.ru`.

При работе через nginx **не задавайте** `VITE_API_URL` в сборке: запросы идут с того же origin (`/api`, `/uploads`).

---

## Админ после сида

- Email: `admin@admin.local`
- Пароль: `admin123` — смените в продакшене.

---

## Альтернатива без входа на сервер (CI)

Можно подключить **GitHub Actions**: по push в `main` — SSH на сервер и выполнение `bash deploy/pull-and-deploy.sh` (секреты: `SSH_PRIVATE_KEY`, `HOST`, `USER`). Шаблон под ваш runner не включён — при необходимости добавьте отдельно.
