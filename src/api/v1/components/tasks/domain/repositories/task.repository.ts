import { ID, IFindOptions } from '../../../../../../core/domain/types/types'
import { type ITaskDatasource } from '../datasources/i.task.datasource'
import { TaskEntity } from '../entities/task.entity'
import { type ITaskRepository } from './i.task.repository'

export class TaskRepository implements ITaskRepository {
    constructor(private readonly datasource: ITaskDatasource) { }

    async create(value: Partial<TaskEntity>): Promise<TaskEntity> {
        return await this.datasource.create(value)
    }
    createMany(values: Partial<TaskEntity>[]): Promise<TaskEntity[]> {
        throw new Error('Method not implemented.')
    }
    update(id: ID, newValue: Partial<TaskEntity>): Promise<TaskEntity> {
        throw new Error('Method not implemented.')
    }
    async delete(id: ID): Promise<any> {
        return await this.datasource.delete(id)
    }
    // find(value: Partial<TaskEntity>, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
    //     throw new Error('Method not implemented.')
    // }
    async find(options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> {
        return await this.datasource.find(options)
    }
    async findOne(id: ID | Partial<TaskEntity>, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity> {
        return await this.datasource.findOne(id)
    }
    exist(id: ID | Partial<TaskEntity>): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    // async getTasks(email: string, status: string): Promise<TaskEntity[]> {
    //     return await this.datasource.getTasks(email, status)
    // }
    // async createTask(name: string, search: string, userId: number): Promise<TaskEntity> {
    //     return await this.datasource.createTask(name, search, userId)
    // }
    //async deleteTask(id: number): Promise<TaskEntity> {
    //    return await this.datasource.deleteTask(id)
    //}
}