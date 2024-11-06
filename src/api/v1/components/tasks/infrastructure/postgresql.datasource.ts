import { type ITaskDatasource } from '../domain/datasources/i.task.datasource'
import { TaskEntity } from '../domain/entities/task.entity'
import { PostgreDbService } from '../../../infrastructure/postgresql/postgresql'
import { envs } from '../../../../../core/config/env'
import { QueryResult } from 'pg'
import { ID, IFindOptions } from 'src/core/types/types'

export class PostgreTaskDatasource implements ITaskDatasource {
    create(value: Partial<TaskEntity>): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    createMany(values: Partial<TaskEntity>[]): Promise<TaskEntity[]> {
        throw new Error('Method not implemented.')
    }
    update(id: ID, newValue: Partial<TaskEntity>): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    delete(id: ID): Promise<any> {
        throw new Error('Method not implemented.')
    }
    find(value: Partial<TaskEntity>, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
        throw new Error('Method not implemented.')
    }
    findOne(id: Partial<TaskEntity> | ID, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    exist(id: Partial<TaskEntity> | ID): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    public async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        const response: QueryResult = await PostgreDbService.query(`SELECT * FROM ${envs.dbSchema}."Task"`)    
        return response.rows
    }
    public async createTask(name: string, search: string, userId: number): Promise<TaskEntity> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        const values = [name, search, userId.toString(), userId.toString(), _currentDate, _currentDate ]
        const response: QueryResult = await PostgreDbService.query(`INSERT INTO ${envs.dbSchema}."Task"(
            "name", "search", "createdBy", "updatedBy", "createdAt", "updatedAt")
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, values)
        return response.rows[0]
    }
    public async deleteTask(id: number): Promise<TaskEntity> {
        const values = [id ? id.toString() : '0']
        const response: QueryResult = await PostgreDbService.query(`DELETE FROM ${envs.dbSchema}."Task" n 
                                        WHERE n."id"=$1 RETURNING *;`, values)
        return response.rows[0]
    }

}