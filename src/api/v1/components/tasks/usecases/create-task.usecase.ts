import { TaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { IUseCase } from '../../../../../core/domain/types/i.usecase'
import { Result, Either, left, right } from '../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../core/errors/app.error'
import { TaskSearch } from '../domain/valueobjects/task.search'
import { TaskName } from '../domain/valueobjects/task.name'

type Response = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<TaskEntity>
>

export class CreateTasksUseCase implements IUseCase<Promise<Response>> {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(name: string, userId: number): Promise<Response> {
        const _createdBy = userId.toString()
        const _updatedBy = userId.toString()
        const _name = TaskName.create(name)
        if(_name.isFailure) {
            return left(Result.fail<void, void>(_name.error)) as Response
        }
        const _nameString = _name.getValue()?.value as string
        const _search = TaskSearch.create(_nameString, _createdBy, _updatedBy)

        const combinedPropsResult = Result.combine([_name])

        if (combinedPropsResult.isFailure) {
            return left(Result.fail<void, void>(combinedPropsResult.error)) as Response
        }

        const _task = TaskEntity.create({
            name: _name?.getValue() as TaskName,
            search: _search.value,
            createdBy: _createdBy,
            updatedBy: _updatedBy,
        })

        if (_task.isFailure) {
            return left(Result.fail<void, void>(combinedPropsResult.error)) as Response
        }

        const task: TaskEntity = _task.getValue() as TaskEntity
        let newTask = {} 

        try {
            newTask = await this.repository.create(task)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as Response
        }

        return right(Result.ok<TaskEntity>(newTask as TaskEntity)) as Response
    }
}