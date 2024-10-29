import { type TaskEntity } from '../entities/task.entity'

export interface ITaskRepository {
    getTasks(email: string, status: string): Promise<TaskEntity[]>
    createTask(name: string, search: string, userId: number): Promise<TaskEntity>
    deleteTask(id: number): Promise<TaskEntity>
}