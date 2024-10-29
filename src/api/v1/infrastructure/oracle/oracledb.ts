import oracledb from 'oracledb'
import { envs } from '../../../../core/config/env'
import { Logger } from '../../../../core/logger/logger'
import * as migraition from './migration'

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
            oracleDbPort } = envs

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
        let _config = new OraclePoolConfig()
       /*  try {
            //migration
            OracleDbService.logger.debug(`=> Старт миграции Oracle на ${_config.connectString} <=`)
            await migraition.migration(_config)
            OracleDbService.logger.debug(`=> Миграция выполнена на ${_config.connectString} <=`)
        } catch(err){} */

        try {
            OracleDbService.logger.debug("=> Запуск пул Oracle <=")
            this.pool = await oracledb.createPool(_config)
            OracleDbService.logger.debug("=> Создан пул Oracle <=")
        } catch(err) {
            OracleDbService.logger.error(err)
            OracleDbService.logger.debug("Error in OracleDbService in _initialize")
            OracleDbService.logger.debug("Не удалось создать пул Oracle")
        } /*finally {
            OracleDbService.logger.debug("=> Закрытие пула Oracle в finally <=")
            await OracleDbService.closePool()
            OracleDbService.logger.debug("=> Закрыт пул Oracle <=")
        }*/
    }

    public static async query(sql: string, params?: any): Promise<any> {
        const connection = await this.pool.getConnection()
        try {
            const result = await connection.execute(sql, params)
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