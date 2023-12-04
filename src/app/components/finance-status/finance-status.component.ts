import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {addDays, subDays} from "date-fns";
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {LazyLoadEvent, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute} from "@angular/router";
import {OrderService} from "../../service/order.service";

@Component({
    selector: 'app-finance-status',
    providers: [MessageService],
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
    editable = false;

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

    orderFormDialog = false;
    //form
    customer: any;
    submittingModal: boolean;
    submitted = false;
    formDialog = false;
    formHeader = 'Create Form';
    minDate: Date;
    maxDate: Date;
    order: any;
    services = [];
    sessions = [];
    packages: any[];
    selectedPackage: any;
    editingPayment = false;
    payment_statuses = [];
    payment_methods = [];
    new_payment: any;

    constructor(private api: ApiService, public appointmentService: AppointmentService, private orderService: OrderService, private translateService: TranslateService, private messageService: MessageService, public lemonade: Lemonade, private route: ActivatedRoute) {
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
                this.editable = res.showCustomer;
                this.supportPaymentGateway = res.paymentGateway;
                this.loading = false;
                this.rows = res.per_page;
                this.totalRecords = res.total;
            });
        }
    }

    displayOrderDetail(detail) {
        if (detail) {
            if (detail.order_description) {
                const description = JSON.parse(detail.order_description);
                if (detail.order_type == 'token') {
                    let str = 'Monthly ' + description.quantity + (description.free ? ' + ' + description.free.quantity : '');
                    str += '\n' + this.lemonade.formatDate(description.start_date, true) + ' - ' + this.lemonade.formatDate(description.end_date, true);
                    return str;
                }
                return this.lemonade.formatDate(description.start_time, true) + ' ' + this.lemonade.formatDateTime(description.start_time) + ' - ' + this.lemonade.formatDateTime(description.end_time);
            }
            return '';
        }
        return '';
    }

    openNew() {
        this.formHeader = "Create Form";
        this.submitted = false;
        this.orderFormDialog = true;
        const today = new Date();
        this.minDate = subDays(today, 14);
        this.maxDate = addDays(today, 60);
        this.appointmentService.getActivePackages({
            package_type: 'monthly'
        }).subscribe(res => {
            this.packages = res.data;
        });
        this.appointmentService.getServices().subscribe(res => {
            this.services = res.data;
            this.order.serviceId = this.services[0].id;
            this.loadSessions(null);
        });
        // make a new appointment information if it is empty.
        this.selectedPackage = null;
        // use JSON.parse(JSON.stringify()) to create a brand new object.
        this.order = this.orderService.order;
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

    loadSessions(e) {
        if (this.services.length > 0) {
            let service = this.services.find(el => el.id == this.order.serviceId);
            this.sessions = service.sessions;
        } else {
            this.sessions = [];
        }
    }

    loadPackage() {
        const pkg = this.selectedPackage;
        if (pkg && this.order.recurring.package_id != pkg.id) {
            let pkgStartDate = null;
            if (pkg.start_date) {
                // use package start date as min, in-case for back date.
                this.minDate = new Date(pkg.start_date);
            } else {
                // default minDate was defined above.
            }
            const recurring = JSON.parse(pkg.recurring);
console.log('recurring===', recurring);
            this.order.order_total = pkg.price;
            this.order.recurring = recurring;
            this.order.recurring.price = pkg.price;
            this.order.recurring.start_date = new Date();
            this.calEndDate();
            this.order.recurring.package_id = pkg.id;
        }
    }

    saveOrder() {
        const me = this;
        this.submitted = true;
        const order = this.order;
        if (!me.customer)
            return;
        if (order.serviceId <= 0)
            return;
        if (order.noOfSession <= 0)
            return;
        if (!order.recurring.start_date)
            return;
        if (!order.order_total)
            return;
        if (order.recurring.quantity <= 0)
            return;
        me.order.customer_id = me.customer.id;
        this.submittingModal = true;   // show submitting modal after validation.

        this.orderService.submitOrder(order, function(res) {
            if (res.success == true) {
                me.lemonade.ok(me.messageService);
                me.loadData(null);
                me.orderFormDialog = false;
                // clean up
                me.order = null;
                me.selectedPackage = undefined;
                me.printInvoice(res.order_id, 'invoice');
            } else {
                // error.
                this.lemonade.error(this.messageService, res);
            }
            me.submittingModal = false;   // hide modal.
        });
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

    copyOrderAmount() {
        this.order.payment_amount = this.order.order_total;
        this.order.payment_status = 'paid';
    }

    calEndDate() {
        this.order.recurring.end_date = this.orderService.calMonthEndDate(this.order.recurring.start_date);
    }
}
