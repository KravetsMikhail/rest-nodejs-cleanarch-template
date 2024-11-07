import { TaskEntity } from '../domain/entities/task.entity'
import { type ITaskRepository } from '../domain/repositories/i.task.repository'
import { UseCase } from 'src/core/domain/types/i.usecase'
import { Result, Either, left, right } from 'src/core/domain/types/result'
import { GenericAppError } from 'src/core/errors/app.error'
import { TaskSearch } from '../domain/valueobjects/task.search'
import { TaskName } from '../domain/valueobjects/task.name'

// export interface CreateTasksUseCase {
//     execute: (name: string, search: string, userId: number) => Promise<TaskEntity>
// }

//export class CreateTask implements CreateTasksUseCase {

interface CreateTaskDTO {
    name: string,
    search: string,
    createdBy: string,
    updatedBy: string
}

type Response = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<void>
>

export class CreateTasksUseCase implements UseCase<CreateTaskDTO, Promise<Response>> {
    constructor(private readonly repository: ITaskRepository) { }

    async execute(req: CreateTaskDTO): Promise<Response> {
        const { name, createdBy, updatedBy } = req
        const _name = TaskName.create(name)
        const _search = TaskSearch.create(name, createdBy, updatedBy)

        const combinedPropsResult = Result.combine([_name])

        if (combinedPropsResult.isFailure) {
            return left(Result.fail<void>(combinedPropsResult.error)) as Response
        }

        const _task = TaskEntity.create({
            name: _name?.getValue as TaskName,
            search: _search.value,
            createdBy: createdBy,
            updatedBy: updatedBy,
        })

        if (_task.isFailure) {
            return left(Result.fail<void>(combinedPropsResult.error)) as Response
        }

        const task: TaskEntity = _task.getValue() as TaskEntity
        let newTask = {} 

        try {
            newTask = await this.repository.create(task)
        }catch(err){
            return left(new GenericAppError.UnexpectedError(err)) as Response
        }

        return right(Result.ok<void>()) as Response

        //return await this.repository.createTask(name, search, userId)
    }
}