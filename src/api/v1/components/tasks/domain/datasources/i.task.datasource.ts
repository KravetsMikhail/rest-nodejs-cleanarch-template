import { ID, IFindOptions } from 'src/core/types/types'
import { type TaskEntity } from '../entities/task.entity'
import { IDataSource } from 'src/core/types/i.datasource'

export interface ITaskDatasource extends IDataSource<TaskEntity, any> {
    create(value: Partial<TaskEntity>): Promise<TaskEntity> 
    createMany(values: Partial<TaskEntity>[]): Promise<TaskEntity[]>
    update(id: ID, newValue: Partial<TaskEntity>): Promise<TaskEntity>
    delete(id: ID): Promise<any>
    find(value: Partial<TaskEntity>, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity[]> 
    findOne(id: Partial<TaskEntity> | ID, options?: IFindOptions<TaskEntity, any> | undefined): Promise<TaskEntity> 
    exist(id: Partial<TaskEntity> | ID): Promise<boolean> 
    getTasks(email: string, status: string): Promise<TaskEntity[]>
    createTask(name: string, search: string, userId: number): Promise<TaskEntity>
    deleteTask(id: number): Promise<TaskEntity>
}