import { type TaskEntity } from '../entities/task.entity'

export abstract class TaskDatasource {
    abstract getTasks(email: string, status: string): Promise<TaskEntity[]>
    abstract createTask(name: string, search: string, userId: number): Promise<TaskEntity>
    abstract deleteTask(id: number): Promise<TaskEntity>
}