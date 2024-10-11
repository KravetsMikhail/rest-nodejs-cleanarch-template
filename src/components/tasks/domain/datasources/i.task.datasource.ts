import { type TaskEntity } from '../entities/task.entity'

export abstract class TaskDatasource {
    abstract getTasks(email: string, status: string): Promise<TaskEntity[]>
}