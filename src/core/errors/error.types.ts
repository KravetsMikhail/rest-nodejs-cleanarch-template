import { HttpCode } from '../constants/httpcodes'
import { ValidationError } from './validation.error'
import { AppError } from './custom.error'

export interface ErrorResponse {
    code: string
    message: string
    details?: unknown
    stack?: string
    databaseErrors?: string[]
}

export interface ValidationErrorResponse extends ErrorResponse {
    validationErrors: Array<{
        fields: string[]
        constraint: string
    }>
}

export interface ErrorOptions {
    code?: string
    message: string
    details?: unknown
    stack?: string
}

export class ErrorFactory {
    public static createErrorResponse(error: unknown): ErrorResponse | ValidationErrorResponse {
        if (error instanceof ValidationError) {
            return {
                code: 'VALIDATION_ERROR',
                message: error.message,
                validationErrors: error.validationErrors
            } as ValidationErrorResponse
        }

        if (error instanceof AppError) {
            return {
                code: error.name,
                message: error.message,
                stack: error.stack
            }
        }

        if (error instanceof Error) {
            return {
                code: 'INTERNAL_SERVER_ERROR',
                message: error.message,
                stack: error.stack
            }
        }

        return {
            code: 'UNKNOWN_ERROR',
            message: 'An unknown error occurred'
        }
    }

    public static createHttpErrorResponse(error: unknown, statusCode: HttpCode): ErrorResponse {
        const errorResponse = this.createErrorResponse(error)
        return {
            ...errorResponse,
            code: errorResponse.code || `HTTP_${statusCode}`
        }
    }
} 