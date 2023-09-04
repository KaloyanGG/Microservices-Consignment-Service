import { Order } from "../interfaces/interfaces";
import { OrderSchema } from "../schemas/schemas";

export class OrderValidator {

    private constructor() { }

    public static isOrder(input: any): input is Order {
        try {
            OrderSchema.parse(input);
            return true;
        } catch (error) {
            return false;
        }
    }

}