import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {addDays, subDays} from "date-fns";
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {LazyLoadEvent} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-finance-status',
    templateUrl: './finance-status.component.html',
    styleUrls: ['./finance-status.component.scss']
})
export class FinanceStatusComponent implements OnInit {
    loading = true;
    //paginator
    rows = 0;
    totalRecords = 0;

    bookings: any;
    showCustomer = false;

    // search fields
    rangeDates: Date[];
    searchPaymentStatus = '';
    paymentStatusList = [];
    searchCustomer: any;
    supportPaymentGateway = false;
    customers = [];

    //print invoice
    @ViewChild('iframe') iframe: ElementRef;
    printDialog = false;

    //form
    formDialog = false;
    order: any;
    editingPayment = false;
    payment_statuses = [];
    payment_methods = [];
    new_payment: any;

    constructor(private api: ApiService, public appointmentService: AppointmentService, private translateService: TranslateService, public lemonade: Lemonade, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.rangeDates = [subDays(new Date(), 7), addDays(new Date(), 7)];
        // this.loadData();
        this.translateService.get(['All', 'pending payment', 'paid payment', 'partially payment']).subscribe( res => {
            this.paymentStatusList = [
                {name: res['pending payment'], code: 'pending', color: '#c63737'},
                {name: res['paid payment'], code: 'paid', color: '#8a5340'},
                {name: res['partially payment'], code: 'partially', color: '#256029'},
            ];
        });
        // support paymentStatus params.
        if (this.route.snapshot.paramMap.get('paymentStatus')) {
            this.searchPaymentStatus = this.route.snapshot.paramMap.get('paymentStatus');
            this.rangeDates = [subDays(new Date(), 365), addDays(new Date(), 7)];
        }
        this.payment_statuses = this.lemonade.paymentStatuses;
        // addition payment methods.
        const methods = [{
            code: 'cash',
            name: 'Cash'
        }];
        this.payment_methods = methods.concat(this.lemonade.paymentMethods);
    }

    searchCustomers(e) {
        this.api.get('api/users', {
            name: e.query
        }).subscribe(res => {
            this.customers = res.data;
        });
    }

    loadData(event: LazyLoadEvent) {
        this.loading = true;
        let page = event ? (event.first/event.rows) : 0;
        let params = {
            page: (1+page),
            // size: event.rows,   // if we want to let user define no. of record per page. but server size neds to capture 'size' params too.
            // passing from_date 'Unsupported operand types' error.
            from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
            to_date: this.lemonade.formatPostDate(this.rangeDates[1]),
            payment_status: this.searchPaymentStatus ? this.searchPaymentStatus : ''
        };
        if (this.showCustomer && this.searchCustomer && this.searchCustomer.id) {
            params = {...params, ...{customer_id: this.searchCustomer.id}};
        }
// console.log('finance loaddata event===', event);
        if (this.rangeDates.length == 2 && this.rangeDates[1]) {
            this.api.get('api/finance', params).subscribe(res => {
                this.bookings = res.data;
                this.showCustomer = res.showCustomer;
                this.supportPaymentGateway = res.paymentGateway;
                this.loading = false;
                this.rows = res.per_page;
                this.totalRecords = res.total;
            });
        }
    }

    displayOrderDetail(detail) {
        if (detail && detail.order_description) {
            const description = JSON.parse(detail.order_description);
            return this.lemonade.formatDate(description.start_time, true) + ' ' + this.lemonade.formatDateTime(description.start_time) + ' - ' + this.lemonade.formatDateTime(description.end_time);
        }
        return '';
    }

    edit(order) {
        this.order = {...order};
        this.new_payment = {
            amount: order.paid_amount,
            // status: order.payment_status,
            gateway: order.payment.gateway
        };
        this.formDialog = true;
    }

    payNow(order) {
        window.location.href = this.appointmentService.makePayment(order.order_number);
    }

    paymentReminder(payment) {
        payment.reminder = 9;
        // need confirm send?
        this.api.update('api/payment-reminder/' + payment.id, {
        }).subscribe( res => {
            console.log('paymentReminder res=', res);
            if (res.success == true) {
                payment.reminder = 1;
            } else {
                delete payment.reminder;   // failed
            }
        });
    }

    hideDialog() {
        this.formDialog = false;
        this.editingPayment = false;
    }

    save() {
        this.api.update('api/payment/' + this.order.payment.id, this.new_payment).subscribe( res => {
            console.log('save res=', res);
            if (res.success == true) {
                this.hideDialog();
                this.loadData(null);
            }
        });
    }

    printInvoice(order, docType) {
        // window.open(this.api.url + '/api/invoice/' + order.id, '_blank');   // don't work cause token couldn't pass to server.
        // this.router.navigate(['/invoice', order.id]);
        const call = this.appointmentService.printInvoice(order.id, docType);
        if (call) {
            call.subscribe(res => {
                setTimeout(() => {
                    this.lemonade.setIframe(this.iframe, res);
                });
                this.printDialog = true;
            });
        }
    }
}
