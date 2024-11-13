
import { IUseCase } from "../../../../../core/domain/types/i.usecase"
import { KafkaChannel } from "../domain/kafka.channel"
import { IKafkaService } from "../services/kafka.service"

export class NotifyKafkaChannel implements IUseCase<Promise<void>> {
    private kafkaService: IKafkaService

    constructor(kafkaService: IKafkaService) {
        this.kafkaService = kafkaService
    }

    async execute(channel: KafkaChannel, message: string): Promise<void> {
        await this.kafkaService.sendMessage(message, channel)
    }
}
