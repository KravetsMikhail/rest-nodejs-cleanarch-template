
import { IHandle } from "../../../../../core/domain/events/i.handle"
import { DomainEvents } from "../../../../../core/domain/events/domain.events"
import { TaskUpdatedEvent } from "../../tasks/domain/events/task.updated.events"
import { NotifyKafkaChannel } from "../usecases/notify.kafka.channel"
import { TaskEntity } from "../../tasks/domain/entities/task.entity"
import { IDomainEvent } from "src/core/domain/events/i.domain.event"

export class AfterTaskUpdated implements IHandle<TaskUpdatedEvent> {
    private notifyKafkaChannel: NotifyKafkaChannel

    constructor(notifyKafkaChannel: NotifyKafkaChannel) {
        this.setupSubscriptions()
        this.notifyKafkaChannel = notifyKafkaChannel
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onTaskUpdatedEvent.bind(this), TaskUpdatedEvent.name)
    }

    private craftKafkaMessage(task: TaskEntity): string {
        return `Изменена задача => ${task.name.value} Изменил: ${task.createdBy}.`
    }

    private async onTaskUpdatedEvent(event: IDomainEvent): Promise<void> {
        const { task } = event as TaskUpdatedEvent

        try {
            await this.notifyKafkaChannel.execute(
                'updatetask', this.craftKafkaMessage(task)
            )
        } catch (err) {

        }
    }
}