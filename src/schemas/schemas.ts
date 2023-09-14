import { z } from 'zod';


export const ItemSchema = z.object({
    itemId: z.number(),
    quantity: z.number(),
});

export const OrderSchema = z.object({
    buyerName: z.string(),
    items: z.array(ItemSchema),
});