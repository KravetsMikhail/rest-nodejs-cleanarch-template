
import { IHandle } from "../../../../../core/domain/events/i.handle"
import { DomainEvents } from "../../../../../core/domain/events/domain.events"
import { TaskCreatedEvent } from "../../tasks/domain/events/task.created.events"
import { NotifyKafkaChannel } from "../usecases/notify.kafka.channel"
import { TaskEntity } from "../../tasks/domain/entities/task.entity"
import { IDomainEvent } from "src/core/domain/events/i.domain.event"

export class AfterTaskCreated implements IHandle<TaskCreatedEvent> {
    private notifyKafkaChannel: NotifyKafkaChannel

    constructor(notifyKafkaChannel: NotifyKafkaChannel) {
        this.setupSubscriptions()
        this.notifyKafkaChannel = notifyKafkaChannel
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onTaskCreatedEvent.bind(this), TaskCreatedEvent.name)
    }

    private craftKafkaMessage(task: TaskEntity): string {
        return `Создана новая задача => ${task.name}\nСоздал: ${task.createdBy}.`
    }

    private async onTaskCreatedEvent(event: IDomainEvent): Promise<void> {
        const { task } = event as TaskCreatedEvent

        try {
            await this.notifyKafkaChannel.execute(
                'growth', this.craftKafkaMessage(task)
            )
        } catch (err) {

        }
    }
}