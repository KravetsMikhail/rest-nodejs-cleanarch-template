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
    public async createTask(name: string, search: string): Promise<TaskEntity> {
        const _currentDate = new Date().toISOString().replace('T', ' ')
        const _user = 'Иванов'
        const values = [name, search, _user, _user, _currentDate, _currentDate ]
        const response: QueryResult = await PostgreDbService.query(`INSERT INTO ${envs.dbSchema}."Task"(
                                        "name", "search", "createdBy", "updatedBy", "createdAt", "updatedAt")
                                        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, values)
        return response.rows[0]
    }
}