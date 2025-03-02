import { IDomainEvent } from "../../../../../../core/domain/events/i.domain.event"
import { UniqueEntityId } from "../../../../../../core/domain/types/uniqueentityid"
import { TaskEntity } from "../entities/task.entity"

export interface ITaskCreatedEventProps {
    task: TaskEntity
}

/** Event emitted when a new task is created */
export class TaskCreatedEvent implements IDomainEvent {
    public static readonly EVENT_TYPE = 'task.created'
    public readonly eventType = TaskCreatedEvent.EVENT_TYPE

    public readonly dateTimeOccurred: Date
    public readonly task: TaskEntity

    constructor(props: ITaskCreatedEventProps) {
        this.dateTimeOccurred = new Date()
        this.task = props.task
    }

    getAggregateId(): UniqueEntityId {
        if (!this.task) {
            throw new Error('Task is required for getting aggregate ID')
        }
        let _id = this.task.id ? this.task.id : new UniqueEntityId()
        return _id
    }

    public toJSON() {
        return {
            dateTimeOccurred: this.dateTimeOccurred,
            taskId: this.task.id.toString()
        }
    }

    public clone(): TaskCreatedEvent {
        return new TaskCreatedEvent({ task: this.task })
    }
}