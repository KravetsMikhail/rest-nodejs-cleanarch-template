import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import path from 'path';

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
      {
        url: 'https://roualty.rasu.local/api/v1',
        description: 'Production server',
      },
    ],
    components: {
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
    './src/api/v1/interface/**/*.ts', // Path to the API docs
    './src/api/v1/openapi/openapi.yaml', // Path to OpenAPI specification
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
  customSiteTitle: 'Royalty API Documentation',
};

export const setupSwagger = (app: Express): void => {
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
