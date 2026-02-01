import { Pool, QueryArrayResult } from 'pg'
import { EnvConfig } from '../../../../config/env'
import { Logger } from '../../../../core/logger/logger'

interface QueryErrorResult extends Omit<QueryArrayResult, 'rows'> {
    rows: any[]
    errors: { message: string }[]
}

export class PostgresService {
    private static instance: PostgresService
    private readonly pool: Pool
    private readonly logger: Logger

    private constructor() {
        this.logger = new Logger()
        this.pool = new Pool({
            user: EnvConfig.postgres.user,
            host: EnvConfig.postgres.host,
            password: EnvConfig.postgres.pass,
            database: EnvConfig.postgres.name,
            port: EnvConfig.postgres.port,
            max: 100, // Увеличено до 100 соединений
            idleTimeoutMillis: 30000, // 30 секунд
            connectionTimeoutMillis: 2000, // 2 секунды
            maxUses: 7500, // Переиспользование соединений
            keepAlive: true, // TCP keep-alive
            keepAliveInitialDelayMillis: 0, // Немедленный keep-alive
        })

        this.pool.on('error', (err) => {
            const error = err as Error
            this.logger.error('Unexpected error on idle client', { error: { message: error.message, stack: error.stack } })
        })
    }

    public static getInstance(): PostgresService {
        if (!PostgresService.instance) {
            PostgresService.instance = new PostgresService()
        }
        return PostgresService.instance
    }

    public async query(text: string, params?: string[]): Promise<QueryArrayResult | QueryErrorResult> {
        const start = Date.now()
        try {
            const result = await this.pool.query(text, params)
            const duration = Date.now() - start
            this.logger.debug(`Executed query in ${duration}ms: ${text}`)
            return result
        } catch (err) {
            const error = err as Error
            this.logger.error('Error executing query', {
                query: text,
                params,
                error: { message: error.message, stack: error.stack }
            })
            return {
                rows: [],
                fields: [],
                errors: [{ message: error.message }],
                command: '',
                rowCount: 0,
                oid: 1
            }
        }
    }

    public async close(): Promise<void> {
        try {
            await this.pool.end()
            this.logger.debug('PostgreSQL pool closed')
        } catch (err) {
            const error = err as Error
            this.logger.error('Error closing PostgreSQL pool', { error: { message: error.message, stack: error.stack } })
        }
    }
}