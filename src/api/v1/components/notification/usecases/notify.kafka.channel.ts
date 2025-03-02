
import { IUseCase } from "../../../../../core/domain/types/i.usecase"
import { IKafkaService, KafkaTopic } from "../../../infrastructure/kafka/kafka.service"

export class NotifyKafkaChannel implements IUseCase<Promise<void>> {
    private kafkaService: IKafkaService

    constructor(kafkaService: IKafkaService) {
        this.kafkaService = kafkaService
    }

    async execute(topic: KafkaTopic, message: string): Promise<void> {
        await this.kafkaService.sendMessage(message, topic)
    }
}
