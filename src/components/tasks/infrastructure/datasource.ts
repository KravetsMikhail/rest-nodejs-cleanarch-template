import { type TaskDatasource } from '../domain/datasources/task.datasource'
import { TaskEntity } from '../domain/entities/task.entity'
import { PostgreDbService } from '../../../infrastructure/postgresql/postgresql'
import { envs } from '../../../core/config/env'
import { QueryResult } from 'pg'

export class TaskDatasourceImpl implements TaskDatasource {
    public async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        
        const response: QueryResult = await PostgreDbService.query('SELECT * FROM tasks')    
        return response.rows
    }
}