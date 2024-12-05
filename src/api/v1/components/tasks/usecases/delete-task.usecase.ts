import { DeletedTaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { Result, Either, left, right } from '../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { ID } from 'src/core/domain/types/types'
import { TaskEntity } from '../domain/entities/task.entity'


// export interface DeleteTasksUseCase {
//     execute: (id: number) => Promise<TaskEntity>
// }

// export class DeleteTask implements DeleteTasksUseCase {
//     constructor(private readonly repository: ITaskRepository) { }

//     async execute(id: number): Promise<TaskEntity> {
//         return await this.repository.delete(id)
//     }
// }

type Response = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<TaskEntity>
>

export class DeleteTasksUseCase implements IUseCase<Promise<Response>> {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(id: string, userId: number): Promise<Response> {
        const _deletedBy = userId.toString()
        const _id  = new UniqueEntityId(id)
        const _deltask = DeletedTaskEntity.delete(_id, _deletedBy)

        if (_deltask.isFailure) {
            return left(Result.fail<void, void>(new Error("Ошибка! Не удалось удалить"))) as Response
        }

        let deletedtask = {}
        try {
            deletedtask = await this.repository.delete(id)
            DomainEvents.dispatchEventsForAggregate(_id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as Response
        }

        return right(Result.ok<TaskEntity>(deletedtask as TaskEntity)) as Response
    }
}