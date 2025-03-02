
import { Kafka, Message } from 'kafkajs'
import { envs } from '../../../../config/env'
import { Logger } from '../../../../core/logger/logger' 

export type KafkaTopic = 'createtask' | 'deletetask' | 'updatetask'

export interface IKafkaService {
    sendMessage(text: string, topic: KafkaTopic): Promise<any>
}

export class KafkaService implements IKafkaService {
    public static logger: any = new Logger()
    private static kafka = new Kafka({
        clientId: envs.kafkaClientId,
        brokers: envs.kafkaBrokers,
    })

    private static producer = this.kafka.producer({allowAutoTopicCreation: true})

    constructor() {
    }

    async sendMessage(text: string, topic: KafkaTopic): Promise<any> {
        console.log("==>> Отправляю сообщение: " + text)
        console.log("envs.kafkaBrokers = ", envs.kafkaBrokers)
        try{
            await KafkaService.producer.connect().catch((err) => {
                console.log(err)
            })

            let mess: Message = { value: text }
            await KafkaService.producer.send({
                topic: topic,
                messages: [mess],
              })

        }catch(err){
            KafkaService.logger.error((err as Error).message)
        }
        return new Promise(()=> {})
    }
}