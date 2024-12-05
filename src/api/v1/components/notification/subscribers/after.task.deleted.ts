import { IHandle } from "../../../../../core/domain/events/i.handle"
import { DomainEvents } from "../../../../../core/domain/events/domain.events"
import { TaskDeletedEvent } from "../../tasks/domain/events/task.deleted.events"
import { NotifyKafkaChannel } from "../usecases/notify.kafka.channel"
import { DeletedTaskEntity, TaskEntity } from "../../tasks/domain/entities/task.entity"
import { IDomainEvent } from "src/core/domain/events/i.domain.event"
import { UniqueEntityId } from "src/core/domain/types/uniqueentityid"

export class AfterTaskDeleted implements IHandle<TaskDeletedEvent> {
    private notifyKafkaChannel: NotifyKafkaChannel

    constructor(notifyKafkaChannel: NotifyKafkaChannel) {
        this.setupSubscriptions()
        this.notifyKafkaChannel = notifyKafkaChannel
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onTaskDeletedEvent.bind(this), TaskDeletedEvent.name)
    }

    private craftKafkaMessage(deltask: DeletedTaskEntity): string {
        return `Удалена задача => ${deltask.id} Удалил: ${deltask.deletedBy}.`
    }

    private async onTaskDeletedEvent(event: IDomainEvent): Promise<void> {
        const { deltask } = event as TaskDeletedEvent

        try {
            await this.notifyKafkaChannel.execute(
                'deletetask', this.craftKafkaMessage(deltask)
            )
        } catch (err) {

        }
    }
}