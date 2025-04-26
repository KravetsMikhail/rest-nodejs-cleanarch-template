import { EnvConfig } from './env'
import { LogConfig, LogLevel } from '../core/logger/logger.types'

const getLogLevel = (): LogLevel => {
    switch (EnvConfig.nodeEnv) {
        case 'development':
            return 'debug'
        case 'production':
            return 'info'
        case 'test':
            return 'debug'
        default:
            return 'info'
    }
}

export const logConfig: LogConfig = {
    level: getLogLevel(),
    filename: 'logs/app-%DATE%.log',
    maxSize: '20m',
    maxFiles: '14d',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true
}