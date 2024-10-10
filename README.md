# rest-nodejs-cleanarch-template
Шаблон REST API сервера на чистой архитектуре

## db-migrate
ссылки: 
[https://db-migrate.readthedocs.io/en/latest/](https://db-migrate.readthedocs.io/en/latest/)
[https://coding-overhead.com/post/db-migrate](https://coding-overhead.com/post/db-migrate)
### Создание миграции (для Windows выполнить в Git bash)
    node_modules/.bin/db-migrate create v0_0_1 --config ./src/config/database.json --sql-file
### Создание БД
    node_modules/.bin/db-migrate db:create test --config ./src/config/database.json
### Откат БД
    node_modules/.bin/db-migrate down --config ./src/config/database.json
### Новая миграция
    node_modules/.bin/db-migrate up --config ./src/config/database.json

## ЗАПУСК
### запуск debug 
#### Windows
    SET DEBUG=rest-nodejs-cleanarch-template:* & npm run dev
#### Linux
    DEBUG=:rest-nodejs-cleanarch-template* npm run dev

### запуск production
#### Windows
    SET NODE_ENV=production & npm run start
#### Linux
    NODE_ENV=production npm run start

### Запуск проекта из pm2
    sudo su
    pm2 start src/index.js --name restnodejscleanarch -- start

