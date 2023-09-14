import { Response } from "express";
import db_conn from "../database/connection";
import { Invoice, Item, ItemFromDB, Order } from "../interfaces/interfaces";
import rabbitMQService from "./rabbitMQ.service";
import config from "../config/config";

export default class InvoicesService {

    static async getAllInvoices(): Promise<Invoice[]> {
        const [rows] = await db_conn.getConnection().promise()
            .query('SELECT * FROM invoice_header');
        return rows as any;
    }

    // static async buyerExists(buyerName: string): Promise<boolean> {

    //     const [buyers] = await db_conn.getConnection().promise()
    //         .query('SELECT * FROM buyer WHERE name = ?', [buyerName]);

    //     return (buyers as any).length > 0;

    // }

    static async insertEmptyInvoice(buyerName: string, res: Response): Promise<number> {

        const [result] = await db_conn.getConnection().promise()
            .query('INSERT INTO invoice_header (buyer_name) VALUES(?)', [buyerName]);
        const id = (result as any).insertId;

        return id;
    }

    static async getInvoiceByInvoiceNumber(invoiceNumber: string): Promise<Invoice | null> {
        const [rows] = await db_conn.getConnection().promise()
            .query('SELECT * FROM invoice_header WHERE invoice_number = ?', [invoiceNumber]);

        if ((rows as any).length > 0) {
            return (rows as any)[0];
        }

        return null;
    }

    static async getInvoiceById(invoiceId: number): Promise<Invoice> {

        const [rows] = await db_conn.getConnection().promise()
            .query(`SELECT i.id, i.invoice_number, i.item_amount, i.invoice_amount, o.name as buyer_name, o.email FROM invoice_header i
            JOIN organization o
            ON i.buyer_name=o.name
            WHERE id = ?`, [invoiceId]);

        const invoice: Invoice = (rows as any)[0];
        return invoice;

    }

    static async itemFromDB(item: Item): Promise<ItemFromDB | null> {
        const [items] = await db_conn.getConnection().promise()
            .query('SELECT * FROM item WHERE id = ?', [item.itemId]);

        if ((items as any).length > 0) {
            return (items as any)[0];
        }
        return null;
    }

    static async insertInvoiceLineItem(invoiceNumber: string, item: Item) {
        await db_conn.getConnection().promise()
            .query('INSERT INTO invoice_line_item (invoice_number, item_id, quantity) VALUES(?, ?, ?)',
                [invoiceNumber, item.itemId, item.quantity]);
    }

    static async updateInvoiceHeader(itemQuantity: number, itemPrice: number, invoiceId: number) {
        const itemAmount = itemQuantity * itemPrice;
        await db_conn.getConnection().promise()
            .query('UPDATE invoice_header SET item_amount = item_amount + ?, invoice_amount = invoice_amount + ? WHERE id = ?',
                [itemAmount, itemAmount * 1.2, invoiceId]);
    }

    static async insertInvoice(order: Order, res: Response): Promise<Invoice | null> {

        const invoiceId = await this.insertEmptyInvoice(order.buyerName, res);

        const invoiceFromDB: Invoice = await this.getInvoiceById(invoiceId);


        for (const item of order.items) {

            const itemFromDB = await this.itemFromDB(item);

            //check if item exists
            if (!itemFromDB) {
                res.status(404).send({ error: ' 😢 Item not found' });
                return null;
            }

            // insert into invoice_line_item
            await this.insertInvoiceLineItem(invoiceFromDB.invoice_number, item);

            // update invoice_header
            await this.updateInvoiceHeader(item.quantity, itemFromDB.price, invoiceFromDB.id);

        }

        return await this.getInvoiceById(invoiceId);

    }


    static async sendUpdateAccountsMessage(amount: number, name: string) {
        const rabbitMQConfig = config.rabbitMQ;

        const channel = rabbitMQService.getChannel()!;
        channel.assertExchange(rabbitMQConfig.exchange, 'direct', { durable: false });
        const msg = Buffer.from(JSON.stringify({ amount, name }));

        channel.publish(rabbitMQConfig.exchange, rabbitMQConfig.routingKey, msg);

        console.log(' 📩 [x] Sent to route "%s": %s', rabbitMQConfig.routingKey, { amount, name });
    }



}