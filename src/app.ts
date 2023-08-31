import express, { Request, Response, Express } from 'express';
import dotenv from 'dotenv';
import connection from './database/connection';
import config from './config/config';
import registerRoutes from './routes/routes';

const app: Express = express();

dotenv.config();
const [host, port] = [config.host, config.port];

app.use(express.json()); // Add this middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Add this middleware to parse URL-encoded bodies

app.listen(port, async () => {
    try {
        registerRoutes(app);
        await connection.checkConnection();
        console.log(` ⚡️ Consignment service is running at http://${host}:${port}`);
    } catch (e: any) {
        console.log(` ❌ Error: ${e.message}`);
        throw e;
        process.exit(1);
    }
});


