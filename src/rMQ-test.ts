
import amqp from 'amqplib';
import config from './config/config';

const url = config.rabbitMQ.url;

async function receiveFromRabbitMQ(queue: string = 'hello') {
    try {

        const connection = await amqp.connect(url);
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, {
            durable: false,
        });

        console.log(` [*] Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, (msg: amqp.ConsumeMessage | null) => {

            if (msg) {
                console.log(` [x] Received ${msg.content.toString()}`);
            } else {
                console.log(` [x] Received nothing`);
            }

        });


    } catch (e: any) {
        console.log(e.message);
    }
}

receiveFromRabbitMQ();