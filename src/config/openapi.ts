import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { TaskOpenapiScheme, TaskListResponseScheme, PaginationScheme } from '../api/v1/components/tasks/domain/entities/task.openapi';
import { EnvConfig } from './env';

/**
 * Glob without ** so swagger-jsdoc's bundled glob (v7) doesn't hit the Symbol bug with minimatch 10.
 * Pattern: components/<one-level>/interface/<files>.js (e.g. tasks/interface/task.controller.js).
 */
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
        url: `${EnvConfig.protocol}://${EnvConfig.host}:${EnvConfig.port}${EnvConfig.apiPrefix}/v1`,
        description: `${EnvConfig.nodeEnv === 'production' ? 'Production' : 'Development'} server`,
      },
      {
        url: 'http://localhost:1234/api/v1',
        description: 'Local development server',
      },
    ],
    components: {
      schemas: {
        Task: TaskOpenapiScheme,
        Pagination: PaginationScheme,
        TaskListResponse: TaskListResponseScheme,
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
      responses:{ 
        Unauthorized: {
        description: 'Ошибка авторизации',
        content: {
          'application/json': {
            schema: {
              properties: {
                Error: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string'
                    },
                    message: {
                      type: 'string'
                    }
                  },
                  required: ['code', 'message']
                }
              }
            }
          }
        }
      },
      Error400: {
        description: 'Ошибка',
        content: {
          'application/json': {
            schema: {
              properties: {
                Error: {
                  type: 'object',
                  properties: {
                    code: {
                      type: 'string'
                    },
                    message: {
                      type: 'string'
                    },
                    stack: {
                      type: 'string'
                    }
                  },
                  required: ['code', 'message']
                }
              }
            }
          }
        }
      }
    }
    },
    security: [
      {
        JWT: [],
      },
    ],
  },
  apis: [path.join(process.cwd(), 'dist', 'api', 'v1', 'components', '*', 'interface', '*.js').split(path.sep).join('/')],
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
  console.log(`   - UI: ${EnvConfig.protocol}://${EnvConfig.host}:${EnvConfig.port}/api-docs`);
  console.log(`   - JSON: ${EnvConfig.protocol}://${EnvConfig.host}:${EnvConfig.port}/api-docs.json`);
};
