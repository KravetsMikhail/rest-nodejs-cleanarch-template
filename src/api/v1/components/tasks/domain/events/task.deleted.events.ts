import { IDomainEvent } from "../../../../../../core/domain/events/i.domain.event"
import { UniqueEntityId } from "../../../../../../core/domain/types/uniqueentityid"
import { DeletedTaskEntity } from "../entities/task.entity"

export class TaskDeletedEvent implements IDomainEvent {
    public dateTimeOccurred: Date
    public deltask: DeletedTaskEntity

    constructor(deltask: DeletedTaskEntity) {
        this.dateTimeOccurred = new Date()
        this.deltask = deltask
    }

    getAggregateId(): UniqueEntityId {
        let _id = this.deltask.id ? this.deltask.id : new UniqueEntityId()
        return _id
    }
}