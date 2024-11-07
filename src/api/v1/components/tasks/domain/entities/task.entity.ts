import { IDomainEvent } from 'src/core/domain/events/i.domain.event'
import { UniqueEntityId } from 'src/core/domain/types/uniqueentityid'
import { ValidationError } from '../../../../../../core/errors/validation.error'
import { AggregateRoot } from 'src/core/domain/types/aggregate.root'
import { TaskName } from '../valueobjects/task.name'
import { TaskSearch } from '../valueobjects/task.search'
import { Result } from 'src/core/domain/types/result'
import { Guard } from 'src/core/domain/types/guard'

interface ITaskProps {
    name: TaskName,
    search: string,
    createdBy: string,
    createdAt: string,
    updatedBy?: string,
    updatedAt?: string
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
    get createdAt(): string {
        return this.props.createdAt
    }
    get updatedBy(): string {
        return this.props?.updatedBy ? this.props.updatedBy : ""
    }
    get updatedAt(): string {
        return this.props?.updatedAt ? this.props.updatedAt : ""
    }

    private constructor(props: ITaskProps, id?: UniqueEntityId) {
        super(props, id)
    }

    public static create(props: ITaskProps, id?: UniqueEntityId): Result<TaskEntity> {

        const guardedProps = [
            { argument: props.name, argumentName: 'name' },
            // { argument: props.lastName, argumentName: 'lastName' },
            // { argument: props.email, argumentName: 'email' },
            // { argument: props.isEmailVerified, argumentName: 'isEmailVerified' }
        ]

        const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

        if (!guardResult.succeeded) {
            return Result.fail<TaskEntity>(guardResult.message)
        }

        else {
            const task = new TaskEntity({
                ...props,
            }, id);

            // const idWasProvided = !!id;

            // if (!idWasProvided) {
            //     user.addDomainEvent(new TaskCreatedEvent(user))
            // }

            return Result.ok<TaskEntity>(task)
        }
    }

    // public static fromJson(obj: Record<string, unknown>): TaskEntity {
    //     const { id,
    //         name,
    //         search,
    //         createdBy,
    //         createdAt,
    //         updatedBy,
    //         updatedAt } = obj
    //     if (!id) throw new ValidationError([{ constraint: 'id is required', fields: ['id'] }])
    //     if (!name) throw new ValidationError([{ constraint: 'name is required', fields: ['name'] }])
    //     return new TaskEntity(id as number,
    //         name as string,
    //         search as string,
    //         createdBy as string,
    //         createdAt as string,
    //         updatedBy as string,
    //         updatedAt as string
    //     )
    // }
}