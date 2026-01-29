import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { TaskOpenapiScheme } from '../api/v1/components/tasks/domain/entities/task.openapi';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.1',
    info: {
      title: 'REST API for template',
      version: 'v1',
      description: 'API documentation for template',
    },
    servers: [
      {
        url: 'http://localhost:1234/api/v1',
        description: 'Development server',
      },
      {
        url: 'https://localhost:1234/api/v1',
        description: 'Production server',
      },
    ],
    components: {
      schemas: {
        Task: TaskOpenapiScheme,
        Error: {
          type: 'object',
          properties: {
            code: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            required: ['code', 'message'],
          }
        },
      },
      securitySchemes: {
        JWT: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token',
        },
      },
    },
    security: [
      {
        JWT: [],
      },
    ],
  },
  apis: [
    './src/api/v1/components/**/interface/**/*.ts', // Path to the API docs
  ],
};

export const specs = swaggerJsdoc(options);

export const swaggerUiOptions: swaggerUi.SwaggerUiOptions = {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { margin: 20px 0 }
  `,
  customSiteTitle: 'API Documentation',
};

export const setupOpenapi = (app: Express): void => {
  // Swagger UI route
  app.use('/api-docs', swaggerUi.serve);
  app.get('/api-docs', swaggerUi.setup(specs, swaggerUiOptions));

  // Swagger JSON route
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(specs);
  });

  // API docs redirect
  app.get('/api-docs/v1', (req, res) => {
    res.redirect('/api-docs');
  });

  console.log('📚 Swagger documentation available at:');
  console.log('   - UI: http://localhost:1234/api-docs');
  console.log('   - JSON: http://localhost:1234/api-docs.json');
};
