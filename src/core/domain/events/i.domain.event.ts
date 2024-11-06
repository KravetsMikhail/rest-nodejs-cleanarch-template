import { UniqueEntityId } from "../types/uniqueentityid"

export interface IDomainEvent {
    dateTimeOccurred: Date
    getAggregateId(): UniqueEntityId
}
