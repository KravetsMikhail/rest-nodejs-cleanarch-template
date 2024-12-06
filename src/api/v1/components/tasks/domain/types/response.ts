import { Result, Either, left, right } from '../../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../../core/errors/app.error'
import { TaskEntity } from '../entities/task.entity'

export type TaskResponse = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<TaskEntity>
>

export type TasksResponse = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<TaskEntity[]>
>