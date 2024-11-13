
import { KafkaChannel } from '../domain/kafka.channel'

export interface IKafkaService {
    sendMessage(text: string, channel: KafkaChannel): Promise<any>
}

export class KafkaService implements IKafkaService {
    constructor() {

    }

    sendMessage(text: string, channel: KafkaChannel): Promise<any> {
        console.log("==>> Отправляю сообщение: " + text)
        return new Promise(()=> {})
    }

}