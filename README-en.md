# rest-nodejs-cleanarch-template

REST API server template on component-based pure architecture

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![openapi initiative](https://img.shields.io/badge/openapiinitiative-%23000000.svg?style=for-the-badge&logo=openapiinitiative&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

## Project Description

The project is a REST API service template built on component-based pure architecture.

The project uses: database migrations, API versioning, Docker, Kafka, OpenAPI.

The project is based on the principles of pure (onion) architecture, with such elements as: domain, usecase, interface, infrastructure and domain events.
The specificity of the project is the addition of a component part, which is a set of necessary business objects.
The components, in turn, are implemented on a pure architecture.
Interaction between the components is realized by means of domain events of the parent domain.

## Project outline

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

![Project outline](projectdiagram.svg)

## Project structure

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

### Description of the project's catalogs

#### core

The **core** directory contains components common to the entire project. Such as: authentication, domain events, constants, interfaces, types, errors, helpers, etc.

#### api

The **api** catalog is divided into versions, where each version contains interfaces (routers), infrastructure (in the particular case of database operation) and system components. The system components, in turn, are pure architecture projects. Each component can contain catalogs: domain, usecases, infrastructure, interface, subscribers.

#### config

The **config** directory contains auxiliary components for working with configurations.

#### .env

The **.env** file contains the environment variables that are used in the project. All environment variables are described in the **.env.example** file.

## Project Usage

### OpenAPI

By default, the project runs on port 1234.

OpenAPI documentation is available at <http://localhost:1234/api-docs/v1/>

### Authentication

The project implements authentication using JWT. For authentication it is necessary to add a header with a request body in JWT Bearer format to all requests.

> [!NOTE]
> When using Postman, you must add a header with a request body in JWT Bearer format.
>
>- In the Authorization tab, select Auth type - JWT Bearer.
>- In the Algorithm field, select HS256.
>- In the Secret field, select 112233445566
>- In the Payload field enter
>
>```json
>{    
>    "userId": 123,
>    "userName": "Ivanov",
>    "exp": 1762962547
>}
>```

### API requests

API requests can be made with Postman or with curl.

Server address: <http://localhost:1234/api/v1/>

### Events

The project implements support of domain events. To work with events you should use **domain** and **usecases** components.

In the **domain** component interfaces for working with events are implemented. Services for working with events are implemented in **usecases** component.

To subscribe to events you should use the **subscribers** component. The **subscribers** component implements event subscribers.

To send events to external services you need to use the **infrastructure** component. The **infrastructure** component implements services for sending events. Kafka queue is used in the project.

## DB MIGRATIONS

### 1. PostgreSql

#### db-migrate

references:

[https://db-migrate.readthedocs.io/en/latest/](https://db-migrate.readthedocs.io/en/latest/)

[https://coding-overhead.com/post/db-migrate](https://coding-overhead.com/post/db-migrate)

#### Create a migration (for Windows, execute in Git bash)

```bash
    node_modules/.bin/db-migrate create v0_0_1 --config ./src/config/database.json --sql-file
```

#### Database creation

```bash
    node_modules/.bin/db-migrate db:create test --config ./src/config/database.json
```

#### DB rollback

```bash
    node_modules/.bin/db-migrate down --config ./src/config/database.json
```

#### New migration

```bash
    node_modules/.bin/db-migrate up --config ./src/config/database.json
```

### 2. Oracle DB

#### Marv package

references:

[https://github.com/guidesmiths/marv/](https://github.com/guidesmiths/marv/)
[https://www.npmjs.com/package/marv](https://www.npmjs.com/package/marv)
[https://www.npmjs.com/package/marv-oracledb-driver](https://www.npmjs.com/package/marv-oracledb-driver)

#### Creating a migration

1. In the folder /migrations create a file .sql
2. File numbering continues or starts with 001

#### Starting migration

Command to start migration

```bash
    npm run oraclemigration
```

## TESTS

Test Run Command

```bash
    npm run test
```

## STARTING

### In the docker

We're picking up the latest version

```bash
    sudo git pull
```

#### Starting the docker

Linux version

```bash
    sudo bash service_up.sh
```

Windows version

```bash
    bash service_up.sh
```

#### Stopping the dock

Linux version

```bash
    sudo bash service_down.sh
```

Windows version

```bash
    bash service_down.sh
```

### Project assembly

```bash
    npm run build
```

### Starting debug

```bash
    npm run dev
```

### Start of production

```bash
    npm run serve
```

### References

In the development of the template, the developments were used: [@tkssharma](https://github.com/tkssharma#hey-im-tarun-tkssharma), [@stemmlerjs](https://github.com/stemmlerjs/white-label)