import { Response } from "express";
import db_conn from "../database/connection";
import { Invoice, Item, ItemFromDB, Order } from "../interfaces/interfaces";

export default class InvoicesService {

    static async getAllInvoices(): Promise<Invoice[]> {
        const [rows] = await db_conn.getConnection().promise()
            .query('SELECT * FROM invoice_header');
        return rows as any;
    }

    static async insertEmptyInvoice(): Promise<number> {
        const [result] = await db_conn.getConnection().promise()
            .query('INSERT INTO invoice_header VALUES()');
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
            .query('SELECT * FROM invoice_header WHERE id = ?', [invoiceId]);

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

    static async insertInvoice(order: Order, res: Response) {

        const invoiceId = await this.insertEmptyInvoice();

        const invoiceFromDB = await this.getInvoiceById(invoiceId);


        for (const item of order.items) {

            const itemFromDB = await this.itemFromDB(item);

            //check if item exists
            if (!itemFromDB) {
                res.status(404).send({ error: ' 😢 Item not found' });
                return;
            }

            // insert into invoice_line_item
            await this.insertInvoiceLineItem(invoiceFromDB.invoice_number, item);

            // update invoice_header
            await this.updateInvoiceHeader(item.quantity, itemFromDB.price, invoiceFromDB.id);

        }

    }



}