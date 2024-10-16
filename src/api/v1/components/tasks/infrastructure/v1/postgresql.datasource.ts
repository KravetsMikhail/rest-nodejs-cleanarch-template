import { type TaskDatasource } from '../../domain/datasources/i.task.datasource'
import { TaskEntity } from '../../domain/entities/v1/task.entity'
import { PostgreDbService } from '../../../../infrastructure/postgresql/postgresql'
import { envs } from '../../../../../../core/config/env'
import { QueryResult } from 'pg'

export class PostgreTaskDatasource implements TaskDatasource {
    public async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        const response: QueryResult = await PostgreDbService.query(`SELECT * FROM ${envs.dbSchema}."Task"`)    
        return response.rows
    }
}