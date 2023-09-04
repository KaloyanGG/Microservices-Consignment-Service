import { Express, Request, Response } from "express";
import { addInvoice, getAllInvoices, getInvoiceByInvoiceNumber } from "../controller/invoices.controller";
// import { addOrganization, deleteOrganizationById, getAllOrganizations, getOrganizationById } from "../controller/organization.controller";

export default function registerRoutes(app: Express) {

    app.get('/', async (req: Request, res: Response) => {
        res.send('OK');
    });

    app.get('/health', (req: Request, res: Response) => {
        res.send('Consignment service is healthy!');
        console.log(' 👨‍⚕️ Health Checked!');
    });

    app.get('/invoices', getAllInvoices);

    app.get('/invoices/:id', getInvoiceByInvoiceNumber);

    app.post('/invoices', addInvoice);




}