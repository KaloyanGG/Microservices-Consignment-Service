import { Request, Response } from "express";
import db_conn from "../database/connection";
import { OrderValidator } from "../utils/order.validator";
import { error } from "console";
import { Invoice } from "../interfaces/interfaces";

export async function getAllInvoices(req: Request, res: Response) {

    const [rows] = await db_conn.getConnection().promise()
        .query('SELECT * FROM invoice_header');

    res.send(rows);

}

export async function getInvoiceByInvoiceNumber(req: Request, res: Response) {
    const id = req.params.id;

    const [rows] = await db_conn.getConnection().promise()
        .query('SELECT * FROM invoice_header WHERE invoice_number = ?', [id]);

    if ((rows as any).length === 0) {
        res.status(404).send({ error: ' 😢 Not found' });
        return;
    }

    res.send((rows as any)[0]);
}

export async function addInvoice(req: Request, res: Response) {

    const invoice = req.body;

    if (!OrderValidator.isOrder(invoice)) {
        res.status(400).send({ error: ' 😢 Not a valid invoice' });
        return;
    }

    //example order:
    /*
    {
        "items": [
            {
                "itemId": "1",
                "quantity": 1
            },
            {
                "itemId": "2",
                "quantity": 2
            }
        ]
    }
    */


    //First add invoice with default values and then the line_items
    try {
        const [result] = await db_conn.getConnection().promise()
            .query('INSERT INTO invoice_header VALUES()');

        const invoiceId = (result as any).insertId;

        //get invoice with that id
        const [rows] = await db_conn.getConnection().promise()
            .query('SELECT * FROM invoice_header WHERE id = ?', [invoiceId]);

        const invoiceFromDB: Invoice = (rows as any)[0];

        for (const item of invoice.items) {

            //check if item exists
            const [items] = await db_conn.getConnection().promise()
                .query('SELECT * FROM item WHERE id = ?', [item.itemId]);
            if ((items as any).length === 0) {

                res.status(404).send({ error: ' 😢 Item not found' });
                return;
            }

            // insert into invoice_line_item
            const [result] = await db_conn.getConnection().promise()
                .query('INSERT INTO invoice_line_item (invoice_number, item_id, quantity) VALUES(?, ?, ?)',
                    [invoiceFromDB.invoice_number, item.itemId, item.quantity]);

            // update invoice_header
            const item_amount = item.quantity * (items as any)[0].price;
            await db_conn.getConnection().promise()
                .query('UPDATE invoice_header SET item_amount = item_amount + ?, invoice_amount = invoice_amount + ? WHERE id = ?',
                    [item_amount, item_amount * 1.2, invoiceFromDB.id]);


        }
        // 80
        console.log(' 📝 Invoice added.');
        res.send('Successfully added invoice');
    } catch (e: any) {
        res.status(500).send({ error: e.message });
    }

}

//TODO: Fix the db in the kyma, then start maybe the messaging system