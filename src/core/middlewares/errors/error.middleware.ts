import { type Response, type NextFunction, type Request } from 'express'

import { ValidationError } from '../../errors/validation.error'
import { HttpCode } from '../../constants/httpcodes'
import { AppError } from '../../errors/custom.error'
import { Logger } from '../../logger/logger'
import { ErrorFactory } from '../../errors/error.types'
import { PostgresService } from '../../../api/v1/infrastructure/postgresql/postgresql'
import { OracleService } from '../../../api/v1/infrastructure/oracle/oracledb'

export class ErrorMiddleware {
    //* Dependency injection  
    //constructor() {}  

    private static logger: Logger
    private static postgresService: PostgresService
    private static oracleService: OracleService

    public static initialize(logger: Logger): void {
        ErrorMiddleware.logger = logger
        ErrorMiddleware.postgresService = PostgresService.getInstance()
        ErrorMiddleware.oracleService = OracleService.getInstance()
    }

    public static handleError = async (error: unknown, _: Request, res: Response, next: NextFunction): Promise<void> => {
        let statusCode: number = HttpCode.INTERNAL_SERVER_ERROR
        let errorResponse: ReturnType<typeof ErrorFactory.createErrorResponse>

        // Check database connectivity
        const dbErrors: string[] = []
        try {
            await ErrorMiddleware.postgresService.query('SELECT 1')
        } catch (err) {
            dbErrors.push('PostgreSQL connection failed')
        }

        try {
            await ErrorMiddleware.oracleService.query('SELECT 1 FROM DUAL')
        } catch (err) {
            dbErrors.push('Oracle connection failed')
        }

        if (error instanceof ValidationError) {
            statusCode = HttpCode.BAD_REQUEST
            errorResponse = ErrorFactory.createErrorResponse(error)
        } else if (error instanceof AppError) {
            statusCode = error.statusCode
            errorResponse = ErrorFactory.createErrorResponse(error)
        } else {
            errorResponse = ErrorFactory.createErrorResponse(error)
        }

        // Add database errors to response if any
        if (dbErrors.length > 0) {
            errorResponse = {
                ...errorResponse,
                databaseErrors: dbErrors
            }
        }

        // Log the error
        ErrorMiddleware.logger.error('Error occurred', {
            error,
            statusCode,
            response: errorResponse,
            databaseErrors: dbErrors
        })

        // Send response
        res.status(statusCode).json(errorResponse)
    }
}