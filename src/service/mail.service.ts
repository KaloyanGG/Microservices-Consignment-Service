import config from "../config/config";
import rabbitMQService from "./rabbitMQ.service";

export class MailService {

    private static instance: MailService;

    private constructor() { }

    static getInstance() {
        if (!MailService.instance) {
            MailService.instance = new MailService();
        }
        return MailService.instance;
    }

    static async sendMailMessage(amount: number, name: string, email: string) {
        const rabbitMQConfig = config.rabbitMQ;

        try {
            const channel = await rabbitMQService.getChannel();

            channel?.assertExchange(rabbitMQConfig.exchange, 'direct', { durable: false });
            const msg = Buffer.from(JSON.stringify({ amount, name, email }));

            channel?.publish(rabbitMQConfig.exchange, rabbitMQConfig.routingKeyMail, msg);

            console.log(' 📨 Message sent to RabbitMQ');
        } catch (error) {
            console.error(' 📨 Error sending message to RabbitMQ: ', error);
            throw error;
        }

    }

}


export default MailService.getInstance();
