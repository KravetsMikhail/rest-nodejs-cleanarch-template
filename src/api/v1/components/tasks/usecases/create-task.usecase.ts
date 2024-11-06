import { type TaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'

export interface CreateTasksUseCase {
    execute: (name: string, search: string, userId: number) => Promise<TaskEntity>
}

export class CreateTask implements CreateTasksUseCase {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(name: string, search: string, userId: number): Promise<TaskEntity> {
        return await this.repository.createTask(name, search, userId)
    }
}