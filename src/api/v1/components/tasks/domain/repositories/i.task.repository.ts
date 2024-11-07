import { IRepository } from 'src/core/domain/types/i.repository'
import { type TaskEntity } from '../entities/task.entity'

export interface ITaskRepository extends IRepository<TaskEntity, any> {    
    getTasks(email: string, status: string): Promise<TaskEntity[]>
    //createTask(name: string, search: string, userId: number): Promise<TaskEntity>
    deleteTask(id: number): Promise<TaskEntity>
}