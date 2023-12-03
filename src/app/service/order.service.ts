import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";
import {addMonths, subDays} from "date-fns";

@Injectable()
export class OrderService {
    order = {
        serviceId: 1,
        roomId: 0,
        trainer_id: 0,
        order_date: '',
        customer_id: -1,
        order_type: 'token',
        order_total: 0,
        discount: 0,
        order_status: 'confirmed',
        payment_status: 'pending',
        payment_amount: 0,
        repeatable: true,
        recurring: {
            cycle: 'monthly',
            package_id: 0,
            quantity: 12,
            noOfSession: 2,  // min 2 session = 1 hour.
            start_date: new Date(),
            end_date: this.calMonthEndDate(new Date()),
            free: {
                quantity: 4,
                noOfSession: 4  // see above
            }
        },
        paymentInformation: {
            method: '',
            price: 0,
            commission: 0
        }
    };

    constructor(public api: ApiService) {
    }

    submitOrder(data, callback) {
        // submit to server.
        this.api.post('api/orders', data).subscribe( res => {
            callback(res);
        });
    }

    calMonthEndDate(date) {
        return subDays(addMonths(date, 1), 1);
    }
}
