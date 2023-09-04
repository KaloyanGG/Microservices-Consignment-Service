export interface Item {
    itemId: string,
    quantity: number,
}

export interface Order {
    items: Item[],
}

export interface Invoice {
    id: number,
    invoice_number: string,
    invoice_date: string,
    item_amount: number,
    invoice_amount: number,
    issued: boolean,
}
