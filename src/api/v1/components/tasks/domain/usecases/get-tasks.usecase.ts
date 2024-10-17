import { type TaskEntity } from '../entities/v1/task.entity'
import { type TaskRepository } from '../repositories/i.task.repository'

export interface GetTasksUseCase {
    execute: (email: string, status: string) => Promise<TaskEntity[]>
}

export class GetTasks implements GetTasksUseCase {
    constructor(private readonly repository: TaskRepository) { }

    async execute(email: string, status: string): Promise<TaskEntity[]> {
        return await this.repository.getTasks(email, status)
    }
}