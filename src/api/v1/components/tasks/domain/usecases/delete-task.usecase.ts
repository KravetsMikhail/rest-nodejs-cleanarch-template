import { type TaskEntity } from '../entities/task.entity'
import { type TaskRepository } from '../repositories/i.task.repository'

export interface DeleteTasksUseCase {
    execute: (id: number) => Promise<TaskEntity>
}

export class DeleteTask implements DeleteTasksUseCase {
    constructor(private readonly repository: TaskRepository) { }

    async execute(id: number): Promise<TaskEntity> {
        return await this.repository.deleteTask(id)
    }
}