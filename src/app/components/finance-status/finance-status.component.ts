import {Component, OnInit} from '@angular/core';
import {addDays, subDays} from "date-fns";
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {LazyLoadEvent} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-finance-status',
    templateUrl: './finance-status.component.html',
    styleUrls: ['./finance-status.component.scss']
})
export class FinanceStatusComponent implements OnInit {
    loading = true;

    bookings: any;

    // search fields
    rangeDates: Date[];
    searchPaymentStatus = '';
    paymentStatusList = [];
    searchCustomer = 0;
    customers = [];

    //form
    formDialog = false;
    payment: any;

    constructor(private api: ApiService, private translateService: TranslateService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.rangeDates = [subDays(new Date(), 7), addDays(new Date(), 7)];
        // this.loadData();
        this.translateService.get(['pending payment', 'paid payment', 'partially payment']).subscribe( res => {
            this.paymentStatusList = [
                {name: res['pending payment'], code: 'pending', color: '#c63737'},
                {name: res['paid payment'], code: 'paid', color: '#8a5340'},
                {name: res['partially payment'], code: 'partially', color: '#256029'},
            ];
        });
    }

    loadData(event: LazyLoadEvent) {
console.log('finance loaddata event===', event);
        if (this.rangeDates.length == 2 && this.rangeDates[1]) {
            this.api.get('api/finance', {
                page: (1+event.first),
                size: event.rows,
                // passing from_date 'Unsupported operand types' error.
                from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
                to_date: this.lemonade.formatPostDate(this.rangeDates[1])
            }).subscribe(res => {
                this.bookings = res.data;
                this.loading = false;
            });
        }
    }

    edit(payment) {
        this.payment = {...payment};
        this.formDialog = true;
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        this.api.update('api/payment', {
            "id": this.payment.id,
            "amount": this.payment.amount,
            "status": this.payment.status
        }).subscribe( res => {
            console.log('save res=', res);
            if (res.success == true) {
                this.hideDialog();
            }
        });
    }
}
