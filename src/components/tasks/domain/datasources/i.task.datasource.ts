import { type TaskEntity } from '../entities/v1/task.entity'

export abstract class TaskDatasource {
    abstract getTasks(email: string, status: string): Promise<TaskEntity[]>
}