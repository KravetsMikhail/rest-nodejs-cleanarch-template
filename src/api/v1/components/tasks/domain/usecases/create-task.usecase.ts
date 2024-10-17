import { type TaskEntity } from '../entities/v1/task.entity'
import { type TaskRepository } from '../repositories/i.task.repository'

export interface CreateTasksUseCase {
    execute: (name: string, search: string) => Promise<TaskEntity>
}

export class CreateTask implements CreateTasksUseCase {
    constructor(private readonly repository: TaskRepository) { }

    async execute(name: string, search: string): Promise<TaskEntity> {
        return await this.repository.createTask(name, search)
    }
}