# Деплой https://rinulik.neeklo.ru/

Официальная инструкция для продакшена. Другие пути в репозитории не используются.

**Сервер:** `root@89.169.39.244`  
**Репозиторий:** [github.com/letoceiling-coder/rinulik.neeklo.ru](https://github.com/letoceiling-coder/rinulik.neeklo.ru)

## Где что лежит

| Назначение | Путь на сервере |
|------------|-----------------|
| Клон Git, **PM2 cwd**, SQLite (`prisma/prod.db`), каталог **`uploads/`**, артефакты **`dist/`** и **`dist-server/`** | **`/var/www/rinulik-build`** |

При переносе сервера копируйте вместе **`prisma/prod.db`** и каталог **`uploads/`**, иначе в БД останутся пути `/uploads/...` без файлов на диске (превью в админке не откроются).
| Корень nginx для **SPA** (синхронизация из `dist/`) | **`/var/www/rinulik.neeklo.ru`** |

**Порт API:** `4010` (тот же процесс отдаёт `/api`, `/uploads` и при необходимости SPA с диска; с nginx статика читается из `WEB_ROOT`, а запросы к `/api` и `/uploads` проксируются в Node — см. `deploy/nginx-rinulik.ssl.conf`).

## DNS

Запись **A** для `rinulik.neeklo.ru` → `89.169.39.244` (при необходимости **AAAA**).

## Первый запуск (с нуля)

```bash
ssh root@89.169.39.244

mkdir -p /var/www/rinulik.neeklo.ru
cd /var/www
git clone https://github.com/letoceiling-coder/rinulik.neeklo.ru.git rinulik-build
cd rinulik-build

cp deploy/env.production.example .env
nano .env   # DATABASE_URL, JWT_SECRET, FRONTEND_ORIGIN=https://rinulik.neeklo.ru, PORT=4010

bash deploy/deploy-remote.sh
```

Скрипт `deploy-remote.sh` ставит зависимости, собирает клиент и сервер, выполняет `prisma db push`, перезапускает PM2 и **копирует `dist/` в `/var/www/rinulik.neeklo.ru/`**, если этот каталог существует.

Дальше — nginx и TLS (ниже).

## Обновление после `git push` (основной цикл)

На сервере:

```bash
ssh root@89.169.39.244
cd /var/www/rinulik-build
bash deploy/pull-and-deploy.sh
```

Ветка по умолчанию: `main`. Другая ветка: `DEPLOY_BRANCH=develop bash deploy/pull-and-deploy.sh`.

Локально перед этим: `git push origin main`.

Проверка API: `curl -sS http://127.0.0.1:4010/api/health`

## Переменные окружения

Файл **`.env`** только в **`/var/www/rinulik-build/.env`** (в Git не коммитится).

Скопируйте из `deploy/env.production.example` и задайте минимум:

- `DATABASE_URL` — путь к SQLite (в примере под `/var/www/rinulik-build/`)
- `JWT_SECRET` — длинная случайная строка
- `FRONTEND_ORIGIN=https://rinulik.neeklo.ru`
- `PORT=4010`

Для SPA с тем же доменом **`VITE_API_URL` оставьте пустым** (запросы на `/api` с того же origin).

## Nginx и TLS для этого домена

На сервере могут быть **другие сайты** — не правьте чужие `server {}`, только добавьте конфиг для `rinulik.neeklo.ru`.

### 1. HTTP (webroot для ACME + статика)

Шаблон: `deploy/nginx-rinulik.neeklo.ru.conf` — в нём уже есть `location ^~ /.well-known/acme-challenge/` с `root /var/www/rinulik.neeklo.ru`, прокси `/api/` и `/uploads/` на Node.

```bash
cp deploy/nginx-rinulik.neeklo.ru.conf /etc/nginx/sites-available/rinulik.neeklo.ru
ln -sf /etc/nginx/sites-available/rinulik.neeklo.ru /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

### 2. Certbot (отдельное имя линии сертификата)

Так выпускается только сертификат для этого домена, без затрагивания чужих:

```bash
certbot certonly --webroot \
  -w /var/www/rinulik.neeklo.ru \
  -d rinulik.neeklo.ru \
  --cert-name rinulik.neeklo.ru \
  --non-interactive --agree-tos -m YOUR_EMAIL@example.com
```

Условие: для `rinulik.neeklo.ru` на **:80** уже отдаётся nginx с webroot, как в шаге 1. Не используйте `certbot --nginx` на общем хосте без проверки diff — безопаснее `certonly --webroot`.

Сертификаты появятся в `/etc/letsencrypt/live/rinulik.neeklo.ru/`. Обновление: `certbot renew`.

После появления сертификата в продакшене включайте в **`sites-enabled`** только файл **`rinulik.neeklo.ru.ssl`** (в нём уже есть `listen 80` для ACME и редиректа на HTTPS, и `listen 127.0.0.1:9443 ssl` для основного сайта). **Не включайте одновременно** отдельный сайт из `nginx-rinulik.neeklo.ru.conf` для того же `server_name` — nginx выдаст предупреждение о конфликте на порту 80, один из блоков будет проигнорирован.

### 3. HTTPS за HAProxy (89.169.39.244)

Внешний **:443** обслуживает **HAProxy** по SNI; nginx принимает TLS на **`127.0.0.1:9443`**.

1. В конец `/var/lib/haproxy/sni-web.map` добавить строку (**табуляция** между полями):  
   `rinulik.neeklo.ru	bk_nginx`
2. `systemctl reload haproxy`
3. В nginx подключить **`deploy/nginx-rinulik.ssl.conf`** (слушает `:9443` и публичный `:80` для ACME и редиректа на HTTPS), скопировав в `sites-available` / `sites-enabled` по тому же принципу, что в шаге 1.
4. `nginx -t && systemctl reload nginx`

## PM2

Имя процесса: **`generate-ai-video`**. Рабочий каталог в `deploy/ecosystem.config.cjs`: **`/var/www/rinulik-build`**.

Логи: `pm2 logs generate-ai-video`

### Превью в админке 404, а файлы в `uploads/` есть

Проверьте, откуда запущен процесс: `pm2 describe generate-ai-video` — поля **script path** и **exec cwd** должны быть внутри **`/var/www/rinulik-build`**, а не старого каталога вроде `/var/www/generate-al-video`. Иначе Node ищет `uploads/` не там и/или крутится старая сборка без нужных API.

Исправление: `pm2 delete generate-ai-video`, затем `cd /var/www/rinulik-build && pm2 start deploy/ecosystem.config.cjs && pm2 save`.

## Прочее

- Однократная подготовка ОС (Node 22, PM2): `sudo bash deploy/bootstrap-server.sh`
- Шаблон `deploy/nginx-site.conf.example` — **не** для rinulik; это вариант «весь трафик через Node». Для **rinulik.neeklo.ru** используйте только **`nginx-rinulik*.conf`** из этого каталога.

## Админ после сида

Email `admin@admin.local`, пароль из сида — смените в продакшене.
