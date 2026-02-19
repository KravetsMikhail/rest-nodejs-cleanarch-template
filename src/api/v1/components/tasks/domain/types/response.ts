import { Result, Either } from '../../../../../../core/domain/types/result'
import { GenericAppError } from '../../../../../../core/errors/app.error'
import { IPagination } from '../../../../../../core/domain/types/types'
import { TaskEntity } from '../entities/task.entity'

export type TaskResponse = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<TaskEntity>
>

export type TasksResponse = Either<
    GenericAppError.UnexpectedError |
    Result<any>,
    Result<{ data: TaskEntity[], pagination: IPagination }>
>