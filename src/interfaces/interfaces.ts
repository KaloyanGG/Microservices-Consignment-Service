export interface Item {
    itemId: number,
    quantity: number,
}

export interface ItemFromDB {
    id: string,
    name: string,
    price: number,
}

export interface Order {
    buyerName: string,
    items: Item[],
}

export interface Invoice {
    id: number,
    invoice_number: string,
    // invoice_date: string,
    item_amount: number,
    invoice_amount: number,
    buyer_name: string,
    email: string,
}

