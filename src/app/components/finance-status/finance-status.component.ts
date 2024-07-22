import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {addDays, addYears, endOfMonth, isAfter, isBefore, startOfMonth, subDays} from "date-fns";
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {LazyLoadEvent, MessageService, MenuItem} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute} from "@angular/router";
import {OrderService} from "../../service/order.service";
import {TrainerRateListComponent} from "../trainer-rate-list/trainer-rate-list.component";
import {DialogService} from "primeng/dynamicdialog";

@Component({
    selector: 'app-finance-status',
    providers: [DialogService, MessageService],
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
    showTrainer = false;
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

    //Jeffrey added

    pkg: any;
    statuses = [];
    newActions: MenuItem[];
    formGroupEventDialog = false;

    // appointment form
    aptFormDialog = false;
    appointment: any;
    selectedCustomerId = 0;
    rooms = [];
    trainers: any[];
    day_of_weeks = [];
    times: any[] = [];
    lessons: any[] = [];
    holidays: any[];
    minExpiryDate: Date;
    requiredTrainer = false;
    supportPackages = false;
    supportFinance = false;
    paymentGateway: any = '';
    checkInBeforeMinute = 15;
    checkInAfterMinute = 15;
    timeslotSetting: string;
    packageType: string;
    group_trainers: any[];
    group_rooms: any[];
    aptTitle: string;

    //Jeffrey added end
    constructor(private api: ApiService, public appointmentService: AppointmentService, private orderService: OrderService, private translateService: TranslateService, public dialogService: DialogService, private messageService: MessageService, public lemonade: Lemonade, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        const today = new Date();
        this.rangeDates = [startOfMonth(today), endOfMonth(today)];
        // this.loadData();
        this.translateService.get(['All', 'pending payment', 'paid payment', 'partially payment']).subscribe( res => {
            this.paymentStatusList = [
                {name: res['pending payment'], code: 'pending', color: '#c63737'},
                {name: res['paid payment'], code: 'paid', color: '#8a5340'},
                {name: res['partially payment'], code: 'partially', color: '#256029'},
            ];
        });

        this.translateService.get(['Packages', 'Fixed Date Packages', 'Monthly Packages', 'Group Event']).subscribe( msg => {
            this.newActions = [{
                label: msg['Fixed Date Packages'],
                icon: 'pi pi-plus',
                command: () => {
                    this.packageType = 'weekly';
                    this.aptTitle = "Fixed Date Packages";
                    this.openNewAptForm();
                }
                // }, {
                //     separator: true
            },{
                label: msg['Monthly Packages'],
                icon: 'pi pi-plus',
                command: () => {
                    this.packageType = 'monthly';
                    this.aptTitle = "Monthly Packages";
                    this.openNew();
                }
                // }, {
                //     separator: true
            }, {
                label: msg['Group Event'],
                icon: 'pi pi-plus',
                command: () => {
                    this.packageType = 'group_event';
                    this.openNewAptForm();
                }
                // label: 'Tokens', icon: 'pi pi-cog', routerLink: ['/setup']
            }];
        });
        // support paymentStatus params.
        if (this.route.snapshot.paramMap.get('paymentStatus')) {
            this.searchPaymentStatus = this.route.snapshot.paramMap.get('paymentStatus');
            this.rangeDates = [subDays(new Date(), 365), addDays(new Date(), 7)];
        }
        this.statuses = this.lemonade.appointmentStatus;
        this.payment_statuses = this.lemonade.paymentStatuses;
        this.appointmentService.getActivePackages({
           // package_type: 'monthly'
        }).subscribe(res => {
            this.packages = res.data;
        });
        // addition payment methods.
        const methods = [{
            code: 'cash',
            name: 'Cash'
        }, {
            code: 'cheque',
            name: 'Cheque'
        }];
        this.payment_methods = methods.concat(this.lemonade.paymentMethods);

    }

    searchCustomers(e) {
        this.appointmentService.getActiveCustomers(e.query).subscribe( res => {
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
                this.showTrainer = res.showTrainer;
                this.editable = res.showCustomer;
                this.requiredTrainer = res.requiredTrainer;
                this.supportPackages = res.supportPackages;
                this.supportFinance = res.supportFinance;
                this.supportPaymentGateway = res.paymentGateway;
                this.timeslotSetting = res.timeslotSetting;
                this.checkInBeforeMinute = res.checkInBeforeMinute;
                this.checkInAfterMinute = res.checkInAfterMinute;
                if (this.showTrainer) {
                    this.appointmentService.getActiveTrainers().subscribe(res => {
                        this.trainers = res.data;
                    });
                }
                this.loading = false;
                this.rows = res.per_page;
                this.totalRecords = res.total;
            });
        }
    }

    displayOrderDetail(order) {
        const order_recurring = JSON.parse(order.recurring);
        if (order_recurring && order_recurring.cycle == 'monthly') {
            let str = order_recurring.package.name + '\n' + this.lemonade.formatDate(order_recurring.start_date, true) + ' - ' + this.lemonade.formatDate(order_recurring.end_date, true);
            return str;
        } else {
            for (let detail of order.details) {
                return this.displayDetailDescription(detail);
            }
        }
        return '';
    }

    showOrderDetail(detail: any) {
        return (detail.order_type == 'token' || detail.booking_id > 0);
    }

    displayDetailDescription(detail, showMoreDetail = false) {
        if (detail.order_description) {
            let str;
            const description = JSON.parse(detail.order_description);
            if (detail.order_type == 'token' && !description.start_time) {
                str = 'Ordered: ' + description.quantity + ' * ' + this.appointmentService.getHourBySession(description.no_of_session);
                if (description.free) {
                    str += " + Free: " + description.free.quantity + ' * ' + this.appointmentService.getHourBySession(description.free.no_of_session);
                }
                return str;
            }
            str = this.lemonade.formatDate(description.start_time, true) + ' ' + this.lemonade.formatDateTime(description.start_time) + ' - ' + this.lemonade.formatDateTime(description.end_time);
            if (showMoreDetail && detail.booking && detail.booking.appointment) {
                const apt = detail.booking.appointment;
                if (apt.user)
                    str += " / " + apt.user.name;
            }
            return str;
        }
        return '';
    }

    displayDetailTrainer(detail) {
        if (detail.booking && detail.booking.appointment) {
            const apt = detail.booking.appointment;
            if (apt.user)
                return apt.user.name;
        }
        return '';
    }

    displayOrderQty(order: any) {
        const order_recurring = JSON.parse(order.recurring);
        if (order_recurring.cycle == 'monthly') {
            let str = order_recurring.quantity + (order_recurring.free ? ' + ' + order_recurring.free.quantity + ' FREE' : '');
            return str;
        }
        return order.details.length;
    }

    openNew() {
        this.formHeader = "Create Form";
        this.submitted = false;
        this.orderFormDialog = true;
        const today = new Date();
        this.minDate = subDays(today, 60);
        this.maxDate = addDays(today, 60);

        this.appointmentService.getActivePackages({
            package_type: this.packageType
        }).subscribe(res => {
            this.packages = res.data;
            console.log("package data",res.data)
        });

        this.appointmentService.getServices().subscribe(res => {
            this.services = res.data;
            this.order.serviceId = this.services[0].id;
            this.loadSessions(null);
        });
        // make a new appointment information if it is empty.
        // use JSON.parse(JSON.stringify()) to create a brand new object.
        this.order = this.orderService.order;
        this.selectedPackage = null;
        this.customer = null;
        this.order.paid_amount = 0;
    }

    openNewGroupEvent() {
        this.formHeader = "Create Form";
        this.pkg = {
            quantity: 4,
            free_of_charge: false,
            status: this.statuses[0].code,
            total_space: 10,
            recurring: {
                cycle: 'group_event',
                repeat: []
            }
        };
        if (this.services.length > 0) {
            this.pkg.service_id = this.services[0].id;
            this.pkg.noOfSession = this.services[0].sessions[0].code;
        }
        this.submitted = false;
        this.formGroupEventDialog = true;
    }


    editOrder(order) {
        this.formHeader = "Edit Form";
        this.submitted = false;
        this.orderFormDialog = true;
        // use JSON.parse(JSON.stringify()) to create a brand new object.
        const order_recurring = JSON.parse(order.recurring);
        this.order = {...order};

        const today = new Date();
        this.minDate = subDays(today, 60);
        this.maxDate = addDays(today, 60);
        for (let pkg of this.packages) {   // this.package has to be retrieved in ngOnInit, ajax here won't display to combo correctly.
            if (pkg.id == order_recurring.package_id) {
                this.selectedPackage = pkg;
                // make a new appointment information if it is empty.
                break;
            }
        }
        // this.appointmentService.getServices().subscribe(res => {
        //     this.services = res.data;
        //     this.loadSessions(null);
        // });
        this.customer = order.customer;

        this.order.order_date = new Date(order.order_date);
        this.order.start_date = new Date(order_recurring.start_date);
        this.order.end_date = new Date(order_recurring.end_date);
        if (order.payment) {
            const gw = order.payment.gateway;
            if (gw == 'cash' || gw == 'cheque')
                this.order.payment_gateway = gw;
            else this.order.payment_gateway = 'mpay';
        }
        this.order.recurring = order_recurring;
        this.orderFormDialog = true;
    }

    edit(order) {
        const order_recurring = JSON.parse(order.recurring);
        if (order_recurring && order_recurring.cycle == 'monthly') {
            this.editOrder(order);
            return;
        }
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
console.log('loadPackage===', pkg);
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
            this.order.start_date = new Date();
            this.calEndDate();
            this.order.recurring.package_id = pkg.id;
            console.log("cycle===", recurring.cycle);
            if (recurring.cycle == 'monthly') {
                //this.loadSessions(null);
            } else if (recurring.cycle == 'weekly') {
                this.order.order_type = "package"
            } else {

            }
        }
    }

    saveOrder() {
        const me = this;
        this.submitted = true;
        const order = this.order;
        console.log("order obj=",this.order);
        if (!me.customer)
            return;
        if (order.serviceId <= 0)
            return;
        if (order.recurring.no_of_session <= 0)
            return;
        if (!order.start_date)
            return;
        if (!order.order_total)
            return;
        if (order.recurring.quantity <= 0)
            return;
        me.order.customer_id = me.customer.id;
        order.recurring.start_date = this.lemonade.formatPostDate(order.start_date);
        order.recurring.end_date = this.lemonade.formatPostDate(order.end_date);
console.log('this.selectedPackage333===', this.selectedPackage);
        order.recurring.package = {
            id: this.selectedPackage.id,
            name: this.selectedPackage.name,
            description: this.selectedPackage.description
        };
        this.submittingModal = true;   // show submitting modal after validation.

        this.orderService.submitOrder(order, function(res) {
            if (res.success == true) {
                me.lemonade.ok(me.messageService);
                me.loadData(null);
                me.orderFormDialog = false;
                // clean up
                me.order = null;
                me.selectedPackage = undefined;
                me.printInvoice(res.data.id, 'invoice');
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

    printInvoice(orderId, docType) {
        // window.open(this.api.url + '/api/invoice/' + order.id, '_blank');   // don't work cause token couldn't pass to server.
        // this.router.navigate(['/invoice', order.id]);
        const call = this.appointmentService.printInvoice(orderId, docType);
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
        this.order.paid_amount = this.order.order_total;
        this.order.payment_status = 'paid';
    }

    calEndDate() {
        this.order.end_date = this.orderService.calMonthEndDate(this.order.start_date);
    }

    loadBookings(payment: any) {
        if (!payment.bookings) {
            // loading appointments from server.
            this.appointmentService.getBookings({
                from_date: '2000-01-01',
                to_date: this.lemonade.formatPostDate(addYears(new Date(), 1)),
                orderId: payment.id
            }).subscribe(res => {
                payment.bookings = res.data;
            });
        }
    }

    canReschedule(appointment) {
        return (appointment.take_leave_at == null && appointment.checkin == null && isBefore(new Date(), new Date(appointment.start_time)));
    }

    renewOrder(order) {
        this.api.post('api/renew-order', {order_id: order.id}).subscribe(res => {
            if (res.success == false) {
                this.lemonade.error(this.messageService, res);
            } else {   // success
                if (res.data.id) {    // single order
                    this.lemonade.ok(this.messageService, res);
                    const today = new Date(res.data.order_date);
                    this.rangeDates = [startOfMonth(today), endOfMonth(today)];
                    this.loadData(null);
                } else {
                    // multiple renew orders?
                }
            }
        });
    }

    getTransId(payment: any) {
        const resp = JSON.parse(payment.gateway_response);
        return resp.ref;
    }

    getTransAmt(payment: any) {
        const resp = JSON.parse(payment.gateway_response);
        return resp.amt;
    }

    // below moved from appointment-list.ts

    openNewAptForm() {
        this.formHeader = "Create Form";
        this.submitted = false;
        this.aptFormDialog = true;
        this.prepareForAptForm();
        this.appointmentService.getActivePackages({
            package_type: this.packageType
        }).subscribe(res => {
            this.packages = res.data;
        });
        // make a new appointment information if it is empty.
        this.selectedPackage = null;
        this.selectedCustomerId = 0;
        // use JSON.parse(JSON.stringify()) to create a brand new object.
        this.appointment = JSON.parse(JSON.stringify(this.appointmentService.defaultAppointment));
        // this.appointment = {...this.appointmentService.defaultAppointment};
        this.appointment.isPackage = false;
        this.appointment.timeInformation.status = this.statuses[0].code;
        this.appointment.timeInformation.notify_parties = true;
        this.appointment.packageInfo = {
            quantity: 4,
            repeatable: true,   // default to true.
            recurring: [1]   // default to Monday.
        };
    }

    prepareForAptForm() {
        // for form, this wastes memory if user doesn't open the form.
        this.appointmentService.getRooms().subscribe( res => {
            this.rooms = res.data;
        });
        this.appointmentService.getServices().subscribe(res => {
            this.services = res.data;
            this.appointment.timeInformation.serviceId = this.services[0].id;
            this.appointment.timeInformation.noOfSession = this.services[0].sessions[0].code;
            this.loadAptSessions(null);
        });
        this.day_of_weeks = this.lemonade.weeks;
    }

    getWeekNo(id) {
        let week = this.day_of_weeks.find(el => el.id == id);
        return week.name;
    }

    loadAptSessions(e) {
        if (this.services.length > 0) {
            let service = this.services.find(el => el.id == this.appointment.timeInformation.serviceId);
            this.sessions = service.sessions;
        } else {
            this.sessions = [];
        }
    }

    loadAptPackage() {
        const pkg = this.selectedPackage;
        if (pkg && this.appointment.timeInformation.package_id != pkg.id) {
            this.lessons = [];
            this.holidays = undefined;
            let pkgStartDate = null;
            if (pkg.start_date) {
                // use package start date as default.
                pkgStartDate = new Date(pkg.start_date);
                // but if today > package start date, use today as start date.
                if (isAfter(new Date(), pkgStartDate)) {
                    pkgStartDate = new Date();
                }
                // use package start date as min, in-case for back date.
                this.minDate = new Date(pkg.start_date);
            }
            this.appointment.timeInformation = {
                ...this.appointment.timeInformation, ...{
                    serviceId: pkg.service_id,
                    trainerId: pkg.trainer_id,
                    roomId: pkg.room_id,
                    noOfSession: pkg.no_of_session,
                    date: pkgStartDate,
                    time: pkg.start_time ? pkg.start_time : null,
                    status: this.statuses[0].code
                }
            };
            this.appointment.packageInfo = {...pkg};
            const recurring = JSON.parse(pkg.recurring);
            this.appointment.paymentInformation.order_total = pkg.price;
            this.appointment.packageInfo.recurring = JSON.parse(pkg.recurring).repeat;
            this.appointment.isPackage = true;
            this.appointment.timeInformation.package_id = pkg.id;
            if (pkg.start_date) {
                this.loadAptPackageTime();
                this.loadAptLessonDates();
            }
            if (this.packageType == 'group_event') {
                //
                this.group_trainers = this.getChip(this.trainers, JSON.parse(pkg.trainer_id_list));
                this.group_rooms = this.getChip(this.rooms, JSON.parse(pkg.room_id_list));
            }
        }
    }

    getChip(sourceArray: any[], ids: number[]): any[] {
        var vals = [];
        for (var s=0; s<ids.length; s++) {
            const id = ids[s];
            for (var i = 0; i < sourceArray.length; i++) {
                if (sourceArray[i].id == id) {
                    vals.push(sourceArray[i].name);
                    break;
                }
            }
        }
        return vals;
    }

    clearAptPackage() {
        this.appointment.timeInformation.package_id = 0;
        this.selectedPackage = null;
    }

    loadAptPackageTime() {
        // always to package info to load data, especially the packageInfo.start_date because timeInformation.date could be changed manually.
        this.appointmentService.getPackageTimeslot(this.selectedPackage.service_id, this.selectedPackage.no_of_session, new Date(this.selectedPackage.start_date)).subscribe(res => {
            this.times = res.data;
            this.appointment.timeInformation.sessionInterval = res.sessionInterval;
        });
    }

    loadAptTime(e) {
        const customer = this.appointment.customer;
        if (customer && this.selectedCustomerId !== customer.id) {   // fire when change customer.
            if (customer.trainer_rates && customer.trainer_rates && !this.selectedPackage) {
                const settings = customer.trainer_rates.filter(el => el.rate_type == 1);
                if (settings) {
                    this.translateService.get(['Is it a trainer course?', 'Choose trainer', 'Error']).subscribe(res => {
                        const ref = this.dialogService.open(TrainerRateListComponent, {
                            header: res['Choose trainer'],
                            data: {
                                list: settings
                            },
                            width: '70%',
                            contentStyle: {"max-height": "500px", "overflow": "auto"},
                            baseZIndex: 10000
                        });
                        ref.onClose.subscribe((rate) => {
                            if (rate) {
                                this.appointment.timeInformation.useTrainerData = true;
                                this.appointment.timeInformation.trainerId = rate.trainer;
                                this.appointment.timeInformation.dftNoOfSession = this.appointment.timeInformation.noOfSession;  // readonly
                                this.appointment.paymentInformation = {
                                    price: rate.trainer_charge,
                                    commission: rate.trainer_commission,
                                    order_total: rate.trainer_charge,
                                    total_commission: rate.trainer_commission
                                };
                                if (rate.room)
                                    this.appointment.timeInformation.roomId = rate.room;
                            }
                        });
                        // this.confirmationService.confirm({
                        //     message: res['Is it a trainer course?'],
                        //     accept: () => {
                        //         this.appointment.timeInformation.useTrainerData = true;
                        //         this.appointment.timeInformation.trainerId = settings.trainer;
                        //         // commented 20231229 since trainer_rates where no 'no_of_session', use Service's.
                        //         // this.appointment.timeInformation.dftNoOfSession = settings.no_of_session;  // readonly
                        //         // this.appointment.timeInformation.noOfSession = settings.no_of_session;
                        //         this.appointment.timeInformation.dftNoOfSession = this.appointment.timeInformation.noOfSession;  // readonly
                        //         this.appointment.paymentInformation = {
                        //             price: settings.trainer_charge,
                        //             commission: settings.trainer_commission,
                        //             order_total: settings.trainer_charge,
                        //             total_commission: settings.trainer_commission
                        //         };
                        //         if (settings.room)
                        //             this.appointment.timeInformation.roomId = settings.room;
                        //     }
                        // });
                    });
                }
            } else if (this.selectedPackage) {
            } else {
                this.appointment.paymentInformation = {
                    price: 0,
                    commission: 0,
                    total_commission: 0
                };
            }
            this.appointment.timeInformation.customerId = customer.id;
            this.selectedCustomerId = customer.id;
        }
        if (this.selectedPackage && this.selectedPackage.start_time) {
            this.loadAptPackageTime();
            return;
        }
        if (this.appointment.timeInformation.date && this.appointment.timeInformation.noOfSession && this.appointment.timeInformation.customerId > 0 && this.appointment.timeInformation.roomId > 0) {
            this.appointmentService.getTimeslotsByDate(this.appointment.timeInformation).subscribe(res => {
                this.lessons = [];
                this.holidays = undefined;
                if (res.success == false) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: res.error
                    });
                    this.times = [];
                } else {
                    this.times = res.data[0].freeslots;
                    this.appointment.timeInformation.sessionInterval = res.sessionInterval;
                }
                if (!this.selectedPackage) {
                    // reset for non-package.
                    this.appointment.timeInformation.time = undefined;
                    // if (this.appointment.paymentInformation.commission <= 0)
                    //     this.appointment.paymentInformation.price = 0;
                }
            });
        } else {
            this.times = [];
        }
        // calculate order_total & total_commission, if it's trainer data.
        if (this.appointment.timeInformation.useTrainerData) {
            this.appointment.paymentInformation.order_total = this.calculateCharge(this.appointment.paymentInformation.price);
            this.appointment.paymentInformation.total_commission = this.calculateCharge(this.appointment.paymentInformation.commission);
        }
    }

    private calculateCharge(price) {
        if (price > 0)
            return price / this.appointment.timeInformation.dftNoOfSession * this.appointment.timeInformation.noOfSession;
        return 0;
    }

    setPriceByTime(e) {
        if (this.appointment.paymentInformation.commission <= 0) {
            if (this.times.length > 0) {
                const theTime = this.times.find(el => el.time == this.appointment.timeInformation.time);
                this.appointment.paymentInformation.price = theTime.price;
                this.appointment.paymentInformation.order_total = theTime.price;
                this.appointment.packageInfo.price = theTime.price * this.appointment.packageInfo.quantity;
            } else {
                this.appointment.paymentInformation.price = 0;
                this.appointment.paymentInformation.order_total = 0;
                this.appointment.packageInfo.price = 0;
            }
        }
    }

    hideAptDialog() {
        this.aptFormDialog = false;
    }

    loadAptLessonDates() {
        if (!this.appointment.timeInformation.date) {
            this.submitted = true;
            return;
        }
        this.appointmentService.getPackageDates({
            start_date: this.lemonade.formatPostDate(this.appointment.timeInformation.date),
            dow: this.appointment.packageInfo.recurring,
            quantity: this.appointment.packageInfo.quantity,
            package_id: this.selectedPackage ? this.selectedPackage.id : 0
        }).subscribe(res => {
            this.lessons = res.data;
            this.holidays = res.holidays;
            if (!this.selectedPackage) {
                // FIXME 20230119 why !this.selectedPackage?? to support mutliple lesson?
                this.appointment.packageInfo.price = this.appointment.packageInfo.quantity * this.appointment.paymentInformation.price;
                if (this.appointment.paymentInformation.commission > 0) {
                    this.appointment.packageInfo.commission = this.appointment.packageInfo.quantity * this.appointment.paymentInformation.commission;
                }
            } else {
                this.minExpiryDate = new Date(this.lessons[this.lessons.length-1].date);
            }
        });
    }

    saveAptForm() {
        this.submitted = true;
        const timeInfo = this.appointment.timeInformation;

        if (!timeInfo.customerId || timeInfo.customerId <= 0)
            return;
        if (timeInfo.serviceId <= 0)
            return;
        if (timeInfo.roomId <= 0)
            return;
        if (timeInfo.noOfSession <= 0)
            return;
        if (!timeInfo.date)
            return;
        if (timeInfo.time == undefined)
            return;
        if (this.supportFinance) {
            if (!this.appointment.paymentInformation.order_total)
                return;
            if (this.appointment.paymentInformation.status == 'paid' && !this.paymentGateway)
                return;
        }
        let data = {
            ...timeInfo, ...{
                date: this.lemonade.formatPostDate(timeInfo.date),
                paymentMethod: 'onsite',
                paymentGateway: this.appointment.paymentInformation.status == 'paid' ? this.paymentGateway : '',
                paymentStatus: this.appointment.paymentInformation.status,
                price: this.appointment.paymentInformation.price,
                commission: this.appointment.paymentInformation.total_commission||0,
                order_total: this.appointment.paymentInformation.order_total
            }
        };
        if (this.appointment.isPackage === true) {
            const packageInfo = this.appointment.packageInfo;
            if (packageInfo.quantity <= 0)
                return;
            if (packageInfo.recurring.length == 0)
                return;
            if (this.lessons.length == 0) {
                this.loadAptLessonDates();
                return;
            }
            const lessonDates = this.lessons.map(function (obj) {
                return obj.date;
            });
            const recurring = JSON.parse(this.selectedPackage.recurring);
            data = {...data, ...{
                    is_package: true,
                    recurring: {
                        cycle: recurring.cycle,
                        start_date: this.lemonade.formatPostDate(timeInfo.date),
                        // end_date = package expiry date, nullable.
                        end_date: (packageInfo.end_date && packageInfo.end_date instanceof Date) ? this.lemonade.formatPostDate(packageInfo.end_date) : null,
                        quantity: packageInfo.quantity,
                        repeat: packageInfo.recurring
                    },
                    lesson_dates: lessonDates,
                    repeatable: packageInfo.repeatable,
                    package_amount: packageInfo.price,
                    package_commission: packageInfo.commission
                }
            };
        }
        const me = this;
        this.submittingModal = true;   // show submitting modal after validation.

        this.appointmentService.submit(data, function(res) {
            if (res.success == true) {
                me.messageService.add({
                    severity: 'success',
                    summary: 'Appointment booked',
                    detail: 'Booking is completed.'
                });
                me.loadData(null);
                me.aptFormDialog = false;
                // clean up
                me.appointment = null;
                me.holidays = undefined;
                me.lessons = undefined;
                me.selectedCustomerId = 0;
                me.selectedPackage = undefined;
                me.printInvoice(res.order_id, 'invoice');
            } else {
                me.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: res.error
                });
            }
            me.submittingModal = false;   // hide modal.
        });
    }

    calculateCustomerTotal(name) {
        let total = 0;

        if (this.customers) {
            for (let customer of this.customers) {
                if (customer.representative.name === name) {
                    total++;
                }
            }
        }

        return total;
    }

}
