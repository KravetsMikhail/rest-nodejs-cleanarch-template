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

    async execute(newtask: any, userId: number): Promise<TaskResponse> {
        if (!newtask) {
            return left(Result.fail<void, void>("Ошибка! Нет данных")) as TaskResponse
        }
        let _reflect = GetReflectionTypes(TaskEntity)
        let _isOk: boolean = true;
        for (const k of Object.getOwnPropertyNames(newtask)) {
            if (!(_reflect as ReflectionData[]).find(r => r.field === k)) {
                _isOk = false
                break
            }
        }
        if (!_isOk) {
            return left(Result.fail<void, void>("Ошибка! Не верный или не полный состав данных")) as TaskResponse
        }

        const _updatedBy = userId.toString()
        const _name = TaskName.create(newtask.name)
        const _nameString = _name.getValue()?.value as string

        const _task = TaskEntity.create({
            name: _name?.getValue() as TaskName,
            search: newtask.search as string,
            updatedBy: _updatedBy,
        }, newtask.id)

        if (_task.isFailure) {
            return left(Result.fail<void, void>("Ошибка! Не удалось создать Task для обновления")) as TaskResponse
        }

        const task: TaskEntity = _task.getValue() as TaskEntity
        let replaceTask = {} 

        try {
            replaceTask = await this.repository.update(newtask.id, task)
            DomainEvents.dispatchEventsForAggregate(newtask.id)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as TaskResponse
        }

        return right(Result.ok<TaskEntity>(replaceTask as TaskEntity)) as TaskResponse
    }
}