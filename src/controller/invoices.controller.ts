import { Request, Response } from "express";
import db_conn from "../database/connection";
import { OrderValidator } from "../utils/order.validator";
import { error } from "console";
import { Invoice, Item } from "../interfaces/interfaces";
import InvoicesService from "../service/invoices.service";
import rabbitMQService from "../service/rabbitMQ.service";

export async function getAllInvoices(req: Request, res: Response) {

    const invoices = await InvoicesService.getAllInvoices();

    res.send(invoices);

}

export async function getInvoiceByInvoiceNumber(req: Request, res: Response) {
    const invoice_number = req.params.inv;

    const invoice = await InvoicesService.getInvoiceByInvoiceNumber(invoice_number!);

    if (!invoice) {
        res.status(404).send({ error: ' 😢 Not found' });
        return;
    }

    res.send(invoice);
}

export async function addInvoice(req: Request, res: Response) {

    const order = req.body;

    if (!OrderValidator.isOrder(order)) {
        res.status(400).send({ error: ' 😢 Not a valid invoice' });
        return;
    }

    //First add invoice with default values and then the line_items
    try {


        await InvoicesService.insertInvoice(order, res);
        console.log(' 📝 Invoice added.');

        // await UpdateAccountsAndSendMail();

        // async function UpdateAccountsAndSendMail() {
        /*
            const channel = rabbitMQService.getChannel()!;
            channel.assertExchange('test_exchange', 'direct', { durable: false });
            const msg = Buffer.from(JSON.stringify(order))
            channel.publish('test_exchange', 'test_routing_key', msg);
            console.log(' 📩 [x] Sent %s: "%s"', 'test_severity', msg);
        */
        // }


        res.send('Successfully added invoice');
    } catch (e: any) {
        res.status(500).send({ error: e.message });
    }

}

//TODO: Fix the db in the kyma, then start maybe the messaging system