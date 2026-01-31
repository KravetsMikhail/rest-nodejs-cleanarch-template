require("dotenv").config()

export type DataSourceType = 'postgres' | 'oracle'

interface DatabaseConfig {
    name: string
    host: string
    port: number
    user: string
    pass: string
    schema: string
}

interface OraclePoolConfig {
    poolIncrement: number
    poolMax: number
    poolMin: number
    poolPingInterval: number
    poolTimeout: number
}

interface KafkaConfig {
    clientId: string
    brokers: string[]
}

export class EnvConfig {
    public static readonly version = process.env.VERSION || '1.0.0'
    public static readonly nodeEnv = process.env.NODE_ENV || 'development'
    public static readonly protocol = process.env.PROTOCOL || 'http'
    public static readonly host = process.env.HOST || 'localhost'
    public static readonly port = Number(process.env.PORT) || 1234
    public static readonly apiPrefix = process.env.API_PREFIX || '/api'
    //public static readonly uiHost = process.env.UI_HOST || 'localhost'
    //public static readonly uiPort = Number(process.env.UI_PORT) || 3000
    public static readonly allowOrig = process.env.ALLOW_ORIG || [`${EnvConfig.protocol}://localhost:1234`,`${EnvConfig.protocol}://localhost:5173`]
    public static readonly defaultDataSource: DataSourceType = (process.env.DEFAULT_DATASOURCE as DataSourceType) || 'postgres'
    public static readonly maxRetries = Number(process.env.MAX_RETRIES) || 5
    public static readonly retryDelay = Number(process.env.RETRY_DELAY) || 5000
    public static readonly circuitBreaker = {
        failureThreshold: Number(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD) || 3,
        resetTimeout: Number(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT) || 10000
    }
    public static readonly databaseMonitoring = {
        interval: Number(process.env.DB_MONITORING_INTERVAL) || 30000
    }

    public static readonly postgres: DatabaseConfig = {
        name: process.env.PG_DB_NAME || '',
        host: process.env.PG_DB_HOST || '',
        port: Number(process.env.PG_DB_PORT) || 5432,
        user: process.env.PG_DB_USER || '',
        pass: process.env.PG_DB_PASS || '',
        schema: process.env.PG_DB_SCHEMA || ''
    }

    public static readonly oracle: DatabaseConfig & OraclePoolConfig = {
        name: process.env.ORACLE_DB_NAME || '',
        host: process.env.ORACLE_DB_HOST || '',
        port: Number(process.env.ORACLE_DB_PORT) || 1521,
        user: process.env.ORACLE_DB_USER || '',
        pass: process.env.ORACLE_DB_PASS || '',
        schema: process.env.ORACLE_DB_SCHEMA || '',
        poolIncrement: Number(process.env.ORACLE_DB_POOLINCREMENT) || 1,
        poolMax: Number(process.env.ORACLE_DB_POOLMAX) || 10,
        poolMin: Number(process.env.ORACLE_DB_POOLMIN) || 1,
        poolPingInterval: Number(process.env.ORACLE_DB_POOLPINGINTERVAL) || 60,
        poolTimeout: Number(process.env.ORACLE_DB_POOLTIMEOUT) || 60
    }

    public static readonly kafka: KafkaConfig = {
        clientId: process.env.KAFKA_CLIENTID || '',
        brokers: JSON.parse(process.env.KAFKA_BROKERS || '[]') as string[]
    }

    public static validate(): void {
        const requiredEnvVars = [
            'PG_DB_NAME',
            'PG_DB_HOST',
            'PG_DB_USER',
            'PG_DB_PASS',
            'ORACLE_DB_NAME',
            'ORACLE_DB_HOST',
            'ORACLE_DB_USER',
            'ORACLE_DB_PASS',
            'KAFKA_CLIENTID',
            'KAFKA_BROKERS'
        ]

        const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar])
        if (missingVars.length > 0) {
            throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
        }
    }
}

// Export for backward compatibility
export const envs = EnvConfig