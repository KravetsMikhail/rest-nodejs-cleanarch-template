import { type ITaskDatasource } from '../domain/datasources/i.task.datasource'
import { TaskEntity } from '../domain/entities/task.entity'
import { OracleService } from '../../../infrastructure/oracle/oracledb'
import { EnvConfig } from '../../../../../config/env'
import { ID, IFindOptions, IPagination } from '../../../../../core/domain/types/types'

export class OracleTaskDatasource implements ITaskDatasource {
    private readonly oracleService: OracleService

    constructor() {
        this.oracleService = OracleService.getInstance()
    }

    async create(value: Partial<TaskEntity>): Promise<TaskEntity> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        let _name = value.name?.value ? value.name.value : "<Нет наименования>"
        let _search = value.search?.value ? value.search.value : ""
        let _createdBy = value?.createdBy ? value.createdBy : ""
        let _updatedBy = value?.updatedBy ? value.updatedBy : ""
        const values = [_name, _search, _createdBy, _updatedBy, _currentDate, _currentDate ]
        const response = await this.oracleService.query(`DECLARE 
            v_row tasks%rowType; 
        BEGIN 
        INSERT INTO TASKS (
name, search, createdBy, updatedBy, createdAt, updatedAt)
VALUES ($1, $2, $3, $4, $5, $6) 
RETURNING name, search, createdBy, updatedBy, createdAt, updatedAt into v_row;
END;`, values)
        return response.rows[0]
    }

    createMany(values: Partial<TaskEntity>[]): Promise<TaskEntity[]> {
        throw new Error('Method not implemented.')
    }

    update(id: ID, newValue: Partial<TaskEntity>): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }

    async delete(id: ID): Promise<any> {
        const values = [id ? id.toString() : '0']
        const response = await this.oracleService.query(`DELETE FROM ${EnvConfig.oracle.schema}."Task" n 
                                        WHERE n."id"=$1 RETURNING *;`, values)
        return response.rows[0]
    }

    async find(options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
        const { data } = await this.findAndCount(options)
        return data
    }

    async findAndCount(options?: IFindOptions<TaskEntity, any> | undefined): Promise<{ data: TaskEntity[], pagination: IPagination }> {
        const _query = 'SELECT * FROM TASKS'
        const response = await this.oracleService.query(_query, [])
        const rows = response.rows ?? []
        const offset = options?.offset ?? 0
        const limit = options?.limit ?? 10000
        const pagination: IPagination = { total: rows.length, offset, limit }
        return { data: rows, pagination }
    }

    findOne(id: Partial<TaskEntity> | ID, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }

    exist(id: Partial<TaskEntity> | ID): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
}