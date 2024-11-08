import { IDomainEvent } from '../../../../../../core/domain/events/i.domain.event'
import { UniqueEntityId } from '../../../../../../core/domain/types/uniqueentityid'
import { ValidationError, ValidationType } from '../../../../../../core/errors/validation.error'
import { AggregateRoot } from '../../../../../../core/domain/types/aggregate.root'
import { TaskName } from '../valueobjects/task.name'
import { TaskSearch } from '../valueobjects/task.search'
import { Result } from '../../../../../../core/domain/types/result'
import { Guard } from '../../../../../../core/domain/types/guard'

interface ITaskProps {
    name: TaskName,
    search: string,
    createdBy: string,
    createdAt?: Date,
    updatedBy?: string,
    updatedAt?: Date
}

export class TaskEntity extends AggregateRoot<ITaskProps> {
    get id(): UniqueEntityId {
        return this._id
    }
    get name(): TaskName {
        return this.props.name
    }
    get search(): TaskSearch {
        return TaskSearch.create(this.props.name.value, this.props?.createdBy, this.props?.createdBy)
    }
    get createdBy(): string {
        return this.props.createdBy
    }
    get createdAt(): Date {
        return this.props?.createdAt ? this.props.createdAt : new Date()
    }
    get updatedBy(): string {
        return this.props?.updatedBy ? this.props.updatedBy : ""
    }
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

            return Result.ok<TaskEntity>(task)
        }
    }
}