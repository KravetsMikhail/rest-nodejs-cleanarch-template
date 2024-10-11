import express, { type Router, type Request, type Response, type NextFunction } from 'express'
import compression from 'compression'
import rateLimit from 'express-rate-limit'

import { ONE_HUNDRED, ONE_THOUSAND, SIXTY } from './core/constants/constatnts'
import { HttpCode } from './core/constants/httpcodes'
import { ErrorMiddleware } from './interface/middlewares/errors/error.middleware'
import { AppError } from './core/errors/custom.error'
import { Logger } from './core/logger/logger'
import serveFavicon = require('serve-favicon')
import path = require('path')

interface ServerOptions {
    port: number
    routes: Router
    apiPrefix: string
}

export class Server {
    private readonly app = express()
    private readonly logger = new Logger()
    private readonly port: number
    private readonly routes: Router
    private readonly apiPrefix: string

    constructor(options: ServerOptions) {
        const { port, routes, apiPrefix } = options
        this.port = port
        this.routes = routes
        this.apiPrefix = apiPrefix
    }

    async start(): Promise<void> {
        //* Middlewares  
        this.app.use(express.json()) // parse json in request body (allow raw)  
        this.app.use(express.urlencoded({ extended: true })) // allow x-www-form-urlencoded  
        this.app.use(compression())
        this.app.use(this.logger.getRequestLogger())
        //  limit repeated requests to public APIs  
        this.app.use(
            rateLimit({
                max: ONE_HUNDRED,
                windowMs: SIXTY * SIXTY * ONE_THOUSAND,
                message: 'Too many requests from this IP, please try again in one hour'
            })
        )

        // CORS  
        this.app.use((req, res, next) => {
            // Add your origins  
            const allowedOrigins = ['http://localhost:1234']
            const origin = req.headers.origin
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion  
            if (allowedOrigins.includes(origin!)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion  
                res.setHeader('Access-Control-Allow-Origin', origin!)
            }
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
            next()
        })

        this.app.use(serveFavicon(path.join(__dirname, '..', '/public/favicon.ico')))

        //* Routes  
        this.app.use(this.apiPrefix, this.routes)
        this.app.get('/health', (_req: Request, res: Response) => {
            return res.status(HttpCode.OK).json({ status: true, message: 'Health OK!' }) as any
        })

        // Test rest api  
        this.app.get('/', (_req: Request, res: Response)  => {
            return res.status(HttpCode.OK).send({
                message: `Welcome to Initial API! n Endpoints available at http://localhost:${this.port}/`
            }) as any
        })

        //* Handle not found routes in /api/v1/* (only if 'Public content folder' is not available)  
        this.routes.all('*', (req: Request, _: Response, next: NextFunction): void => {
            next(AppError.notFound(`Cant find ${req.originalUrl} on this server!`));
        })

        this.app.use(this.logger.getRequestErrorLogger())

        // Handle errors middleware  
        this.routes.use(ErrorMiddleware.handleError)
        
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}...`)
        })
    }
}