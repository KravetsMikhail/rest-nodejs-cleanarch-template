# rest-nodejs-cleanarch-template
Шаблон REST API сервера на чистой архитектуре (гескагональная архитектура)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

[TypeScript] [Docker] [Kafka] [Clean architecture]

## МИГРАЦИИ

### 1. PostgreSql
#### db-migrate
ссылки: 
[https://db-migrate.readthedocs.io/en/latest/](https://db-migrate.readthedocs.io/en/latest/)
[https://coding-overhead.com/post/db-migrate](https://coding-overhead.com/post/db-migrate)
#### Создание миграции (для Windows выполнить в Git bash)
    node_modules/.bin/db-migrate create v0_0_1 --config ./src/core/config/database.json --sql-file
#### Создание БД
    node_modules/.bin/db-migrate db:create test --config ./src/core/config/database.json
#### Откат БД
    node_modules/.bin/db-migrate down --config ./src/core/config/database.json
#### Новая миграция
    node_modules/.bin/db-migrate up --config ./src/core/config/database.json

### 2. Oracle DB
#### Пакет Marv
ссылки:
[https://github.com/guidesmiths/marv/](https://github.com/guidesmiths/marv/)
[https://www.npmjs.com/package/marv](https://www.npmjs.com/package/marv)
[https://www.npmjs.com/package/marv-oracledb-driver](https://www.npmjs.com/package/marv-oracledb-driver)

#### Создание миграции
1. В папке /migrations создаем файл .sql
2. Номерацию файла продолжаем или начинаем с 001

#### Запуск миграции
Команда запуска миграции

    npm run oraclemigration

## ТЕСТЫ
Команда запуска тестов

    npm run test

## ЗАПУСК
### В докере
Забираем последнюю версию

    sudo git pull

Запуск докера

    sudo bash service_up.sh

Остановка докера

    sudo bash service_down.sh

### Сборка проекта

    npm run build

### Запуск debug 

    npm run dev

### Запуск production

    npm run serve
