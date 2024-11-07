
import { IDomainEvent } from "./i.domain.event"

export interface IHandle<IDomainEvent> {
  setupSubscriptions(): void
}