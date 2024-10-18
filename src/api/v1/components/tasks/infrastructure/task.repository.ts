import { type TaskDatasource } from '../domain/datasources/i.task.datasource'
import { type TaskEntity } from '../domain/entities/task.entity'
import { type TaskRepository } from '../domain/repositories/i.task.repository'

export class TaskRepositoryImpl implements TaskRepository {
    constructor(private readonly datasource: TaskDatasource) { }

    async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        return await this.datasource.getTasks(email, status)
    }
    async createTask(name: string, search: string, userId: number): Promise<TaskEntity> {
        return await this.datasource.createTask(name, search, userId)
    }
    async deleteTask(id: number): Promise<TaskEntity> {
        return await this.datasource.deleteTask(id)
    }
}