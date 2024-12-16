import { TaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, left, right } from '../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { TaskSearch } from '../domain/valueobjects/task.search'
import { TaskName } from '../domain/valueobjects/task.name'
import { UniqueEntityId } from '../../../../../core/domain/types/uniqueentityid'
import { DomainEvents } from '../../../../../core/domain/events/domain.events'
import { TaskResponse } from '../domain/types/response'
import { GetReflectionTypes, ReflectionData } from '../../../../../core/domain/types/reflections'

export class ReplaceTasksUseCase implements IUseCase<Promise<TaskResponse>> {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(id: number, updtask: any, userId: number): Promise<TaskResponse> {
        if (!updtask) {
            return left(Result.fail<void, void>("Ошибка! Нет данных")) as TaskResponse
        }
        let _reflect = GetReflectionTypes(TaskEntity)
        let _isOk: boolean = true;
        for (const k of Object.getOwnPropertyNames(updtask)) {
            if (!(_reflect as ReflectionData[]).find(r => r.field === k)) {
                _isOk = false
                break
            }
        }
        if (!_isOk) {
            return left(Result.fail<void, void>("Ошибка! Не верный или не полный состав данных")) as TaskResponse
        }

        const _updatedBy = userId.toString()
        const _name = TaskName.create(updtask.name)

        const _task = TaskEntity.update({
            name: _name?.getValue() as TaskName,
            search: updtask.search as string,
            updatedBy: _updatedBy,
            createdAt: updtask.createdAt,
            createdBy: updtask.createdBy
        }, new UniqueEntityId(id))

        if (_task.isFailure) {
            return left(Result.fail<void, void>("Ошибка! Не удалось создать Task для обновления")) as TaskResponse
        }

        const task: TaskEntity = _task.getValue() as TaskEntity
        let replaceTask = {} 

        try {
            replaceTask = await this.repository.update(id, task)
            DomainEvents.dispatchEventsForAggregate(id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as TaskResponse
        }

        return right(Result.ok<TaskEntity>(replaceTask as TaskEntity)) as TaskResponse
    }
}