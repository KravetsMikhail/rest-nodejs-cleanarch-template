import { type TaskDatasource } from '../domain/datasources/task.datasource'
import { type TaskEntity } from '../domain/entities/task.entity'
import { type TaskRepository } from '../domain/repositories/task.repository'

export class TaskRepositoryImpl implements TaskRepository {
    constructor(private readonly datasource: TaskDatasource) { }

    async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        return await this.datasource.getTasks(email, status)
    }
}