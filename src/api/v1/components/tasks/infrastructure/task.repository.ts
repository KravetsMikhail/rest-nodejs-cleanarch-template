import { ID, IFindOptions } from 'src/core/types/types'
import { type ITaskDatasource } from '../domain/datasources/i.task.datasource'
import { type TaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'

export class TaskRepository implements ITaskRepository {
    constructor(private readonly datasource: ITaskDatasource) { }
    create(value: Partial<TaskEntity>): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    createMany(values: Partial<TaskEntity>[]): Promise<TaskEntity[]> {
        throw new Error('Method not implemented.')
    }
    update(id: ID, newValue: Partial<TaskEntity>): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    delete(id: ID): Promise<any> {
        throw new Error('Method not implemented.')
    }
    find(value: Partial<TaskEntity>, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
        throw new Error('Method not implemented.')
    }
    findOne(id: ID | Partial<TaskEntity>, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    exist(id: ID | Partial<TaskEntity>): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    async getTasks(email: string, status: string): Promise<TaskEntity[]> {
        return await this.datasource.getTasks(email, status)
    }
    async createTask(name: string, search: string, userId: number): Promise<TaskEntity> {
        return await this.datasource.createTask(name, search, userId)
    }
    async deleteTask(id: number): Promise<TaskEntity> {
        return await this.datasource.deleteTask(id)
    }
}