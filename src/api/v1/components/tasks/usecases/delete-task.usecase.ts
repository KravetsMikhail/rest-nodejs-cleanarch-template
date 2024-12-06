import { DeletedTaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { TaskEntity } from '../domain/entities/task.entity'
import { TaskResponse } from '../domain/types/response'

export class DeleteTasksUseCase implements IUseCase<Promise<TaskResponse>> {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(id: string, userId: number): Promise<TaskResponse> {
        const _deletedBy = userId.toString()
        const _id  = new UniqueEntityId(id)
        const _deltask = DeletedTaskEntity.delete(_id, _deletedBy)

        if (_deltask.isFailure) {
            return left(Result.fail<void, void>(new Error("Ошибка! Не удалось удалить"))) as TaskResponse
        }

        let deletedtask = {}
        try {
            deletedtask = await this.repository.delete(id)
            DomainEvents.dispatchEventsForAggregate(_id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as TaskResponse
        }

        return right(Result.ok<TaskEntity>(deletedtask as TaskEntity)) as TaskResponse
    }
}