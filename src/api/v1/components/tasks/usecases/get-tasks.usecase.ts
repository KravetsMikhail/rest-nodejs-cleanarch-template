import { IFindOptions } from '../../../../../core/domain/types/types'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { type TaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { TasksResponse } from '../domain/types/response'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../core/errors/app.error'

// export interface GetTasksUseCase {
//     execute: (email: string, status: string) => Promise<TaskEntity[]>
// }

// export class GetTasks implements GetTasksUseCase {
//     constructor(private readonly repository: ITaskRepository) { }

//     async execute(email: string, status: string): Promise<TaskEntity[]> {
//         return await this.repository.getTasks(email, status)
//     }
// }

export class GetTasksUseCase implements IUseCase<Promise<TasksResponse>> {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(findOptions: IFindOptions<TaskEntity, any>): Promise<TasksResponse> {
        let result = []
        try{
             result = await this.repository.find(findOptions)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as TasksResponse
        }

        return right(Result.ok<TaskEntity[]>(result as TaskEntity[])) as TasksResponse
    }

}
