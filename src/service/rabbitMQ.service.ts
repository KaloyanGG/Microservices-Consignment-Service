import * as amqp from "amqplib";
import config from "../config/config";

export class RabbitMQService {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    private static instance: RabbitMQService;

    private constructor() { }
    static getInstance() {
        if (!RabbitMQService.instance) {
            RabbitMQService.instance = new RabbitMQService();
        }
        return RabbitMQService.instance;
    }

    async init() {
        try {
            this.connection = await amqp.connect(config.rabbitMQ.url);
            this.channel = await this.connection.createChannel();
        } catch (error) {
            console.error("Error connecting to RabbitMQ: ", error);
            throw error;
        }
    }
    getChannel() {
        return RabbitMQService.instance.channel;
    }
    getConnection() {
        return RabbitMQService.instance.connection;
    }
    closeConnection() {
        RabbitMQService.instance.connection?.close();
    }
}

export default RabbitMQService.getInstance();

