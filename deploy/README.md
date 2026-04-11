# Деплой

Единая инструкция для продакшена сайта **https://rinulik.neeklo.ru/** — файл **[`DEPLOY.md`](./DEPLOY.md)**.

Кратко:

- код и API: **`/var/www/rinulik-build`**
- статика nginx: **`/var/www/rinulik.neeklo.ru`**
- обновление на сервере: `cd /var/www/rinulik-build && bash deploy/pull-and-deploy.sh`

Вспомогательные файлы в этой папке описаны в `DEPLOY.md`.
