import { type ITaskDatasource } from '../domain/datasources/i.task.datasource'
import { TaskEntity, ITaskProps } from '../domain/entities/task.entity'
import { PostgreDbService } from '../../../infrastructure/postgresql/postgresql'
import { envs } from '../../../../../config/env'
import { QueryResult } from 'pg'
import { ID, IFindOptions } from '../../../../../core/domain/types/types'
import { Helpers } from '../../../../../core/utils/helpers'

export class PostgreTaskDatasource implements ITaskDatasource {
    async create(value: Partial<TaskEntity>): Promise<TaskEntity> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        let _name = value.name?.value ? value.name.value : "<Нет наименования>"
        let _search = value.search?.value ? value.search.value : ""
        let _createdBy = value?.createdBy ? value.createdBy : ""
        let _updatedBy = value?.updatedBy ? value.updatedBy : ""
        const values = [_name, _search, _createdBy, _updatedBy, _currentDate, _currentDate ]
        const response: QueryResult = await PostgreDbService.query(`INSERT INTO ${envs.dbSchema}."Task"(
            "name", "search", "createdBy", "updatedBy", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, values)
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
        const response: QueryResult = await PostgreDbService.query(`DELETE FROM ${envs.dbSchema}."Task" n 
                                        WHERE n."id"=$1 RETURNING *;`, values)
        return response.rows[0]
    }
    // find(value: Partial<TaskEntity>, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
    //     throw new Error('Method not implemented.')
    // }
    async find(options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
        let _where = ""
        let _orderBy = ""
        //let reflect = GetReflectionTypes(TaskEntity)
        if(options){
            _where = Helpers.getWhereForPostgreSql(TaskEntity, options)
        }
        const response: QueryResult = await PostgreDbService.query(`SELECT * FROM ${envs.dbSchema}."Task" ${_where} ${_orderBy}`)
        return response.rows
    }
    findOne(id: Partial<TaskEntity> | ID, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    exist(id: Partial<TaskEntity> | ID): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
}