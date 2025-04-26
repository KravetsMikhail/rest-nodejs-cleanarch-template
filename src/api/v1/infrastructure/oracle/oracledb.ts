import oracledb from 'oracledb'
import { EnvConfig } from '../../../../config/env'
import { Logger } from '../../../../core/logger/logger'

interface OracleResult {
    rows: any[]
    metaData?: any[]
    errors?: { message: string }[]
}

export class OracleService {
    private static instance: OracleService
    private pool: oracledb.Pool | null = null
    private readonly logger: Logger

    private constructor() {
        this.logger = new Logger()
    }

    public static getInstance(): OracleService {
        if (!OracleService.instance) {
            OracleService.instance = new OracleService()
        }
        return OracleService.instance
    }

    public async initialize(): Promise<void> {
        try {
            this.logger.debug('Initializing Oracle pool')
            const config: oracledb.PoolAttributes = {
                user: EnvConfig.oracle.user,
                password: EnvConfig.oracle.pass,
                connectString: `${EnvConfig.oracle.host}:${EnvConfig.oracle.port}/${EnvConfig.oracle.name}`,
                poolIncrement: EnvConfig.oracle.poolIncrement,
                poolMax: EnvConfig.oracle.poolMax,
                poolMin: EnvConfig.oracle.poolMin,
                poolPingInterval: EnvConfig.oracle.poolPingInterval,
                poolTimeout: EnvConfig.oracle.poolTimeout
            }

            this.pool = await oracledb.createPool(config)
            this.logger.debug('Oracle pool initialized successfully')
        } catch (err) {
            const error = err as Error
            this.logger.error('Failed to initialize Oracle pool', { message: error.message, stack: error.stack })
            throw err
        }
    }

    public async query(sql: string, params?: any[]): Promise<OracleResult> {
        if (!this.pool) {
            throw new Error('Oracle pool not initialized')
        }

        const start = Date.now()
        const connection = await this.pool.getConnection()
        
        try {
            this.logger.debug(`Executing Oracle query: ${sql}`)
            const result = await connection.execute(sql, params || [], { outFormat: oracledb.OUT_FORMAT_OBJECT })
            const duration = Date.now() - start
            this.logger.debug(`Executed query in ${duration}ms: ${sql}`)
            
            return {
                rows: result.rows || [],
                metaData: result.metaData
            }
        } catch (err) {
            this.logger.error('Error executing Oracle query', {
                query: sql,
                params,
                error: err
            })
            return {
                rows: [],
                errors: [{ message: (err as Error).message }]
            }
        } finally {
            await connection.release()
        }
    }

    public async close(): Promise<void> {
        if (this.pool) {
            try {
                this.logger.debug('Closing Oracle pool')
                await this.pool.terminate()
                this.pool = null
                this.logger.debug('Oracle pool closed successfully')
            } catch (err) {
                const error = err as Error
                this.logger.error('Error closing Oracle pool', { message: error.message, stack: error.stack })
                throw err
            }
        }
    }
}

// Initialize pool on process termination
process.once('SIGTERM', async () => {
    await OracleService.getInstance().close()
})

process.once('SIGINT', async () => {
    await OracleService.getInstance().close()
})