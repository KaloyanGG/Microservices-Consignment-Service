import { z } from 'zod';


export const ItemSchema = z.object({
    itemId: z.number(),
    quantity: z.number(),
});

export const OrderSchema = z.object({
    items: z.array(ItemSchema),
});