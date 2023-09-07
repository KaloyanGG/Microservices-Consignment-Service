import express, { Request, Response, Express } from 'express';
import dotenv from 'dotenv';
import connection from './database/connection';
import config from './config/config';
import registerRoutes from './routes/routes';
import rabbitMQService from './service/rabbitMQ.service';

const app: Express = express();

process.on('exit', () => {
    connection.endConnection();
    rabbitMQService.closeConnection();
    console.log(' ✋ Bye Bye!');
})
process.on('SIGINT', () => {
    process.exit(0);
});

dotenv.config();
const [host, port] = [config.host, config.port];

app.use(express.json()); // Add this middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Add this middleware to parse URL-encoded bodies



app.listen(port, async () => {
    try {
        registerRoutes(app);
        await connection.checkConnection();
        console.log(' 📚 Database connected!');
        await rabbitMQService.init();
        console.log(' 🐇 RabbitMQ connected!');
        console.log(` ⚡️ Consignment service is running at http://${host}:${port}`);

    } catch (e: any) {
        console.log(` ❌ Error: ${e.message}`);
        throw e;

    }
});



