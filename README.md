# rest-nodejs-cleanarch-template [[English version]](https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template/blob/main/README-en.md)

Шаблон REST API сервера на компонентной чистой архитектуре

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![openapi initiative](https://img.shields.io/badge/openapiinitiative-%23000000.svg?style=for-the-badge&logo=openapiinitiative&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

## Описание проекта

Проект представляет собой шаблон REST API сервиса, построенный на компонентной чистой архитектуре.

В проекте применяются: миграции БД, версионность API, Docker, Kafka, OpenAPI.

В основе проекта лежат принципы чистой (луковой) архитектуры, с такими элементами как: домен, usecase, интерфейс, инфраструктура и доменные события.
Спецификой проекта является добавление компонентной части, которая представляет собой набор необходимых бизнес-объектов.
Компоненты, в свою очередь, реализованы на чистой архитектуре.
Взаимодействие между компнентами реализовано средствами доменных событий родительского домена.

## Схема проекта

<!--
@startuml projectdiagram
left to right direction
artifact "Проект" {
    folder "API" { 
        folder "V1" {
            component "interface"
            folder "components" {
                hexagon "task" {
                    component "interface" as intr1
                    component "domain" as domain1
                    component "usecase" as usecase1
                    component "infrastructure" as infr1
                }
                hexagon "notification" {
                    component "interface" as intr2
                    component "domain" as domain2
                    component "usecase" as usecase2
                    component "infrastructure" as infr2
                }
            }
            component "infrastructure"
            component "openapi"
        }
    }
    folder "CORE" {
        component "midlware"
        component "domen"
        component "utils"
        component "errors"
        component "constants"
        component "logger"
    }
}
@enduml
-->

![Схема проекта](projectdiagram.svg)

## Структура проекта

```txt
├───api
│   └───v1
│       ├───components
│       │       ├───notification
│       │       │        ├───domain
│       │       │        ├───services
│       │       │        ├───subscribers
│       │       │        └───usecases
│       │       └───tasks
│       │                ├───domain
│       │                │       ├───datasources
│       │                │       ├───entities
│       │                │       ├───events
│       │                │       ├───repositories
│       │                │       ├───types
│       │                │       └───valueobjects
│       │                ├───infrastructure
│       │                ├───interface
│       │                └───usecases
│       ├───infrastructure
│       │       ├───oracle
│       │       └───postgresql
│       ├───interface
│       └───openapi
├───config
└───core
        ├───constants
        ├───domain
        │       ├───events
        │       └───types
        ├───errors
        ├───logger
        ├───middlewares
        │       ├───auth
        │       └───errors
        ├───subscribers
        └───utils
```

### Описание каталогов проекта

#### core

Каталог **core** содержит общие для всего проекта компоненты. Такие как: аутентификация, доменнные события, константы, интерфейсы, типы, ошибки, хелперы и т.д.

#### api

Каталог **api** разбит по версиям, где каждая версия содержит интерфейсы (роуты), инфраструктуру (в частном случае работу с БД) и компоненты системы. Компоненты системы, в свою очередь, представляют собой проекты чистой архитектуры. Каждый компонент может содержать каталоги: domain, usecases, infrastructure, interface, subscribers.

#### config

Каталог **config** содержит вспомогательные компоненты для работы с конфигурациями.

#### .env

Файл **.env** содержит переменные окружения, которые используются в проекте. Все переменные окружения описаны в файле **.env.example**.

## Использование проекта

### OpenAPI

По умолчанию проект запускается на порту 1234.

OpenAPI документация доступна по адресу <http://localhost:1234/api-docs/v1/>

### Аутентификация

В проекте реализована аутентификация с помощью JWT. Для аутентификации необходимо во всех запросах добавить заголовок с телом запроса в формате JWT Bearer.

> [!NOTE]
> При использовании Postman необходимо добавить заголовок с телом запроса в формате JWT Bearer.
>
>- Во влкадке Authorization выбрать Auth type - JWT Bearer
>- В поле Algorithm выбрать - HS256
>- В поле Secret - 112233445566
>- В поле Payload ввести
>
>```json
>{    
>    "userId": 123,
>    "userName": "Ivanov",
>    "exp": 1762962547
>}
>```

### Запросы к API

Запросы к API можно выполнять с помощью Postman или с помощью curl.

Адрес сервера: <http://localhost:1234/api/v1/>

### События

В проекте реализована поддержка доменных событий. Для работы с событиями необходимо использовать компоненты **domain** и **usecases**.

В компоненте **domain** реализованы интерфейсы для работы с событиями. В компоненте **usecases** реализованы сервисы для работы с событиями.

Для подписки на события необходимо использовать компонент **subscribers**. В компоненте **subscribers** реализованы подписчики на события.

Для отправки событий внешним сервисам необходимо использовать компонент **infrastructure**. В компоненте **infrastructure** реализованы сервисы для отправки событий. В проекте используется очередь Kafka.

## МИГРАЦИИ БД

### 1. PostgreSql

#### db-migrate

ссылки:

[https://db-migrate.readthedocs.io/en/latest/](https://db-migrate.readthedocs.io/en/latest/)
[https://coding-overhead.com/post/db-migrate](https://coding-overhead.com/post/db-migrate)

#### Создание миграции (для Windows выполнить в Git bash)

```bash
    node_modules/.bin/db-migrate create v0_0_1 --config ./src/config/database.json --sql-file
```

#### Создание БД

```bash
    node_modules/.bin/db-migrate db:create test --config ./src/config/database.json
```

#### Откат БД

```bash
    node_modules/.bin/db-migrate down --config ./src/config/database.json
```

#### Новая миграция

```bash
    node_modules/.bin/db-migrate up --config ./src/config/database.json
```

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

```bash
    npm run oraclemigration
```

## ТЕСТЫ

Команда запуска тестов

```bash
    npm run test
```

## ЗАПУСК

### В докере

Забираем последнюю версию

```bash
    sudo git pull
```

#### Запуск докера

Linux

```bash
    sudo bash service_up.sh
```

Windows (в Git bash)

```bash
    bash service_up.sh
```

#### Остановка докера

Linux

```bash
    sudo bash service_down.sh
```

Windows (в Git bash)

```bash
    bash service_down.sh
```

### Сборка проекта

```bash
    npm run build
```

### Запуск debug

```bash
    npm run dev
```

### Запуск production

```bash
    npm run serve
```

### Ссылки

В разработке шаблона использовались наработки: [@tkssharma](https://github.com/tkssharma#hey-im-tarun-tkssharma), [@stemmlerjs](https://github.com/stemmlerjs/white-label)
