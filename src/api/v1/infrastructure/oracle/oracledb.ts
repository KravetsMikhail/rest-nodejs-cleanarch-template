import oracledb from 'oracledb'
import { envs } from '../../../../core/config/env'
import { Logger } from '../../../../core/logger/logger'

class OraclePoolConfig implements oracledb.PoolAttributes {
    public readonly user: string
    public readonly password: string
    public readonly connectString: string
    public readonly poolIncrement: number
    public readonly poolMax: number
    public readonly poolMin: number
    public readonly poolPingInterval: number
    public readonly poolTimeout: number

    constructor() {
        const { oracleDbuser,
            oracleDbPass,
            oracleDbHost,
            oracleDbName,
            oracleDbPoolincrement,
            oracleDbPoolmax,
            oracleDbPoolmin,
            oracleDbPoolpinginterval,
            oracleDbPooltimeout,
            oracleDbPort,
            oracleDbSchema } = envs

        this.user = oracleDbuser
        this.password = oracleDbPass
        this.poolIncrement = oracleDbPoolincrement
        this.poolMax = oracleDbPoolmax
        this.poolMin = oracleDbPoolmin
        this.poolPingInterval = oracleDbPoolpinginterval
        this.poolTimeout = oracleDbPooltimeout
        this.connectString = `${oracleDbHost}:${oracleDbPort}/${oracleDbName}`
    }
}

class OracleDbService {
    public static logger: any = new Logger()
    private static pool: any

    public static async _initialize() {
        try {
            this.pool = await oracledb.createPool(new OraclePoolConfig())
        } catch(err) {
            OracleDbService.logger.error(err)
            OracleDbService.logger.debug("Error in OracleDbService in _initialize")
        } finally {
            await OracleDbService.closePool()
        }
    }

    public static async query(sql: string, params?: any): Promise<any> {
        const connection = await this.pool.getConnection()
        try {
            const result = await connection.query(sql, params)
            return result
        } finally {
            await connection.release()
        }
    }

    public static async closePool() {
        try {
            await this.pool.terminate()
        } catch (err) {
            OracleDbService.logger.error(err)
            OracleDbService.logger.debug("Error in OracleDbService in closePool")
        }
    }
}

process
    .once('SIGTERM', OracleDbService.closePool)
    .once('SIGINT', OracleDbService.closePool)

OracleDbService._initialize()

export { OracleDbService }