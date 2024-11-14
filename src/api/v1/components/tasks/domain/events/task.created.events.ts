import { IDomainEvent } from "../../../../../../core/domain/events/i.domain.event"
import { UniqueEntityId } from "../../../../../../core/domain/types/uniqueentityid"
import { TaskEntity } from "../entities/task.entity"

export class TaskCreatedEvent implements IDomainEvent {
    public dateTimeOccurred: Date
    public task: TaskEntity

    constructor(task: TaskEntity) {
        this.dateTimeOccurred = new Date()
        this.task = task
    }

    getAggregateId(): UniqueEntityId {
        let _id = this.task ? this.task.id : new UniqueEntityId()
        return _id
    }
}