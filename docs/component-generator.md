# Component Generator

## Overview

The Component Generator is a Go CLI tool that automatically generates complete API components following clean architecture principles. It creates all necessary files for a new entity including domain entities, repositories, controllers, use cases, and infrastructure code.

## Features

- ✅ **Clean Architecture Structure** - Follows established patterns
- ✅ **TypeScript Support** - Fully typed generated code
- ✅ **SQL Migration Integration** - Extracts fields from migration files
- ✅ **Swagger Documentation** - Automatic JSDoc annotations
- ✅ **OpenAPI Generation** - Integrated with swagger-jsdoc
- ✅ **Database Support** - PostgreSQL and Oracle
- ✅ **Event-Driven Architecture** - Domain events generation

## Installation

### Build from Source

```bash
cd src/utils/component-generator
go build -o component-generator.exe
```

### Requirements

- Go 1.19 or higher
- Node.js project structure
- SQL migration files (optional)

## Usage

### Basic Generation

```bash
./component-generator.exe generate --singular product --plural products
```

### With SQL Migration

```bash
./component-generator.exe generate --singular product --plural products --migration ../../../migrations/migration.sql
```

### Command Options

| Option | Required | Description | Example |
|--------|----------|-------------|---------|
| `--singular` | Yes | Singular name of the entity | `product` |
| `--plural` | Yes | Plural name of the entity | `products` |
| `--version` | No | API version (default: v1) | `v1` |
| `--migration` | No | Path to SQL migration file | `../../../migrations/migration.sql` |

## Generated Structure

```
src/api/v1/components/{plural}/
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

## SQL Migration Integration

### Supported SQL Types

The generator parses SQL migration files and automatically creates entity fields:

| SQL Type | TypeScript Type | DbType |
|----------|----------------|--------|
| `INT`, `SERIAL` | `number` | `DbTypes.Number` |
| `VARCHAR`, `TEXT`, `CHAR` | `string` | `DbTypes.String` |
| `BOOLEAN`, `BOOL` | `boolean` | `DbTypes.Boolean` |
| `DATE`, `TIMESTAMP` | `Date` | `DbTypes.Date` |
| `DECIMAL`, `NUMERIC`, `FLOAT`, `DOUBLE` | `number` | `DbTypes.Number` |

### Migration File Example

```sql
-- Create products table
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

### Generated Entity Fields

From the migration above, the generator creates:

```typescript
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

export class ProductEntity extends AggregateRoot<IProductProps> {
    @ID @DbType(DbTypes.Number)
    get id(): UniqueEntityId { return this._id }
    
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
}
```

## Swagger Documentation Integration

### Automatic JSDoc Annotations

The generator automatically adds Swagger JSDoc annotations to controllers:

```typescript
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Operations with Products
 */
export class ProductController {
    /**
     * @swagger
     * /Products:
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
     * /Products:
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

### Swagger Integration

- **Automatic Processing**: swagger-jsdoc automatically generates OpenAPI from JSDoc comments
- **UI Access**: Available at `http://localhost:1234/api-docs`
- **JSON Spec**: Available at `http://localhost:1234/api-docs.json`
- **Schema Management**: Managed in `src/api/v1/openapi/openapi.yaml`

## Generated Components

### Domain Layer

#### Entities
- **Main Entity**: Core business logic with validation
- **ID Entity**: Unique identifier wrapper
- **Decorators**: `@ID`, `@DbType` for database mapping

#### Value Objects
- **Name Object**: Business rules for naming
- **Search Object**: Search functionality

#### Events
- **Created Event**: Domain events for creation
- **Updated Event**: Domain events for updates
- **Deleted Event**: Domain events for deletion

#### Repositories
- **Interface**: Abstract repository contract
- **Methods**: CRUD operations with proper typing

### Application Layer

#### Use Cases
- **Create Use Case**: Business logic for creation
- **Get Use Case**: Retrieval logic
- **Error Handling**: Result pattern implementation

### Infrastructure Layer

#### Data Sources
- **PostgreSQL**: Database implementation
- **Oracle**: Database implementation
- **Connection Management**: Proper connection handling

### Interface Layer

#### Controllers
- **Express Integration**: Request/response handling
- **Swagger Documentation**: JSDoc annotations
- **Validation**: Input validation

#### Routes
- **Route Definitions**: Express router setup
- **Middleware**: Authentication and validation

## Best Practices

### Naming Conventions

- **Singular**: Use lowercase, singular form (`product`)
- **Plural**: Use lowercase, plural form (`products`)
- **Migration**: Use descriptive names (`001_create_products.sql`)

### SQL Migration Guidelines

1. **Primary Keys**: Use `SERIAL` or `INTEGER PRIMARY KEY`
2. **Timestamps**: Include `created_at`, `updated_at`
3. **Audit Fields**: Add `createdby`, `updatedby`
4. **Default Values**: Provide sensible defaults
5. **Data Types**: Use appropriate SQL types

### Integration Steps

1. **Create Migration**: Write SQL migration file
2. **Generate Component**: Run component generator
3. **Implement Logic**: Fill in TODO sections
4. **Add Routes**: Register routes in main router
5. **Test API**: Verify Swagger documentation

## Examples

### Complete Workflow

```bash
# 1. Create SQL migration
cat > migration.sql << EOF
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
EOF

# 2. Generate component
./component-generator.exe generate --singular category --plural categories --migration ../../../migrations/migration.sql

# 3. Build project
npm run build

# 4. Start server
npm start

# 5. View documentation
# Open http://localhost:1234/api-docs
```

### Generated Code Samples

#### Entity Example

```typescript
export class CategoryEntity extends AggregateRoot<ICategoryProps> {
    @ID @DbType(DbTypes.Number)
    get id(): UniqueEntityId { return this._id }
    
    @DbType(DbTypes.String)
    get name(): CategoryName { return this.props.name }
    
    @DbType(DbTypes.String)
    get description(): string { return this.props.description || "" }
    
    @DbType(DbTypes.Boolean)
    get isActive(): boolean { return this.props.isActive || false }
    
    public static create(props: ICategoryProps, id?: UniqueEntityId): Result<CategoryEntity> {
        const guardResult = Guard.againstNullOrUndefinedBulk([
            { argument: props.name, argumentName: 'name' },
        ])

        if (!guardResult.succeeded) {
            return Result.fail<CategoryEntity, ValidationError>(
                new ValidationError([{ fields: ["name"], constraint: guardResult.message as string }])
            )
        }
        
        const defaultCategoryProps = { 
            category: new CategoryEntity({ ...props }, id) 
        } as ICategoryCreatedEventProps

        defaultCategoryProps.category.addDomainEvent(new CategoryCreatedEvent(defaultCategoryProps))

        return Result.ok<CategoryEntity>(defaultCategoryProps.category)
    }
}
```

#### Controller Example

```typescript
export class CategoryController {
    constructor(private readonly repository: any) {}

    /**
     * @swagger
     * /categories:
     *   get:
     *     summary: Get list of categories
     *     tags: [categories]
     *     security:
     *       - JWT: [read]
     *     responses:
     *       200:
     *         description: List of categories
     */
    public getCategories = (_req: Request, res: Response<CategoryEntity[]>): void => {
        // TODO: Implement get all logic
        res.json([])
    }

    /**
     * @swagger
     * /categories:
     *   post:
     *     summary: Create a new category
     *     tags: [categories]
     *     security:
     *       - JWT: [write]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/Category'
     *     responses:
     *       201:
     *         description: Category created successfully
     */
    public createCategory = (_req: Request, res: Response<CategoryEntity>): void => {
        // TODO: Implement create logic
        res.json({} as CategoryEntity)
    }
}
```

## Troubleshooting

### Common Issues

1. **Build Errors**: Ensure Go is properly installed
2. **Migration Parsing**: Check SQL syntax and table structure
3. **Type Errors**: Verify TypeScript compilation
4. **Swagger Issues**: Check JSDoc annotation format

### Debug Tips

- Use `--help` for command options
- Check generated file structure
- Verify SQL migration format
- Test Swagger documentation access

### Performance

- Generator runs in milliseconds
- No impact on runtime performance
- Generated code follows project patterns

## Migration from Manual Development

### Before Component Generator

```typescript
// Manual creation of multiple files
// - entity.ts
// - controller.ts
// - repository.ts
// - usecase.ts
// - routes.ts
// - events.ts
// - valueobjects.ts
```

### After Component Generator

```bash
# Single command generates everything
./component-generator.exe generate --singular product --plural products --migration ../../../migrations/migration.sql
```

### Benefits

- **Time Savings**: 90% reduction in boilerplate code
- **Consistency**: Standardized patterns across project
- **Quality**: Built-in validation and error handling
- **Documentation**: Automatic Swagger annotations
- **Maintainability**: Clean architecture principles

## Integration with Existing Project

### Adding to Router

```typescript
// In main router file
import { ProductRoutes } from './components/products/interface/product.routes'
import { ProductRepository } from './components/products/infrastructure/postgresql.datasource'

const productRepository = new ProductRepository()
const productRoutes = new ProductRoutes(productRepository)

router.use('/products', productRoutes.router)
```

### Database Integration

```typescript
// In repository implementation
export class ProductRepository implements IProductRepository {
    async create(product: ProductEntity): Promise<Result<ProductEntity>> {
        const query = 'INSERT INTO products (name, description, price) VALUES ($1, $2, $3) RETURNING *'
        // Implementation
    }
}
```

## Future Enhancements

### Planned Features

- [ ] **Relationship Support** - Foreign key relationships
- [ ] **Validation Rules** - Custom validation generation
- [ ] **Test Generation** - Unit test templates
- [ ] **GraphQL Support** - GraphQL schema generation
- [ ] **Microservice Support** - Service boundaries

### Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## Support

For issues and questions:

1. Check this documentation
2. Review generated code examples
3. Verify migration file format
4. Test with simple examples first

---

**Note**: This tool is designed to accelerate development while maintaining code quality and architectural consistency. Always review generated code and customize according to specific business requirements.
