import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'
import { ValidationError, ValidationType } from '../../../../../../core/errors/validation.error'
import { AggregateRoot } from '../../../../../../core/domain/types/aggregate.root'
import { TaskName } from '../valueobjects/task.name'
import { TaskSearch } from '../valueobjects/task.search'
import { Result } from '../../../../../../core/domain/types/result'
import { Guard } from '../../../../../../core/domain/types/guard'
import { TaskCreatedEvent } from '../events/task.created.events'
import { TaskDeletedEvent } from '../events/task.deleted.events'
import { DbTypes, DbType, ID } from '../../../../../../core/domain/types/reflections'

export interface ITaskProps {
    name: TaskName,
    search: string,
    createdBy?: string,
    createdAt?: Date,
    updatedBy?: string,
    updatedAt?: Date
}

export interface IDeletedTaskProps {
    deletedBy: string,
    deletedAt: Date
}

export class TaskEntity extends AggregateRoot<ITaskProps> {
    @ID
    @DbType(DbTypes.Number)
    get id(): UniqueEntityId {
        return this._id
    }
    @DbType(DbTypes.String)
    get name(): TaskName {
        return this.props.name
    }
    @DbType(DbTypes.String)
    get search(): TaskSearch {
        return TaskSearch.create(this.props.name.value, this.props?.createdBy, this.props?.updatedBy)
    }
    @DbType(DbTypes.String)
    get createdBy(): string {
        return this.props?.createdBy ? this.props.createdBy : ""
    }
    @DbType(DbTypes.Date)
    get createdAt(): Date {
        return this.props?.createdAt ? this.props.createdAt : new Date()
    }
    @DbType(DbTypes.String)
    get updatedBy(): string {
        return this.props?.updatedBy ? this.props.updatedBy : ""
    }
    @DbType(DbTypes.Date)
    get updatedAt(): Date {
        return this.props?.updatedAt ? this.props.updatedAt : new Date()
    }

    private constructor(props: ITaskProps, id?: UniqueEntityId) {
        super(props, id)
    }

    public static create(props: ITaskProps, id?: UniqueEntityId): Result<TaskEntity> {
        const guardedProps = [
            { argument: props.name, argumentName: 'name' },
        ]

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps)
        
        if (!guardResult.succeeded) {
            return Result.fail<TaskEntity, ValidationError>(
                new ValidationError([{fields: ["name"], constraint: guardResult.message as string}])
            )
        }
        else {
            const task = new TaskEntity({
                ...props,
            }, id)

            task.addDomainEvent(new TaskCreatedEvent(task))

            return Result.ok<TaskEntity>(task)
        }
    }
}

export class DeletedTaskEntity extends AggregateRoot<IDeletedTaskProps> {
    get id(): UniqueEntityId {
        return this._id
    }
    get deletedBy(): string {
        return this.props.deletedBy
    }
    get deletedAt(): Date {
        return this.props?.deletedAt ? this.props.deletedAt : new Date()
    }

    private constructor(props: IDeletedTaskProps, id?: UniqueEntityId) {
        super(props, id)
    }

    public static delete(id: UniqueEntityId, userId: string): Result<DeletedTaskEntity> {
        const guardResult =  Guard.againstNullOrUndefinedOrEmpty(id, "id")

        if (!guardResult.succeeded) {
            return Result.fail<DeletedTaskEntity, ValidationError>(
                new ValidationError([{fields: ["id"], constraint: guardResult.message as string}])
            )
        }
        else {
            const deltask = new DeletedTaskEntity({
                deletedAt: new Date(),
                deletedBy: userId,
            }, id)
            deltask.addDomainEvent(new TaskDeletedEvent(deltask))
            return Result.ok<DeletedTaskEntity>(deltask)
        }
    }
}

