import { type TaskEntity } from '../entities/v1/task.entity'

export abstract class TaskRepository {
    abstract getTasks(email: string, status: string): Promise<TaskEntity[]>
}