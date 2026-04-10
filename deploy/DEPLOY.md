# Деплой rinulik.neeklo.ru

Репозиторий: [github.com/letoceiling-coder/rinulik.neeklo.ru](https://github.com/letoceiling-coder/rinulik.neeklo.ru)

## Перед началом

1. DNS: запись **A** для `rinulik.neeklo.ru` → `89.169.39.244` (и при необходимости **AAAA** для IPv6).
2. На сервере уже есть другие сайты — **не редактируйте чужие** файлы в `sites-enabled`, только добавьте новый.

## Безопасный выпуск сертификата (не трогает другие домены)

Используйте **отдельное имя линии сертификата** и **webroot только для этого сайта**:

```bash
certbot certonly --webroot \
  -w /var/www/rinulik.neeklo.ru \
  -d rinulik.neeklo.ru \
  --cert-name rinulik.neeklo.ru \
  --non-interactive --agree-tos -m YOUR_EMAIL@example.com
```

Условия:

- В nginx для `rinulik.neeklo.ru` на порту 80 уже есть `location ^~ /.well-known/acme-challenge/` с `root /var/www/rinulik.neeklo.ru` (как в `nginx-rinulik.neeklo.ru.conf`).
- Сначала включите **только HTTP**-блок, `nginx -t && systemctl reload nginx`, затем выполните certbot.

Файлы сертификата появятся в `/etc/letsencrypt/live/rinulik.neeklo.ru/` — это **не перезаписывает** каталоги других сертификатов.

Обновление всех сертификатов (как обычно): `certbot renew` — тоже по отдельным именам; ничего не «склеивается», если не меняли конфиги вручную.

## Установка на сервере (пример)

```bash
ssh root@89.169.39.244

mkdir -p /var/www/rinulik.neeklo.ru
cd /var/www

# Клонирование (или git pull при обновлении)
git clone https://github.com/letoceiling-coder/rinulik.neeklo.ru.git rinulik-build
cd rinulik-build

npm ci
npm run build

rsync -a --delete dist/ /var/www/rinulik.neeklo.ru/
# или: cp -a dist/. /var/www/rinulik.neeklo.ru/
```

Nginx:

```bash
cp deploy/nginx-rinulik.neeklo.ru.conf /etc/nginx/sites-available/rinulik.neeklo.ru
ln -sf /etc/nginx/sites-available/rinulik.neeklo.ru /etc/nginx/sites-enabled/rinulik.neeklo.ru
nginx -t && systemctl reload nginx
```

Затем выполните certbot (команда выше). После появления `/etc/letsencrypt/live/rinulik.neeklo.ru/`:

- Объедините конфиг: возьмите `deploy/nginx-rinulik.ssl.conf` (HTTPS + редирект HTTP→HTTPS, ACME на :80 сохраняется) как основу **или** допишите `server { listen 443 ... }` вручную, **указав только** пути `live/rinulik.neeklo.ru/`.
- `nginx -t && systemctl reload nginx`

Не используйте `certbot --nginx` без проверки diff, если на сервере кастомные правки: безопаснее оставаться на `certonly --webroot`.

## Обновление фронта

```bash
cd /var/www/rinulik-build && git pull && npm ci && npm run build
rsync -a --delete dist/ /var/www/rinulik.neeklo.ru/
```

## Пуш с локальной машины (Windows)

```powershell
cd c:\OSPanel\domains\generate-al-video
git remote add origin https://github.com/letoceiling-coder/rinulik.neeklo.ru.git
git push -u origin main
```

При запросе пароля GitHub используйте **Personal Access Token** с правом `repo`.
