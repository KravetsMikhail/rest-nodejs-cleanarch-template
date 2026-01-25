# Примеры использования проекта

## Оглавление

- [Создание нового компонента](#создание-нового-компонента)
- [Работа с миграциями БД](#работа-с-миграциями-бд)
- [Интеграция с Swagger](#интеграция-с-swagger)
- [Тестирование компонентов](#тестирование-компонентов)
- [Работа с доменными событиями](#работа-с-доменными-событиями)
- [Развертывание в Docker](#развертывание-в-docker)

## Создание нового компонента

### Пример 1: Базовый компонент Product

Создадим компонент для управления продуктами:

#### 1. Создание SQL миграции

```sql
-- migrations/001_create_products.sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    category_id INTEGER,
    is_active BOOLEAN DEFAULT true,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdby VARCHAR(100),
    updatedby VARCHAR(100)
);
```

#### 2. Генерация компонента

```bash
cd src/utils/component-generator
./component-generator.exe generate --singular product --plural products --migration migrations/001_create_products.sql
```

#### 3. Результат генерации

```
✅ Component 'product' generated successfully!
📁 Location: ../../api/v1/components/products

Generated files:
├── domain/
│   ├── entities/
│   │   ├── product.entity.ts
│   │   └── productid.entity.ts
│   ├── valueobjects/
│   │   ├── product.name.ts
│   │   └── product.search.ts
│   ├── events/
│   │   ├── product.created.events.ts
│   │   ├── product.updated.events.ts
│   │   └── product.deleted.events.ts
│   ├── repositories/
│   │   └── i.product.repository.ts
│   ├── datasources/
│   │   └── i.product.datasource.ts
│   └── types/
│       └── response.ts
├── infrastructure/
│   └── postgresql.datasource.ts
├── interface/
│   ├── product.controller.ts
│   └── product.routes.ts
└── usecases/
    ├── create-product.usecase.ts
    └── get-product.usecase.ts
```

#### 4. Сгенерированный контроллер с Swagger

```typescript
// src/api/v1/components/products/interface/product.controller.ts
import { Request, Response } from 'express'
import { ProductEntity } from '../domain/entities/product.entity'
import { CreateProductUseCase } from '../usecases/create-product.usecase'

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Operations with Products
 */
export class ProductController {
    constructor(private readonly repository: any) {}

    /**
     * @swagger
     * /products:
     *   get:
     *     summary: Get list of Products
     *     tags: [Products]
     *     security:
     *       - JWT: [read]
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Filter by name
     *         example: Product1
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *         description: Offset for pagination
     *         example: 0
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *         description: Limit for pagination
     *         example: 10
     *     responses:
     *       200:
     *         description: List of Products
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Product'
     */
    public getProducts = (req: Request, res: Response): void => {
        // TODO: Implement get all logic
        res.json([])
    }

    /**
     * @swagger
     * /products:
     *   post:
     *     summary: Create a new Product
     *     tags: [Products]
     *     security:
     *       - JWT: [write]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Product'
     *           example:
     *             name: "New Product"
     *             description: "Product description"
     *             price: 99.99
     *             categoryId: 1
     *             isActive: true
     *             stockQuantity: 100
     *     responses:
     *       201:
     *         description: Product created successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     */
    public createProduct = (req: Request, res: Response): void => {
        // TODO: Implement create logic
        res.json({} as ProductEntity)
    }
}
```

#### 5. Сгенерированная сущность

```typescript
// src/api/v1/components/products/domain/entities/product.entity.ts
import { AggregateRoot, UniqueEntityID } from '../../../../../core/domain'
import { ProductName } from '../valueobjects/product.name'
import { ProductSearch } from '../valueobjects/product.search'
import { ProductCreatedEvent } from '../events/product.created.events'
import { ProductUpdatedEvent } from '../events/product.updated.events'
import { ProductDeletedEvent } from '../events/product.deleted.events'
import { ID, DbType } from '../../../../../core/domain/decorators'

export interface IProductProps {
    name: ProductName,
    search: string,
    createdBy?: string,
    createdAt?: Date,
    updatedBy?: string,
    updatedAt?: Date,
    description?: string,
    price?: number,
    categoryId?: number,
    isActive?: boolean,
    stockQuantity?: number,
}

export interface IProductCreatedEventProps {
    product: ProductEntity
}

export class ProductEntity extends AggregateRoot<IProductProps> {
    @ID @DbType(DbTypes.Number)
    get id(): UniqueEntityID { return this._id }
    
    @DbType(DbTypes.String)
    get name(): ProductName { return this.props.name }
    
    @DbType(DbTypes.String)
    get search(): ProductSearch { 
        return ProductSearch.create(this.props.name.value, this.props?.createdBy, this.props?.updatedBy)
    }
    
    @DbType(DbTypes.String)
    get createdBy(): string { return this.props?.createdBy || "" }
    
    @DbType(DbTypes.Date)
    get createdAt(): Date { return this.props?.createdAt || new Date() }
    
    @DbType(DbTypes.String)
    get updatedBy(): string { return this.props?.updatedBy || "" }
    
    @DbType(DbTypes.Date)
    get updatedAt(): Date { return this.props?.updatedAt || new Date() }
    
    @DbType(DbTypes.String)
    get description(): string { return this.props.description || "" }
    
    @DbType(DbTypes.Number)
    get price(): number { return this.props.price || 0 }
    
    @DbType(DbTypes.Number)
    get categoryId(): number { return this.props.categoryId || 0 }
    
    @DbType(DbTypes.Boolean)
    get isActive(): boolean { return this.props.isActive || false }
    
    @DbType(DbTypes.Number)
    get stockQuantity(): number { return this.props.stockQuantity || 0 }

    private constructor(props: IProductProps, id?: UniqueEntityID) {
        super(props, id)
    }

    public static create(props: IProductProps, id?: UniqueEntityID): Result<ProductEntity> {
        const guardResult = Guard.againstNullOrUndefinedBulk([
            { argument: props.name, argumentName: 'name' },
        ])

        if (!guardResult.succeeded) {
            return Result.fail<ProductEntity, ValidationError>(
                new ValidationError([{ fields: ["name"], constraint: guardResult.message as string }])
            )
        }
        
        const defaultProductProps = { 
            product: new ProductEntity({ ...props }, id) 
        } as IProductCreatedEventProps

        defaultProductProps.product.addDomainEvent(new ProductCreatedEvent(defaultProductProps))

        return Result.ok<ProductEntity>(defaultProductProps.product)
    }

    public updateName(name: ProductName): Result<void> {
        this.props.name = name
        this.props.updatedAt = new Date()
        this.addDomainEvent(new ProductUpdatedEvent({ product: this }))
        return Result.ok<void>()
    }

    public delete(): Result<void> {
        this.addDomainEvent(new ProductDeletedEvent({ product: this }))
        return Result.ok<void>()
    }
}
```

### Пример 2: Компонент с отношениями

Создадим компонент Category с отношением к Product:

```sql
-- migrations/002_create_categories.sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdby VARCHAR(100),
    updatedby VARCHAR(100)
);
```

```bash
./component-generator.exe generate --singular category --plural categories --migration migrations/002_create_categories.sql
```

## Работа с миграциями БД

### Пример 1: Создание и запуск миграций PostgreSQL

#### 1. Создание новой миграции

```bash
# Создаем миграцию для таблицы users
node_modules/.bin/db-migrate create create_users_table --config ./src/config/database.json --sql-file
```

#### 2. Редактирование файла миграции

```sql
-- migrations/sqls/20231201120000-create_users_table-up.sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrations/sqls/20231201120000-create_users_table-down.sql
DROP TABLE IF EXISTS users;
```

#### 3. Запуск миграции

```bash
# Применяем миграции
node_modules/.bin/db-migrate up --config ./src/config/database.json

# Проверяем статус
node_modules/.bin/db-migrate status --config ./src/config/database.json
```

#### 4. Откат миграции

```bash
# Откатываем последнюю миграцию
node_modules/.bin/db-migrate down --config ./src/config/database.json

# Откатываем конкретную миграцию
node_modules/.bin/db-migrate down 20231201120000-create_users_table --config ./src/config/database.json
```

### Пример 2: Миграции Oracle

#### 1. Создание файла миграции

```sql
-- migrations/001_create_users.sql
CREATE TABLE users (
    id NUMBER GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    username VARCHAR2(50) UNIQUE NOT NULL,
    email VARCHAR2(255) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    first_name VARCHAR2(100),
    last_name VARCHAR2(100),
    is_active NUMBER(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. Запуск миграции

```bash
npm run oraclemigration
```

## Интеграция с Swagger

### Пример 1: Добавление кастомных аннотаций

```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: Product ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Product name
 *           example: "iPhone 15"
 *         description:
 *           type: string
 *           description: Product description
 *           example: "Latest iPhone model"
 *         price:
 *           type: number
 *           format: decimal
 *           description: Product price
 *           example: 999.99
 *         categoryId:
 *           type: integer
 *           description: Category ID
 *           example: 1
 *         isActive:
 *           type: boolean
 *           description: Product availability
 *           example: true
 *         stockQuantity:
 *           type: integer
 *           description: Stock quantity
 *           example: 100
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *           example: "2023-12-01T12:00:00Z"
 */
export class ProductController {
    /**
     * @swagger
     * /products/{id}:
     *   get:
     *     summary: Get product by ID
     *     tags: [Products]
     *     security:
     *       - JWT: [read]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Product ID
     *         example: 1
     *     responses:
     *       200:
     *         description: Product found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       404:
     *         description: Product not found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 error:
     *                   type: string
     *                   example: "Product not found"
     */
    public getProductById = (req: Request, res: Response): void => {
        const { id } = req.params
        // TODO: Implement get by ID logic
        res.json({ id: parseInt(id), name: "Sample Product" })
    }

    /**
     * @swagger
     * /products/{id}:
     *   put:
     *     summary: Update product
     *     tags: [Products]
     *     security:
     *       - JWT: [write]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Product ID
     *         example: 1
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *                 example: "Updated Product"
     *               description:
     *                 type: string
     *                 example: "Updated description"
     *               price:
     *                 type: number
     *                 example: 1299.99
     *     responses:
     *       200:
     *         description: Product updated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Product'
     *       404:
     *         description: Product not found
     */
    public updateProduct = (req: Request, res: Response): void => {
        const { id } = req.params
        const updateData = req.body
        // TODO: Implement update logic
        res.json({ id: parseInt(id), ...updateData })
    }

    /**
     * @swagger
     * /products/{id}:
     *   delete:
     *     summary: Delete product
     *     tags: [Products]
     *     security:
     *       - JWT: [delete]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: integer
     *         description: Product ID
     *         example: 1
     *     responses:
     *       204:
     *         description: Product deleted successfully
     *       404:
     *         description: Product not found
     */
    public deleteProduct = (req: Request, res: Response): void => {
        const { id } = req.params
        // TODO: Implement delete logic
        res.status(204).send()
    }
}
```

### Пример 2: Аутентификация и авторизация

```typescript
/**
 * @swagger
 * components:
 *   securitySchemes:
 *     JWT:
 *       type: apiKey
 *       in: header
 *       name: Authorization
 *       description: "JWT token format: Bearer {token}"
 *   
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           example: "admin"
 *         password:
 *           type: string
 *           example: "password123"
 *     
 *     LoginResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresIn:
 *           type: integer
 *           example: 3600
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             username:
 *               type: string
 *               example: "admin"
 */
export class AuthController {
    /**
     * @swagger
     * /auth/login:
     *   post:
     *     summary: User login
     *     tags: [Authentication]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/LoginResponse'
     *       401:
     *         description: Invalid credentials
     */
    public login = (req: Request, res: Response): void => {
        // TODO: Implement login logic
        res.json({
            token: "sample-jwt-token",
            expiresIn: 3600,
            user: { id: 1, username: "admin" }
        })
    }
}
```

## Тестирование компонентов

### Пример 1: Unit тест для сущности

```typescript
// tests/unit/entities/product.entity.test.ts
import { ProductEntity } from '../../../../src/api/v1/components/products/domain/entities/product.entity'
import { ProductName } from '../../../../src/api/v1/components/products/domain/valueobjects/product.name'

describe('ProductEntity', () => {
    describe('create', () => {
        it('should create a valid product', () => {
            // Arrange
            const productName = ProductName.create('Test Product')
            const props = {
                name: productName.getValue(),
                search: 'Test Product admin',
                createdBy: 'admin'
            }

            // Act
            const result = ProductEntity.create(props)

            // Assert
            expect(result.succeeded).toBe(true)
            expect(result.getValue().name.value).toBe('Test Product')
            expect(result.getValue().createdBy).toBe('admin')
        })

        it('should fail to create product without name', () => {
            // Arrange
            const props = {
                name: '',
                search: '',
                createdBy: 'admin'
            }

            // Act
            const result = ProductEntity.create(props)

            // Assert
            expect(result.succeeded).toBe(false)
            expect(result.error).toBeInstanceOf(ValidationError)
        })
    })

    describe('updateName', () => {
        it('should update product name', () => {
            // Arrange
            const productName = ProductName.create('Original Name')
            const props = { name: productName.getValue(), search: 'Original Name admin' }
            const product = ProductEntity.create(props).getValue()
            
            const newName = ProductName.create('Updated Name')

            // Act
            const result = product.updateName(newName.getValue())

            // Assert
            expect(result.succeeded).toBe(true)
            expect(product.name.value).toBe('Updated Name')
        })
    })
})
```

### Пример 2: Integration тест для контроллера

```typescript
// tests/integration/products.controller.test.ts
import request from 'supertest'
import { app } from '../../../../src/server'
import { ProductEntity } from '../../../../src/api/v1/components/products/domain/entities/product.entity'

describe('ProductController', () => {
    describe('GET /products', () => {
        it('should return list of products', async () => {
            // Act
            const response = await request(app)
                .get('/api/v1/products')
                .set('Authorization', 'Bearer valid-jwt-token')

            // Assert
            expect(response.status).toBe(200)
            expect(Array.isArray(response.body)).toBe(true)
        })

        it('should require authentication', async () => {
            // Act
            const response = await request(app)
                .get('/api/v1/products')

            // Assert
            expect(response.status).toBe(401)
        })
    })

    describe('POST /products', () => {
        it('should create new product', async () => {
            // Arrange
            const productData = {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                categoryId: 1,
                isActive: true,
                stockQuantity: 100
            }

            // Act
            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', 'Bearer valid-jwt-token')
                .send(productData)

            // Assert
            expect(response.status).toBe(201)
            expect(response.body.name).toBe(productData.name)
            expect(response.body.price).toBe(productData.price)
        })

        it('should validate required fields', async () => {
            // Arrange
            const invalidData = {
                description: 'Missing name and price'
            }

            // Act
            const response = await request(app)
                .post('/api/v1/products')
                .set('Authorization', 'Bearer valid-jwt-token')
                .send(invalidData)

            // Assert
            expect(response.status).toBe(400)
        })
    })
})
```

## Работа с доменными событиями

### Пример 1: Создание и обработка событий

```typescript
// src/api/v1/components/products/domain/events/product.created.events.ts
import { IDomainEvent } from '../../../../../core/domain/events/IDomainEvent'
import { ProductEntity } from '../entities/product.entity'

export interface IProductCreatedEventProps {
    product: ProductEntity
}

export class ProductCreatedEvent implements IDomainEvent {
    public dateTimeOccurred: Date
    public product: ProductEntity

    constructor(props: IProductCreatedEventProps) {
        this.dateTimeOccurred = new Date()
        this.product = props.product
    }
}
```

### Пример 2: Подписчик на события

```typescript
// src/api/v1/components/notification/subscribers/product.subscriber.ts
import { IDomainEvent } from '../../../../core/domain/events/IDomainEvent'
import { ProductCreatedEvent } from '../../products/domain/events/product.created.events'
import { ProductUpdatedEvent } from '../../products/domain/events/product.updated.events'

export class ProductSubscriber {
    public static handle(event: IDomainEvent): void {
        if (event instanceof ProductCreatedEvent) {
            console.log(`Product created: ${event.product.name.value}`)
            // Отправка уведомления в Kafka
            this.sendNotification('product.created', {
                productId: event.product.id.toString(),
                productName: event.product.name.value,
                timestamp: event.dateTimeOccurred
            })
        }

        if (event instanceof ProductUpdatedEvent) {
            console.log(`Product updated: ${event.product.name.value}`)
            // Отправка уведомления в Kafka
            this.sendNotification('product.updated', {
                productId: event.product.id.toString(),
                productName: event.product.name.value,
                timestamp: event.dateTimeOccurred
            })
        }
    }

    private static sendNotification(type: string, data: any): void {
        // Логика отправки в Kafka
        console.log(`Sending ${type} notification:`, data)
    }
}
```

### Пример 3: Обработчик событий в UseCase

```typescript
// src/api/v1/components/products/usecases/create-product.usecase.ts
import { ProductEntity } from '../domain/entities/product.entity'
import { IProductRepository } from '../domain/repositories/i.product.repository'
import { ProductSubscriber } from '../../notification/subscribers/product.subscriber'

export class CreateProductUseCase {
    constructor(private readonly productRepository: IProductRepository) {}

    public async execute(request: ICreateProductRequest): Promise<Result<ProductEntity>> {
        // Создание продукта
        const productResult = ProductEntity.create({
            name: ProductName.create(request.name),
            search: `${request.name} ${request.createdBy}`,
            description: request.description,
            price: request.price,
            categoryId: request.categoryId,
            isActive: request.isActive,
            stockQuantity: request.stockQuantity,
            createdBy: request.createdBy
        })

        if (!productResult.succeeded) {
            return Result.fail<ProductEntity>(productResult.error)
        }

        const product = productResult.getValue()

        // Сохранение в БД
        const saveResult = await this.productRepository.save(product)
        if (!saveResult.succeeded) {
            return Result.fail<ProductEntity>(saveResult.error)
        }

        // Обработка доменных событий
        product.domainEvents.forEach(event => {
            ProductSubscriber.handle(event)
        })

        return Result.ok<ProductEntity>(product)
    }
}
```

## Развертывание в Docker

### Пример 1: Dockerfile для приложения

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Копирование package файлов
COPY package*.json ./
COPY tsconfig.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY src/ ./src/

# Сборка приложения
RUN npm run build

# Продукционный образ
FROM node:18-alpine AS production

WORKDIR /app

# Создание пользователя
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Копирование собранного приложения
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./package.json

# Переключение на пользователя
USER nodejs

# Открытие порта
EXPOSE 1234

# Запуск приложения
CMD ["node", "dist/server.js"]
```

### Пример 2: Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "1234:1234"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=test
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - KAFKA_BROKERS=kafka:9092
    depends_on:
      - postgres
      - kafka
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=test
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  kafka:
    image: confluentinc/cp-kafka:latest
    environment:
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    ports:
      - "9092:9092"
    depends_on:
      - zookeeper
    networks:
      - app-network

  zookeeper:
    image: confluentinc/cp-zookeeper:latest
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### Пример 3: Скрипты развертывания

```bash
#!/bin/bash
# scripts/deploy.sh

set -e

echo "🚀 Starting deployment..."

# Сборка Docker образов
echo "📦 Building Docker images..."
docker-compose build

# Запуск миграций
echo "🗄️ Running database migrations..."
docker-compose run --rm app npm run migrate

# Запуск приложения
echo "🏃 Starting application..."
docker-compose up -d

# Проверка здоровья
echo "🏥 Checking application health..."
sleep 10
curl -f http://localhost:1234/health || exit 1

echo "✅ Deployment completed successfully!"
echo "📖 Swagger UI available at: http://localhost:1234/api-docs"
```

### Пример 4: Kubernetes манифест

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rest-api-app
  labels:
    app: rest-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: rest-api
  template:
    metadata:
      labels:
        app: rest-api
    spec:
      containers:
      - name: rest-api
        image: rest-nodejs-cleanarch-template:latest
        ports:
        - containerPort: 1234
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_HOST
          value: "postgres-service"
        - name: KAFKA_BROKERS
          value: "kafka-service:9092"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 1234
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 1234
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: rest-api-service
spec:
  selector:
    app: rest-api
  ports:
  - protocol: TCP
    port: 80
    targetPort: 1234
  type: LoadBalancer
```

## Полный пример рабочего процесса

### 1. Инициализация проекта

```bash
# Клонирование репозитория
git clone https://github.com/KravetsMikhail/rest-nodejs-cleanarch-template.git
cd rest-nodejs-cleanarch-template

# Установка зависимостей
npm install

# Настройка окружения
cp .env.example .env
# Редактирование .env с настройками БД и Kafka

# Сборка генератора компонентов
cd src/utils/component-generator
go build -o component-generator.exe
```

### 2. Создание нового компонента

```bash
# Создание SQL миграции
cat > migrations/001_create_orders.sql << EOF
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdby VARCHAR(100),
    updatedby VARCHAR(100)
);
EOF

# Генерация компонента
./component-generator.exe generate --singular order --plural orders --migration migrations/001_create_orders.sql

# Запуск миграций
cd ../../..
node_modules/.bin/db-migrate up --config ./src/config/database.json
```

### 3. Реализация бизнес-логики

```typescript
// src/api/v1/components/orders/usecases/create-order.usecase.ts
export class CreateOrderUseCase {
    constructor(
        private readonly orderRepository: IOrderRepository,
        private readonly productRepository: IProductRepository
    ) {}

    public async execute(request: ICreateOrderRequest): Promise<Result<OrderEntity>> {
        // Валидация и создание заказа
        const orderResult = OrderEntity.create({
            orderNumber: this.generateOrderNumber(),
            customerId: request.customerId,
            totalAmount: request.totalAmount,
            status: 'pending',
            createdBy: request.createdBy
        })

        if (!orderResult.succeeded) {
            return Result.fail<OrderEntity>(orderResult.error)
        }

        const order = orderResult.getValue()

        // Сохранение заказа
        const saveResult = await this.orderRepository.save(order)
        if (!saveResult.succeeded) {
            return Result.fail<OrderEntity>(saveResult.error)
        }

        // Обработка событий
        order.domainEvents.forEach(event => {
            OrderSubscriber.handle(event)
        })

        return Result.ok<OrderEntity>(order)
    }

    private generateOrderNumber(): string {
        return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
}
```

### 4. Тестирование

```bash
# Запуск unit тестов
npm run test

# Запуск integration тестов
npm run test:integration

# Запуск тестов с покрытием
npm run test:coverage
```

### 5. Запуск в продакшен

```bash
# Сборка приложения
npm run build

# Запуск с Docker
docker-compose up -d

# Проверка здоровья
curl http://localhost:1234/health

# Просмотр документации
open http://localhost:1234/api-docs
```

Этот пример демонстрирует полный цикл разработки компонента от создания до развертывания в продакшен среде с использованием всех возможностей проекта.
