import { IFindOptions, IPagination } from '../../../../../../core/domain/types/types'
import { IRepository } from '../../../../../../core/domain/types/i.repository'
import { type TaskEntity } from '../entities/task.entity'

export interface ITaskRepository extends IRepository<TaskEntity, any> {
    findAndCount(options?: IFindOptions<TaskEntity, any>): Promise<{ data: TaskEntity[], pagination: IPagination }>
}