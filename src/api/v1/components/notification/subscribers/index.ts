
import { AfterTaskCreated } from "./after.task.created"
import { NotifyKafkaChannel } from "../usecases/notify.kafka.channel"
import { KafkaService } from "../services/kafka.service"

// Subscribers
new AfterTaskCreated(new NotifyKafkaChannel(new KafkaService()))
