
import { IHandle } from "../../../../../core/domain/events/i.handle"
import { DomainEvents } from "../../../../../core/domain/events/domain.events"
import { TaskCreatedEvent } from "../../tasks/domain/events/task.created.events"
import { NotifyKafkaChannel } from "../usecases/notify.kafka.channel"
import { TaskEntity } from "../../tasks/domain/entities/task.entity"

export class AfterTaskCreated implements IHandle<TaskCreatedEvent> {
    private notifyKafkaChannel: NotifyKafkaChannel

    constructor(notifyKafkaChannel: NotifyKafkaChannel) {
        this.setupSubscriptions()
        this.notifyKafkaChannel = notifyKafkaChannel
    }

    setupSubscriptions(): void {
        DomainEvents.register(this.onTaskCreatedEvent.bind(this), TaskCreatedEvent.name)
       // DomainEvents.register(() => this.onTaskCreatedEvent(), TaskCreatedEvent.name)
    }

    private craftKafkaMessage(task: TaskEntity): string {
        return `Создана новая задача => ${task.name}\n
      Создал: ${task.createdBy}.`
    }

    private async onTaskCreatedEvent(event: TaskCreatedEvent): Promise<void> {
        const { task } = event

        try {
            await this.notifyKafkaChannel.execute(
                'growth', this.craftKafkaMessage(task)
            )
        } catch (err) {

        }
    }
}