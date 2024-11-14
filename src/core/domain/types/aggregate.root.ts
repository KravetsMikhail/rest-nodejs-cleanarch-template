
import { Entity } from "./entity"
import { IDomainEvent } from "../events/i.domain.event"
import { DomainEvents } from "../events/domain.events"
import { UniqueEntityId } from "./uniqueentityid"

export abstract class AggregateRoot<T> extends Entity<T> {
    private _domainEvents: IDomainEvent[] = []

    get id(): UniqueEntityId {
        return this._id
    }

    get domainEvents(): IDomainEvent[] {
        return this._domainEvents
    }

    protected addDomainEvent(domainEvent: IDomainEvent): void {
        // Add the domain event to this aggregate's list of domain events
        this._domainEvents.push(domainEvent)
        // Add this aggregate instance to the domain event's list of aggregates who's
        // events it eventually needs to dispatch.
        DomainEvents.markAggregateForDispatch(this)
        // Log the domain event
        this.logDomainEventAdded(domainEvent)
    }

    public clearEvents(): void {
        this._domainEvents.splice(0, this._domainEvents.length)
    }

    private logDomainEventAdded(domainEvent: IDomainEvent): void {
        const thisClass = Reflect.getPrototypeOf(this)
        const domainEventClass = Reflect.getPrototypeOf(domainEvent)
        console.info(`[Domain Event Created]:`, thisClass ? thisClass.constructor.name : null, '==>', domainEventClass ? domainEventClass.constructor.name : null)
    }
}