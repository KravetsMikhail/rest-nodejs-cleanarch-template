import express, { type Router, type Request, type Response, type NextFunction } from 'express'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { ONE_HUNDRED, ONE_THOUSAND, SIXTY } from './core/constants/constatnts'
import { HttpCode } from './core/constants/httpcodes'
import { ErrorMiddleware } from './core/middlewares/errors/error.middleware'
import { auth } from './core/middlewares/auth/auth.middleware'
import { AppError } from './core/errors/custom.error'
import { Logger } from './core/logger/logger'
import { PostgresService } from './api/v1/infrastructure/postgresql/postgresql'
import { OracleService } from './api/v1/infrastructure/oracle/oracledb'
import { EnvConfig } from './config/env'
import { setupOpenapi } from './config/openapi'
import serveFavicon = require('serve-favicon')
import path = require('path')
import "./core/subscribers"
import { CircuitBreaker } from './core/utils/circuit-breaker'

interface ServerOptions {
    host: string
    port: number
    routes: Router
    apiPrefix: string
    allowOrig: string | string[]
    //uiHost: string
    //uiPort: number
}

export class Server {
    private readonly app = express()
    private readonly logger = new Logger()
    private readonly port: number
    private readonly routes: Router
    private readonly apiPrefix: string
    private readonly allowOrig: string[]
    //private readonly uiHost: string
    //private readonly uiPort: number
    private readonly host: String
    private readonly postgresService: PostgresService
    private readonly oracleService: OracleService
    private server: any = null
    private isRestarting: boolean = false
    private readonly circuitBreaker: CircuitBreaker

    constructor(options: ServerOptions) {
        //const { host, port, routes, apiPrefix, uiHost, uiPort } = options
        const { host, port, routes, apiPrefix, allowOrig } = options
        this.host = host
        this.port = port
        this.routes = routes
        this.apiPrefix = apiPrefix
        this.allowOrig = allowOrig as string[]
        //this.uiHost = uiHost
        //this.uiPort = uiPort
        this.postgresService = PostgresService.getInstance()
        this.oracleService = OracleService.getInstance()
        this.circuitBreaker = new CircuitBreaker(
            EnvConfig.circuitBreaker.failureThreshold,
            EnvConfig.circuitBreaker.resetTimeout,
            EnvConfig.maxRetries
        )
    }

    private setupBasicMiddleware(): void {
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(compression())
        this.app.use(this.logger.getRequestLogger())
    }

    private setupRateLimiting(): void {
        this.app.use(
            rateLimit({
                max: 50000, // Увеличено до 50000 для экстремальных нагрузок
                windowMs: 15 * 60 * 1000, // 15 минут
                message: 'Too many requests from this IP, please try again in 15 minutes',
                standardHeaders: true, // Включаем RateLimit-* headers
                legacyHeaders: false, // Отключаем X-RateLimit-* headers
                skip: (req) => {
                    // Пропускаем rate limiting для health endpoint
                    return req.path === '/health' || req.path === '/'
                }
            })
        )
    }

    private setupCORS(): void {
        this.app.use((req, res, next) => {
            //const allowedOrigins = [`http://localhost:${this.port}`, `http://${this.host}:${this.port}`, `http://${this.uiHost}:${this.uiPort}`]
            const allowedOrigins = this.allowOrig
            //const allowedOrigins = "*"
            const origin = req.headers.origin            
            if (origin && allowedOrigins.includes(origin)) {
                res.setHeader('Access-Control-Allow-Origin', origin)
            }else if(!allowedOrigins || allowedOrigins.includes("*")){
               
                res.setHeader('Access-Control-Allow-Origin', "*")
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            next()
        })
    }

    private setupStaticFiles(): void {
        this.app.use(serveFavicon(path.join(__dirname, '..', '/public/favicon.ico')))
    }

    private setupRoutes(): void {
        this.app.options("/*", function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.send(200);
        });

        this.app.use(this.apiPrefix, auth, this.routes)

        this.app.get('/health', (_req: Request, res: Response): void => {
            res.status(HttpCode.OK).json({ status: true, message: 'Health OK!' })
        })

        this.app.get('/', (_req: Request, res: Response): void => {
            res.status(HttpCode.OK).send({
                message: `Welcome to Initial API! Endpoints available at http://${this.host}:${this.port}/`
            })
        })
    }

    private setupOpenapi(): void {
        setupOpenapi(this.app)
    }

    private setupErrorHandling(): void {
        this.routes.all('*', (req: Request, _: Response, next: NextFunction): void => {
            next(AppError.notFound(`Can't find ${req.originalUrl} on this server!`))
        })

        ErrorMiddleware.initialize(this.logger)
        this.routes.use(ErrorMiddleware.handleError)
        this.app.use(this.logger.getRequestErrorLogger())
    }

    private async checkDatabaseConnections(retryCount: number = 0): Promise<void> {
        const errors: string[] = []

        try {
            await this.circuitBreaker.execute(async () => {
                if (EnvConfig.defaultDataSource === 'postgres') {
                    await this.postgresService.query('SELECT 1')
                    this.logger.info('PostgreSQL connection successful')
                } else {
                    await this.oracleService.query('SELECT 1 FROM DUAL')
                    this.logger.info('Oracle connection successful')
                }
            })
        } catch (err) {
            const error = err as Error
            const dbType = EnvConfig.defaultDataSource === 'postgres' ? 'PostgreSQL' : 'Oracle'
            errors.push(`${dbType} connection failed`)
            this.logger.error(`${dbType} connection failed`, { error: { message: error.message, stack: error.stack } })
        }

        if (errors.length > 0) {
            if (retryCount < EnvConfig.maxRetries) {
                this.logger.info(`Retrying database connection (attempt ${retryCount + 1}/${EnvConfig.maxRetries})...`)
                await new Promise(resolve => setTimeout(resolve, EnvConfig.retryDelay))
                return this.checkDatabaseConnections(retryCount + 1)
            }
            throw new Error(`Database connection errors: ${errors.join(', ')}`)
        }
    }

    private async restartServer(): Promise<void> {
        if (this.isRestarting) {
            this.logger.warn('Server restart already in progress')
            return
        }

        this.isRestarting = true
        this.logger.info('Initiating server restart...')

        try {
            if (this.server) {
                this.server.close()
                this.logger.info('Server stopped')
            }

            await this.checkDatabaseConnections()

            this.setupBasicMiddleware()
            this.setupRateLimiting()
            this.setupCORS()
            this.setupStaticFiles()
            this.setupRoutes()
            this.setupOpenapi()
            this.setupErrorHandling()

            this.server = this.app.listen(this.port, () => {
                this.logger.info(`Server restarted successfully on port ${this.port}...`)
            })

            // Set up database connection monitoring
            this.monitorDatabaseConnections()
        } catch (error) {
            this.logger.error('Failed to restart server', { error })
            process.exit(1)
        } finally {
            this.isRestarting = false
        }
    }

    private async monitorDatabaseConnections(): Promise<void> {
        setInterval(async () => {
            try {
                await this.checkDatabaseConnections()
            } catch (error) {
                this.logger.error('Database connection lost, attempting to restart server...', { error })
                await this.restartServer()
            }
        }, EnvConfig.databaseMonitoring.interval)
    }

    async start(): Promise<void> {
        try {
            await this.checkDatabaseConnections()

            this.setupBasicMiddleware()
            this.setupRateLimiting()
            this.setupCORS()
            this.setupStaticFiles()
            this.setupRoutes()
            this.setupOpenapi()
            this.setupErrorHandling()

            this.server = this.app.listen(this.port, () => {
                this.logger.info(`Server running on port ${this.port}...`)
            })

            // Start monitoring database connections
            this.monitorDatabaseConnections()
        } catch (error) {
            this.logger.error('Failed to start server', { error })
            process.exit(1)
        }
    }
}