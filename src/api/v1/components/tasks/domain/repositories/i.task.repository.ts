import { IRepository } from '../../../../../../core/domain/types/i.repository'
import { type TaskEntity } from '../entities/task.entity'

export interface ITaskRepository extends IRepository<TaskEntity, any> {    
}