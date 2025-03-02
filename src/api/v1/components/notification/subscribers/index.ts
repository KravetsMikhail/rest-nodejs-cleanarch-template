
import { AfterTaskCreated } from "./after.task.created"
import { NotifyKafkaChannel } from "../usecases/notify.kafka.channel"
import { KafkaService } from "../../../infrastructure/kafka/kafka.service"
import { AfterTaskDeleted } from "./after.task.deleted"
import { AfterTaskUpdated } from "./after.task.updated"

// Subscribers
new AfterTaskCreated(new NotifyKafkaChannel(new KafkaService()))
new AfterTaskDeleted(new NotifyKafkaChannel(new KafkaService()))
new AfterTaskUpdated(new NotifyKafkaChannel(new KafkaService()))
