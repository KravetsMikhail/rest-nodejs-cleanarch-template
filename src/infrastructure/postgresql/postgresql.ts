import { Pool } from 'pg'
import { envs } from '../../core/config/env'
import { Logger } from '../../core/logger/logger'
import { QueryArrayResult } from "pg"

const pool = new Pool({
    user: envs.dbUser,
    host: envs.dbHost,
    password: envs.dbPass,
    database: envs.dbName,
    port: envs.dbPort
})

class PostgreDbService {
    public static logger: any = new Logger()

    public static async query(text: string, params?: string[]): Promise<QueryArrayResult> {
        return pool.query(text, params).catch(err => {            
            PostgreDbService.logger.error(err.message)
            return {
                rows: [],
                fields: [],
                errors: [{ message: err.message}],
                command: '',
                rowCount: 0,
                oid: 1,
            }
        })
    }
}

export { PostgreDbService }