//const { config } = require('../config/environments/' + process.env.TEST_ENV)
import expressWinston from 'express-winston'
import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import { Handler, ErrorRequestHandler } from 'express'
import { logConfig } from '../../config/logconfig'
import { LoggerInterface, LogMetadata } from './logger.types'

const { createLogger, format, transports } = winston

export class Logger implements LoggerInterface {
    private logger: winston.Logger

    constructor() {
        const fileTransport = new DailyRotateFile({
            filename: logConfig.filename,
            maxSize: logConfig.maxSize,
            maxFiles: logConfig.maxFiles,
            datePattern: logConfig.datePattern,
            zippedArchive: logConfig.zippedArchive
        })

        this.logger = winston.createLogger({
            level: logConfig.level,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            transports: [
                fileTransport,
                new winston.transports.Console()
            ]
        })
    }

    error(message: string, meta?: LogMetadata): void {
        this.logger.error(message, meta)
    }

    warn(message: string, meta?: LogMetadata): void {
        this.logger.warn(message, meta)
    }

    info(message: string, meta?: LogMetadata): void {
        this.logger.info(message, meta)
    }

    debug(message: string, meta?: LogMetadata): void {
        this.logger.debug(message, meta)
    }

    getRequestLogger(): Handler {
        return expressWinston.logger({
            winstonInstance: this.logger,
            meta: true,
            msg: 'HTTP {{req.method}} {{req.url}}',
            expressFormat: true,
            colorize: false
        })
    }

    getRequestErrorLogger(): ErrorRequestHandler {
        return expressWinston.errorLogger({
            winstonInstance: this.logger,
            meta: true,
            msg: 'HTTP {{req.method}} {{req.url}}'
        })
    }
}