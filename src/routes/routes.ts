import { Express, Request, Response } from "express";
import { addInvoice, getAllInvoices, getInvoiceByInvoiceNumber } from "../controller/invoices.controller";
import rabbitMQService from "../service/rabbitMQ.service";
import config from "../config/config";
// import { addOrganization, deleteOrganizationById, getAllOrganizations, getOrganizationById } from "../controller/organization.controller";

export default function registerRoutes(app: Express) {

    app.get('/test-exchange-route-test_routing_key_one', (req: Request, res: Response) => {
        const channel = rabbitMQService.getChannel()!;
        channel.assertExchange('test_exchange', 'direct', { durable: false });
        const msg = Buffer.from(JSON.stringify({ hallo: 'ONE-test-exchange-route-direct' }));
        channel.publish('test-exchange', 'test_routing_key_one', msg);
        console.log(' 📩 [x] Sent %s: "%s"', 'test_severity', msg);
        res.send('OK');
    })

    app.get('/test-exchange-route-test_routing_key_two', (req: Request, res: Response) => {
        const channel = rabbitMQService.getChannel()!;
        channel.assertExchange('test_exchange', 'direct', { durable: false });
        const msg = Buffer.from(JSON.stringify({ hallo: 'TWO-test-exchange-route-direct' }));
        channel.publish('test-exchange', 'test_routing_key_two', msg);
        console.log(' 📩 [x] Sent %s: "%s"', 'test_severity', msg);
        res.send('OK');
    })

    app.post('/test-messaging', (req: Request, res: Response) => {

        const rabbitMQConfig = config.rabbitMQ;

        const channel = rabbitMQService.getChannel()!;
        channel.assertExchange(rabbitMQConfig.exchange, 'direct', { durable: false });
        const msg = Buffer.from(JSON.stringify(req.body));
        channel.publish(rabbitMQConfig.exchange, rabbitMQConfig.routingKey, msg);
        console.log(' 📩 [x] Sent to route "%s": "%s"', rabbitMQConfig.routingKey, req.body);

        res.send('OK');

    });


    app.get('/', async (req: Request, res: Response) => {
        res.send('OK');
    });

    app.get('/health', (req: Request, res: Response) => {
        res.send('Consignment service is healthy!');
        console.log(' 👨‍⚕️ Health Checked!');
    });

    app.get('/invoices', getAllInvoices);

    app.get('/invoices/:inv', getInvoiceByInvoiceNumber);

    app.post('/invoices', addInvoice);




}