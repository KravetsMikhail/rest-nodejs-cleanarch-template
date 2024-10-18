import { type TaskEntity } from '../entities/task.entity'

export abstract class TaskRepository {
    abstract getTasks(email: string, status: string): Promise<TaskEntity[]>
    abstract createTask(name: string, search: string, userId: number): Promise<TaskEntity>
}