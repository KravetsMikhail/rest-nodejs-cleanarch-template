# Component Generator

Консольное приложение на Go для генерации новых API компонентов по шаблону Clean Architecture.

## Описание

Этот инструмент автоматически создает структуру папок и файлов для нового API компонента в проекте, следуя паттерну Clean Architecture. Генератор создает все необходимые файлы включая сущности, value objects, события, репозитории, контроллеры и use cases.

**Основные возможности:**
- Автоматическая генерация полной структуры компонента (entities, value objects, events, repositories, controllers, use cases)
- Поддержка генерации полей из SQL миграций
- Автоматическая генерация OpenAPI документации
- Следование паттерну Clean Architecture
- Автоматическое создание декораторов `@DbType` для ORM

## Установка

1. Перейдите в папку генератора:
```bash
cd src/utils/component-generator
```

2. Соберите приложение:
```bash
go build -o component-generator.exe
```

## Использование

### Базовая команда

```bash
./component-generator.exe generate --singular [имя_в_единственном_числе] --plural [имя_во_множественном_числе] --version [версия_api] --migration [путь_к_файлу_миграции]
```

### Параметры

- `--singular` (обязательно) - Имя компонента в единственном числе (например: `product`)
- `--plural` (обязательно) - Имя компонента во множественном числе (например: `products`)
- `--version` (опционально) - Версия API (по умолчанию: `v1`)
- `--migration` (опционально) - Путь к SQL файлу миграции для генерации полей

### Примеры использования

```bash
# Создание компонента "products" для API v1
./component-generator.exe generate --singular product --plural products --version v1

# Создание компонента "products" с генерацией полей из миграции
./component-generator.exe generate --singular product --plural products --migration migrations/001_create_products.sql

# Создание компонента "categories" для API v2 с миграцией
./component-generator.exe generate --singular category --plural categories --version v2 --migration migrations/002_create_categories.sql

# Создание компонента "users" с версией по умолчанию (v1)
./component-generator.exe generate --singular user --plural users
```

### Генерация полей из SQL миграции

При указании параметра `--migration` генератор анализирует SQL файл миграции и автоматически создает поля в entity на основе определения таблицы.

**Поддерживаемые типы SQL:**
- `INTEGER`, `INT`, `SERIAL` → `number`
- `VARCHAR`, `TEXT`, `CHAR` → `string`
- `BOOLEAN`, `BOOL` → `boolean`
- `DATE`, `TIMESTAMP` → `Date`
- `DECIMAL`, `NUMERIC`, `FLOAT`, `DOUBLE` → `number`

**Пример SQL файла миграции:**
```sql
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

**Сгенерированные поля в entity:**
```typescript
export interface IProductProps {
    name: ProductName,
    search: string,
    createdBy?: string,
    createdAt?: Date,
    updatedBy?: string,
    updatedAt?: Date,
    description?: string,
    price: number,
    category_id?: number,
    is_active?: boolean,
    stock_quantity?: number,
}
```

**Сгенерированные getters:**
```typescript
export class ProductEntity extends AggregateRoot<IProductProps> {
    // ... стандартные поля
    
    @DbType(DbTypes.String)
    get Description(): string { return this.props.description }
    
    @DbType(DbTypes.Number)
    get Price(): number { return this.props.price }
    
    @DbType(DbTypes.Number)
    get Category_id(): number { return this.props.category_id }
    
    @DbType(DbTypes.Boolean)
    get Is_active(): boolean { return this.props.is_active }
    
    @DbType(DbTypes.Number)
    get Stock_quantity(): number { return this.props.stock_quantity }
}
```

## Генерируемая структура

Генератор создает следующую структуру папок и файлов:

```
src/api/{version}/components/{plural}/
├── domain/
│   ├── entities/
│   │   ├── {singular}.entity.ts
│   │   └── {singular}id.entity.ts
│   ├── valueobjects/
│   │   ├── {singular}.name.ts
│   │   └── {singular}.search.ts
│   ├── events/
│   │   ├── {singular}.created.events.ts
│   │   ├── {singular}.updated.events.ts
│   │   └── {singular}.deleted.events.ts
│   ├── repositories/
│   │   └── i.{singular}.repository.ts
│   ├── datasources/
│   │   └── i.{singular}.datasource.ts
│   └── types/
│       └── response.ts
├── infrastructure/
│   └── postgresql.datasource.ts
├── interface/
│   ├── {singular}.controller.ts
│   └── {singular}.routes.ts
└── usecases/
    ├── create-{singular}.usecase.ts
    └── get-{singular}.usecase.ts
```

## Создаваемые файлы

### Domain Layer

- **Entities** - Основные сущности с бизнес-логикой
- **Value Objects** - Объекты-значения для валидации данных
- **Events** - Доменные события для системы событий
- **Repositories** - Интерфейсы репозиториев
- **DataSources** - Интерфейсы источников данных
- **Types** - Типы ответов и общие типы

### Infrastructure Layer

- **PostgreSQL DataSource** - Реализация источника данных для PostgreSQL

### Interface Layer

- **Controller** - REST контроллер с базовыми методами
- **Routes** - Маршруты Express для API эндпоинтов

### Use Cases Layer

- **Create Use Case** - Use case для создания сущности
- **Get Use Case** - Use case для получения сущностей

## Требования

- Go 1.21 или выше
- Windows (для .exe файла)

## Разработка

### Структура проекта генератора

```
component-generator/
├── main.go                    # Основной файл приложения
├── go.mod                     # Модуль Go
├── go.sum                     # Зависимости
├── generators.go              # Генераторы сущностей и value objects
├── generators_events.go       # Генераторы событий
├── generators_repository.go   # Генераторы репозиториев
├── generators_infrastructure.go # Генераторы инфраструктуры
├── generators_interface.go    # Генераторы контроллеров и маршрутов
├── generators_usecase.go      # Генераторы use cases
└── README.md                  # Этот файл
```

### Добавление новых шаблонов

Для добавления новых шаблонов или модификации существующих:

1. Откройте соответствующий файл `generators_*.go`
2. Измените шаблоны в функциях `generate*`
3. Пересоберите приложение:
```bash
go build -o component-generator.exe
```

## Пример использования

После генерации компонента "products":

```bash
./component-generator.exe generate --singular product --plural products --version v1
```

Будет создана полная структура для работы с продуктами, включая:
- `ProductEntity` с методами создания и обновления
- `ProductName` и `ProductSearch` value objects
- `ProductController` с методами `getProduct` и `createProduct`
- `ProductRoutes` с маршрутами `/` и `/`
- И другие необходимые файлы

## Заметки

- Все сгенерированные файлы содержат TODO комментарии для реализации бизнес-логики
- Шаблоны созданы для следования паттерну Clean Architecture
- Имена файлов и классов автоматически адаптируются под переданные параметры
- Поддерживаются любые версии API (v1, v2, v3, и т.д.)

## Лицензия

Этот инструмент является частью проекта и следует тем же лицензионным условиям.
