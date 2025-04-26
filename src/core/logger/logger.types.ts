import { Handler, ErrorRequestHandler } from 'express'

export type LogLevel = 'error' | 'warn' | 'info' | 'debug'

export interface LogConfig {
    level: LogLevel
    filename: string
    maxSize: string
    maxFiles: string
    datePattern: string
    zippedArchive: boolean
}

export interface LogMetadata {
    [key: string]: any
}

export interface LoggerInterface {
    error(message: string, meta?: LogMetadata): void
    warn(message: string, meta?: LogMetadata): void
    info(message: string, meta?: LogMetadata): void
    debug(message: string, meta?: LogMetadata): void
    getRequestLogger(): Handler
    getRequestErrorLogger(): ErrorRequestHandler
} 