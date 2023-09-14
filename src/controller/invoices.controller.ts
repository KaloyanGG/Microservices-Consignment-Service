import { MailService } from './../service/mail.service';
import { Request, Response } from "express";
import { OrderValidator } from "../utils/order.validator";
import InvoicesService from "../service/invoices.service";
import config from "../config/config";
import rabbitMQService from "../service/rabbitMQ.service";
import { Invoice } from "../interfaces/interfaces";

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


        const invoice = await InvoicesService.insertInvoice(order, res);
        // fake invoice:
        // const invoice: Invoice = {
        //     id: 1,
        //     invoice_number: '123',
        //     buyer_name: 'test',
        //     invoice_date: '2021-10-10',
        //     item_amount: 80,
        //     invoice_amount: 96,
        //     issued: false,
        // }

        if (!invoice) {
            return;
        }

        console.log(' 📝 Invoice added.');
        console.log(invoice);

        // await InvoicesService.sendUpdateAccountsMessage(invoice.invoice_amount, invoice.buyer_name);

        await MailService.sendMailMessage(invoice.invoice_amount, invoice.buyer_name, invoice.email);


        //TODO: Send the message with the buyer name and money, then implement in the acc, service in the rabbitMQ service

        res.send('Successfully added invoice');
    } catch (e: any) {
        console.log(e);

        if (e.errno === 1452) {
            res.status(404).send({ error: ' 😢 Buyer not found' });
            return;
        }

        res.status(500).send({ error: e.message });
    }

}

//TODO: Fix the db in the kyma, then start maybe the messaging system