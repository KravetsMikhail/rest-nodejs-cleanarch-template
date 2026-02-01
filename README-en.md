# rest-nodejs-cleanarch-template

REST API server template on component-based pure architecture

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white) ![openapi initiative](https://img.shields.io/badge/openapiinitiative-%23000000.svg?style=for-the-badge&logo=openapiinitiative&logoColor=white) ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-000?style=for-the-badge&logo=apachekafka) ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Oracle](https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white)

## Project Description

The project is a REST API service template built on component-based pure architecture for implementing DDD (Domain Driven Design).

The project uses: database migrations, API versioning, Docker, Kafka, OpenAPI (Swagger), swagger-jsdoc.

The project is based on the principles of pure (onion) architecture, with such elements as: domain, usecase, interface, infrastructure and domain events.
The specificity of the project is the addition of a component part, which is a set of necessary business objects.  
The components, in turn, are implemented on a pure architecture.  
Interaction between the components is realized by means of domain events of the parent domain.

Applied patterns: Repository, Domain Events, Circuit Breaker and others.

### Circuit Breaker

The project implements the Circuit Breaker pattern to protect against cascading failures when working with external services and databases. Circuit Breaker automatically breaks connections when a threshold number of errors is reached and periodically checks service availability.

**Circuit Breaker Settings:**
- `CIRCUIT_BREAKER_FAILURE_THRESHOLD` - failure threshold (default: 3)
- `CIRCUIT_BREAKER_RESET_TIMEOUT` - recovery timeout (default: 10000ms)

Testing is performed using the Jest framework.

## Key Features

- **Clean Architecture** - Component-based DDD approach
- **Automatic Component Generation** - Component Generator
- **Swagger Documentation** - swagger-jsdoc integration
- **Multi-database** - PostgreSQL and Oracle
- **Event-driven Architecture** - Domain Events with Kafka
- **Circuit Breaker** - Protection against cascading failures
- **API Versioning** - Support for multiple versions
- **TypeScript** - Full type safety
- **Testing** - Jest framework
- **Docker** - Containerization

## Requirements

- **Node.js** 18.x or higher
- **npm** 8.x or higher
- **Go** 1.19 or higher (for Component Generator)
- **Docker** and **Docker Compose**
- **PostgreSQL** or **Oracle** database

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template.git
cd rest-nodejs-cleanarch-template
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env file with your settings
```

### 3. Build Component Generator

```bash
cd src/utils/component-generator
go build -o component-generator.exe
```

### 4. Run Project

```bash
# Development
npm run dev

# Production
npm run build
npm run serve
```

### 5. Access Documentation

- **Swagger UI**: `http://localhost:1234/api-docs`
- **Health Check**: `http://localhost:1234/health`
- **Examples**: [EXAMPLES-en.md](./EXAMPLES-en.md)

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
                    component "usecase" as usecase2
                    component "subscribers" as subscribers2
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
|       |       ├───kafka
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

### Events

The project supports domain events. To work with events, you must use interfaces and components from **core\domain\events**.

To send events to external services, it is necessary to implement the corresponding service in **api/v1/infrastructure**. The project uses the Kafka message broker.

## How to launch a project

### Launch in docker

To check and test, you need to run the dockers of the following projects (see the readme of each project):

1. Authentication Project [rest-nodejs-cleanarch-template-auth](https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template-auth). Implemented on [keycloak](https://github.com/keycloak/keycloak).

    ```bash
    git clone https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template-auth.git
    ```

    ```bash
    cd rest-nodejs-cleanarch-template-auth
    ```

    Add the .env file to the root folder (see the example in .env.example)

    Launching dockers:

    ```bash
    docker compose up
    ```

    Then:
    - go to the Keycloack interface <http://localhost:8282>
    - set the login and password of the administrator, for example admin | admin
    - select Realm: rest-nodejs-cleanarch-template
    - add a user, for example user1. In the Credentials tab, create a user password.

2. The design of the core template on a clean architecture [rest-nodejs-cleanarch-template](https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template.git)

    ```bash
    git clone https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template.git
    ```

    ```bash
    cd rest-nodejs-cleanarch-template
    ```

    Add the .env.production.local file to the root folder (see the example in .env.example)

    Launching dockers:

    ```bash
    docker compose up
    ```

    Creating a database (for a detailed description, see below):

    ```bash
    node_modules/.bin/db-migrate db:create test --config ./src/config/database.json
    ```

    Launching migrations:

    ```bash
    node_modules/.bin/db-migrate up --config ./src/config/database.json
    ```

3. Project UI [rest-nodejs-cleanarch-template-ui](https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template-ui). Implemented on REACT, a framework [Refine](https://github.com/refinedev/refine)

    ```bash
    git clone https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template-ui.git
    ```

    ```bash
    cd rest-nodejs-cleanarch-template-ui
    ```

    Add the .env.production.local file to the root folder (see the example in .env.example)

    Launching dockers:

    ```bash
    docker compose up
    ```

## OpenAPI and Swagger

The project uses two approaches for API documentation:

### 1. Swagger JSDoc (Recommended Approach)

Automatic documentation generation from JSDoc comments in code:

- **Swagger UI**: `http://localhost:1234/api-docs`
- **JSON Specification**: `http://localhost:1234/api-docs.json`
- **Automatic Generation**: From comments in controllers
- **Component Generator**: Creates controllers with ready annotations

### 2. OpenAPI YAML

Traditional approach with YAML files:

- **Location**: `src/api/v1/openapi/openapi.yaml`
- **Access**: `http://localhost:1234/api-docs/v1/`
- **Manual Editing**: When necessary

### Example JSDoc Annotations

```typescript
/**
 * @swagger
 * tags:
 *   name: tasks
 *   description: Operations with tasks
 */
export class TaskController {
    /**
     * @swagger
     * /tasks:
     *   get:
     *     summary: Get list of tasks
     *     tags: [tasks]
     *     security:
     *       - JWT: [read]
     *     responses:
     *       200:
     *         description: List of tasks
     */
    public getTasks = (req: Request, res: Response): void => {
        // Implementation
    }
}
```

### API Requests

API requests can be made with Postman or with curl.

Server address: `http://localhost:1234/api/v1/`

## DEVELOPMENT TOOLS

### Component Generator

The project includes a console component generator in Go that automatically creates the structure for new API components following the Clean Architecture pattern.

**Location:** `src/utils/component-generator/`

**Key Features:**
- Automatic generation of complete component structure (entities, value objects, events, repositories, controllers, use cases)
- Support for generating fields from SQL migrations
- Automatic OpenAPI documentation generation
- Follows Clean Architecture pattern
- Automatic creation of `@DbType` decorators for ORM

**Usage:**
```bash
cd src/utils/component-generator

# Basic component generation
./component-generator.exe generate --singular product --plural products --version v1

# Generation with fields from SQL migration
./component-generator.exe generate --singular product --plural products --migration ../../../migrations/001_create_products.sql
```

**Supported SQL Types:**
- `INTEGER/INT/SERIAL` → `number`
- `VARCHAR/TEXT/CHAR` → `string`
- `BOOLEAN/BOOL` → `boolean`
- `DATE/TIMESTAMP` → `Date`
- `DECIMAL/NUMERIC/FLOAT/DOUBLE` → `number`

**Generated Structure:**
```
src/api/v1/components/{plural}/
├── domain/
│   ├── entities/           # Entity classes
│   ├── valueobjects/        # Value Objects
│   ├── events/             # Domain events
│   ├── repositories/        # Repository interfaces
│   ├── datasources/         # Data source interfaces
│   └── types/               # Response types
├── infrastructure/           # Data source implementations
├── interface/                # Controllers and routes
└── usecases/                 # Use cases
```

**Documentation:** 
- Detailed description: `docs/component-generator.md`
- Practical examples: [EXAMPLES.md](./EXAMPLES.md#создание-нового-компонента)

### Swagger JSDoc Integration

For automatic API documentation generation, swagger-jsdoc is used:

**Installation:**
```bash
npm install swagger-jsdoc @types/swagger-jsdoc
```

**Configuration:**
- Configuration file: `src/config/swagger.ts`
- Server integration: `src/server.ts`
- Automatic processing of JSDoc comments

**Usage:**
1. Add JSDoc annotations to controllers
2. Component Generator automatically creates annotations
3. Documentation available at: `http://localhost:1234/api-docs`

**Documentation:** 
- Detailed description: `docs/swagger-integration.md`
- Practical examples: [EXAMPLES.md](./EXAMPLES.md#интеграция-с-swagger)

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

## LOAD TESTING

The project includes ready-to-use configurations for load testing using Artillery. Load testing allows you to evaluate server performance under different load levels and determine its throughput capacity.

### Preparation for Testing

#### 1. Install Artillery

```bash
npm install -g artillery
```

#### 2. Start the Server

Make sure the server is running and accessible at `http://localhost:1234`:

```bash
npm run dev
```

#### 3. Check Availability

```bash
curl http://localhost:1234/health
```

### Test Configurations

Two main configurations are prepared in the project:

#### 1. Test without Authentication (`load-test-no-auth.yml`)

Tests basic endpoints without JWT authentication:
- Health check: `/health`
- Root endpoint: `/`
- Swagger docs: `/api-docs`

#### 2. Test with JWT Authentication (`load-test-with-auth.yml`)

Tests protected endpoints with JWT tokens:
- All endpoints from the first test
- API endpoints: `/api/v1/tasks`
- Automatic JWT token acquisition and usage

### Running Load Tests

#### Basic Test (without authentication)

```bash
npx artillery run load-test-no-auth.yml
```

#### Extended Test (with JWT authentication)

```bash
npx artillery run load-test-with-auth.yml
```

#### Background Mode

```bash
npx artillery run load-test-no-auth.yml &
```

### Load Testing Phases

Testing includes the following phases:

1. **Warm Up (60 sec)** - Server warm-up at 50 RPS
2. **Ramp Up (60 sec)** - Gradual increase to 100 RPS
3. **Sustained Load (180 sec)** - Stable load at 200 RPS
4. **Peak Load (60 sec)** - Peak load at 500 RPS
5. **Stress Test (120 sec)** - Stress load at 1000 RPS
6. **Load to Failure (300 sec)** - Load to failure at 2000+ RPS

### Results Analysis

#### Key Metrics

- **Request Rate**: Number of requests per second
- **Response Time**: Response time (min, max, mean, median, p95, p99)
- **Error Rate**: Percentage of errors
- **Throughput**: Total throughput capacity

#### Optimal Performance Indicators for This Project

- **Stable Load**: 100-200 RPS
- **Maximum Stable**: 300 RPS  
- **Peak**: up to 500 RPS
- **Critical**: > 500 RPS (degradation begins)

#### Example Test Results

```
All VUs finished. Total time: 18 minutes, 35 seconds

Summary report:
http.request_rate: 279/sec
http.requests: 757061
http.response_time:
  min: 0
  mean: 770.8ms
  median: 5ms
  p95: 3328.3ms
  p99: 4231.1ms
vusers.completed: 75119
vusers.failed: 669150
```

### Optimization Recommendations

#### Server Settings for High Load

1. **Rate Limiting**: Increase limits in `src/core/middlewares/rate-limiter.middleware.ts`
2. **Connection Pool**: Optimize in `src/api/v1/infrastructure/postgresql.datasource.ts`
3. **JWT Cache**: Configure token caching
4. **Circuit Breaker**: Configure trigger thresholds

#### Environment Variables for Performance

```bash
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50000

# PostgreSQL
PG_POOL_MAX=100
PG_POOL_MIN=10
PG_POOL_IDLE_TIMEOUTMillis=30000

# Circuit Breaker
CIRCUIT_BREAKER_FAILURE_THRESHOLD=10
CIRCUIT_BREAKER_RESET_TIMEOUT=30000
```

### Monitoring During Testing

#### System Metrics

```bash
# CPU and memory
htop

# Network connections
netstat -an | grep :1234

# Server logs
tail -f logs/app.log
```

#### Application Metrics

- Health check endpoint: `/health`
- Swagger docs: `/api-docs`
- Real-time application logs

### Creating Custom Tests

#### Example Custom Configuration

```yaml
config:
  target: 'http://localhost:1234'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50

scenarios:
  - name: "Custom API Test"
    requests:
      - get:
          url: "/api/v1/tasks"
          headers:
            Authorization: "Bearer {{ token }}"
```

#### Running Custom Test

```bash
artillery run custom-test.yml
```

### Troubleshooting

#### Common Errors

1. **ECONNREFUSED** - Server not running or port occupied
2. **ETIMEDOUT** - Server overloaded, increase timeouts
3. **Memory leaks** - Check for memory leaks during long tests

#### Solutions

```bash
# Free port
netstat -ano | findstr :1234
taskkill /PID <PID> /F

# Memory check
node --inspect src/server.ts
```

### Artillery Documentation

- [Official Documentation](https://artillery.io/docs/)
- [Configuration Examples](https://artillery.io/docs/guides/getting-started/writing-your-first-test.html)

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