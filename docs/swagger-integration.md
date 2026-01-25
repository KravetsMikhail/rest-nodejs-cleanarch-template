# Swagger JSDoc Integration

## Overview

This project uses `swagger-jsdoc` for automatic API documentation generation from JSDoc comments in TypeScript files.

## Installation

The following packages are installed:

- `swagger-jsdoc` - Generates OpenAPI specification from JSDoc comments
- `@types/swagger-jsdoc` - TypeScript definitions
- `swagger-ui-express` - Swagger UI middleware
- `@types/swagger-ui-express` - TypeScript definitions

## Configuration

### Swagger Configuration (`src/config/swagger.ts`)

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'REST API for Royalty',
      version: 'v1',
      description: 'API documentation for Royalty management system',
    },
    servers: [
      {
        url: 'http://localhost:1234/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        JWT: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: [
    './src/api/v1/interface/**/*.ts', // Path to API controllers
    './src/api/v1/openapi/openapi.yaml', // OpenAPI specification
  ],
};
```

### Server Integration (`src/server.ts`)

```typescript
import { setupSwagger } from './config/swagger';

// In Server class
private setupSwagger(): void {
    setupSwagger(this.app);
}
```

## Usage

### 1. Controller Annotations

Add JSDoc comments to controller methods:

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
     *     parameters:
     *       - in: query
     *         name: name
     *         schema:
     *           type: string
     *         description: Filter by name
     *         example: задача1
     *     responses:
     *       200:
     *         description: List of tasks
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Task'
     */
    public getTasks = (req: Request, res: Response): void => {
        // Implementation
    }
}
```

### 2. Schema Definitions

Define schemas in OpenAPI YAML file:

```yaml
components:
  schemas:
    Task:
      type: object
      properties:
        id:
          type: integer
          description: Уникальный идентификатор
          example: 1
        name:
          type: string
          description: Наименование
          example: "Пример задачи"
      required:
        - name
```

### 3. Component Generator Integration

The component generator automatically adds Swagger annotations to generated controllers:

```bash
./component-generator.exe generate --singular product --plural products --migration migration.sql
```

Generated controller includes:
- Class-level tag documentation
- Method-level endpoint documentation
- Parameter documentation
- Response documentation
- Security requirements

## Access Points

### Swagger UI
- **URL**: `http://localhost:1234/api-docs`
- **Features**: Interactive API documentation, testing interface

### JSON Specification
- **URL**: `http://localhost:1234/api-docs.json`
- **Format**: OpenAPI 3.0.1 JSON specification

### Legacy Redirect
- **URL**: `http://localhost:1234/api-docs/v1`
- **Redirects to**: `/api-docs`

## Annotation Examples

### GET Endpoint

```typescript
/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get list of products
 *     tags: [products]
 *     security:
 *       - JWT: [read]
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter by name
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Pagination offset
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Pagination limit
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
```

### POST Endpoint

```typescript
/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [products]
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
 *             price: 99.99
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
```

### PUT Endpoint

```typescript
/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [products]
 *     security:
 *       - JWT: [write]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Product updated successfully
 */
```

### DELETE Endpoint

```typescript
/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [products]
 *     security:
 *       - JWT: [delete]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */
```

## Best Practices

1. **Consistent Tagging**: Use the same tag name for all endpoints in a controller
2. **Security**: Include JWT security requirements for protected endpoints
3. **Examples**: Provide meaningful examples for parameters and responses
4. **Schema References**: Use `$ref` to reference reusable schemas
5. **Error Responses**: Document common error responses (400, 401, 404, 500)
6. **Pagination**: Include offset/limit parameters for list endpoints

## Component Generator Features

The enhanced component generator automatically includes:

- ✅ Swagger tag documentation
- ✅ Endpoint documentation for all CRUD operations
- ✅ Parameter documentation (query, path, body)
- ✅ Response documentation with schema references
- ✅ Security requirements (JWT authentication)
- ✅ Example values for better documentation

## Troubleshooting

### Common Issues

1. **Missing Documentation**: Ensure JSDoc comments follow the exact format
2. **Schema Not Found**: Verify schema definitions in OpenAPI YAML file
3. **Security Not Working**: Check JWT configuration and middleware order
4. **UI Not Loading**: Verify swagger-ui-express middleware setup

### Debug Tips

- Check browser console for JavaScript errors
- Verify JSON specification at `/api-docs.json`
- Ensure file paths in swagger configuration are correct
- Check TypeScript compilation for syntax errors

## Migration from YAML

The project supports both:
1. **YAML-based documentation** (existing `openapi.yaml`)
2. **JSDoc-based documentation** (new `swagger-jsdoc`)

The configuration combines both sources:
- YAML provides schema definitions
- JSDoc provides endpoint documentation

This allows gradual migration from pure YAML to mixed approach.
