import { type TaskEntity } from '../entities/task.entity'
import { type ITaskRepository } from '../repositories/i.task.repository'

export interface GetTasksUseCase {
    execute: (email: string, status: string) => Promise<TaskEntity[]>
}

export class GetTasks implements GetTasksUseCase {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(email: string, status: string): Promise<TaskEntity[]> {
        return await this.repository.getTasks(email, status)
    }
}