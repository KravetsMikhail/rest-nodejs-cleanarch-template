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

export class ReplaceTasksUseCase implements IUseCase<Promise<TaskResponse>> {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(newtask: any, userId: number): Promise<TaskResponse> {
        //const _createdBy = userId.toString()
        //const _updatedBy = userId.toString()
        //const _name = TaskName.create(name)
        // if(_name.isFailure) {
        //     return left(Result.fail<void, void>(_name.error)) as TaskResponse
        // }
        // const _nameString = _name.getValue()?.value as string
        // const _search = TaskSearch.create(_nameString, _createdBy, _updatedBy)

        // const combinedPropsResult = Result.combine([_name])

        // if (combinedPropsResult.isFailure) {
        //     return left(Result.fail<void, void>(combinedPropsResult.error)) as TaskResponse
        // }
        // const _id = new UniqueEntityId()
        // const _task = TaskEntity.create({
        //     name: _name?.getValue() as TaskName,
        //     search: _search.value,
        //     createdBy: _createdBy,
        //     updatedBy: _updatedBy,
        // }, _id)

        // if (_task.isFailure) {
        //     return left(Result.fail<void, void>(combinedPropsResult.error)) as TaskResponse
        // }

        // const task: TaskEntity = _task.getValue() as TaskEntity
        // let newTask = {} 

        // try {
        //     newTask = await this.repository.create(task)
        //     DomainEvents.dispatchEventsForAggregate(_id)
        // }catch(err){
        //     return left(new GenericAppError.UnexpectedError(err)) as TaskResponse
        // }

        // return right(Result.ok<TaskEntity>(newTask as TaskEntity)) as TaskResponse
        return {} as TaskResponse
    }
}