import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env

export default {
    host: process.env.HOST || 'localhost',
    port: process.env.PORT || 8000,
    db: {
        HOST: process.env.DB_HOST || 'localhost',
        USER: process.env.DB_USER || 'koko',
        PASSWORD: process.env.DB_PASSWORD || '',
        DATABASE: process.env.DB_DATABASE || 'sakilaa',
        PORT: process.env.DB_PORT as any || 3306,
    },
    rabbitMQ: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        queue: process.env.RABBITMQ_QUEUE || 'hello',
        exchange: process.env.RABBITMQ_EXCHANGE || 'test-exchange',
        routingKey: process.env.RABBITMQ_ROUTING_KEY_ACCOUNTS || 'test_routing_key_one',
        routingKeyMail: process.env.RABBITMQ_ROUTING_KEY_MAIL || 'test_routing_key_one_mail',
    },
};
