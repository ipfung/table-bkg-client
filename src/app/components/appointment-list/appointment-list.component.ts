import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {addDays, intervalToDuration, isWithinInterval, subHours} from "date-fns";
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-appointment-list',
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointment-list.component.html',
    styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
    loading = true;

    pageHeader = '';

    showCustomer = false;
    showTrainer = false;
    bookings: any;
    newable: boolean;

    // search fields
    rangeDates: Date[];

    // appointment form
    appointment: any;
    services = [];
    sessions = [];
    rooms = [];
    statuses = [];
    customers: any[];
    trainers: any[];
    times: any[] = [];

    submitted = false;
    formDialog = false;
    formHeader = 'Create Form';

    constructor(public appointmentService: AppointmentService, private router: Router, private confirmationService: ConfirmationService, private messageService: MessageService, private translateService: TranslateService, private lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.rangeDates = [new Date(), addDays(new Date(), 14)];
        this.loadData();
    }

    loadData() {
//console.log('date range2===', this.rangeDates);
        if (this.rangeDates.length == 2 && this.rangeDates[1]) {
            this.loading = true;
            this.appointmentService.getBookings(this.rangeDates[0], this.rangeDates[1]).subscribe(res => {
                this.bookings = res.data;
                this.showCustomer = res.showCustomer;
                this.showTrainer = res.showTrainer;
                this.pageHeader = this.showCustomer ? 'Appointment' : 'My Booking';
                this.newable = res.newable;
                this.loading = false;
            });
        }
    }

    duration(appointment) {
        return this.lemonade.duration(appointment.start_time, appointment.end_time);
    }

    isPaid(appointment) {
        return appointment.payment_status === 'paid' && this.showCustomer == false;
    }

    makePayment(appointment) {
        alert("to be implemented");
    }

    ableCheckin(booking) {
        const start_time = new Date(booking.start_time);
        const hour_ago = subHours(start_time, 1);
        // check is now between 1 hour before of start time and start time itself.
        return !booking.checkin && isWithinInterval(new Date(), { start: hour_ago, end: new Date(booking.end_time) });
    }

    punchIn(booking) {
        if (this.ableCheckin(booking)) {
            this.translateService.get(['Check in now?', 'Error']).subscribe( res => {
                this.confirmationService.confirm({
                    message: res['Check in now?'],
                    accept: () => {
                        booking.loading = true;
                        this.appointmentService.punchIn(booking.id).subscribe(res => {
                            // console.log('checkin=', res);
                            if (res.success == true) {
                                booking.checkin = res.checkin;
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: res['Error'],
                                    detail: res.error
                                });
                            }
                        });
                        booking.loading = false;
                    }
                });
            });
        }
    }

    /**
     * pending or approved = valid.
     * rejected or canceled = invalid.
     * @param appointment
     */
    isValidStatus(appointment) {
        return appointment.loading !== true && (appointment.status == 'approved' || appointment.status == 'pending') && this.showCustomer == false;
    }

    /**
     * action must be done X hour before start_time
     * @param appointment
     */
    canAmend(appointment) {
        const now = new Date(),
            start_time = (new Date(appointment.start_time));
        const hour48_ago = subHours(start_time, 48);
        return (now < hour48_ago && this.isValidStatus(appointment));
    }

    reschedule(appointment) {
        this.appointmentService.reschedule.appointment = appointment;
        this.router.navigate(['/reschedule', appointment.id]);
    }

    isAbleApprove(appointment) {
        return appointment.status == 'pending' && this.showCustomer == true;
    }

    reject(booking) {
        this.translateService.get(['Reject booking?', 'Warning']).subscribe( res => {
            this.confirmationService.confirm({
                message: res['Reject booking?'],
                accept: () => {
                    booking.loading = true;
                    this.appointmentService.reject(booking.id).subscribe(res => {
                        // console.log('checkin=', res);
                        if (res.success == true) {
                            booking.status = res.status;
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: res['Error'],
                                detail: res.error
                            });
                        }
                        booking.loading = false;
                    });
                }
            });
        });

    }

    approve(booking) {
        this.translateService.get(['Approve booking?', 'Warning']).subscribe( res => {
            this.confirmationService.confirm({
                message: res['Approve booking?'],
                accept: () => {
                    booking.loading = true;
                    this.appointmentService.approve(booking.id).subscribe(res => {
                        // console.log('checkin=', res);
                        if (res.success == true) {
                            booking.status = res.status;
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: res['Error'],
                                detail: res.error
                            });
                        }
                        booking.loading = false;
                    });
                }
            });
        });
    }

    /**
     * only unpaid appointment can be canceled.
     * @param booking
     */
    cancel(booking) {
        if (!this.isPaid(booking)) {
            this.translateService.get(['Are you sure to cancel booking?', 'Warning']).subscribe( res => {
                this.confirmationService.confirm({
                    message: res['Are you sure to cancel booking?'],
                    accept: () => {
                        booking.loading = true;
                        this.appointmentService.cancel(booking.id).subscribe(res => {
                            // console.log('checkin=', res);
                            if (res.success == true) {
                                booking.status = res.status;
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: res['Error'],
                                    detail: res.error
                                });
                            }
                            booking.loading = false;
                        });
                    }
                });
            });
        }
    }

    openNew() {
        this.formHeader = "Create Form";
        this.prepareForForm();
        // this is always a new appointment information.
        this.appointment = this.appointmentService.getAppointmentInformation();
        this.submitted = false;
        this.formDialog = true;
    }

    prepareForForm() {
        // for form, this wastes memory if user doesn't open the form.
        this.appointmentService.getRooms().subscribe( res => {
            this.rooms = res.data;
        });
        this.appointmentService.getActiveCustomers().subscribe( res => {
            this.customers = res.data;
        });
        this.appointmentService.getActiveTrainers().subscribe( res => {
            this.trainers = res.data;
        });
        this.appointmentService.getServices().subscribe(res => {
            this.services = res.data;
            this.appointment.timeInformation.serviceId = this.services[0].id;
            this.appointment.timeInformation.noOfSession = this.services[0].sessions[0].code;
            this.loadSessions(null);
        });
        this.statuses = this.lemonade.appointmentStatus;
    }

    loadSessions(e) {
        if (this.services.length > 0) {
            let service = this.services.find(el => el.id == this.appointment.timeInformation.serviceId);
            this.sessions = service.sessions;
        } else {
            this.sessions = [];
        }
    }

    loadTime(e) {
        if (this.appointment.timeInformation.date && this.appointment.timeInformation.noOfSession && this.appointment.timeInformation.customerId > 0 && this.appointment.timeInformation.roomId > 0) {
            this.appointmentService.getTimeslotsByDate(this.appointment.timeInformation.date, this.appointment.timeInformation.noOfSession, this.appointment.timeInformation.customerId, this.appointment.timeInformation.roomId).subscribe(res => {
                console.log('times=sssss=', res.data[0].freeslots);
                this.times = res.data[0].freeslots;
                this.appointment.timeInformation.sessionInterval = res.sessionInterval;
                this.appointment.timeInformation.time = undefined;   // reset
                this.appointment.paymentInformation.price = undefined;
            });
        } else {
            this.times = [];
        }
    }

    setPriceByTime(e) {
        if (this.times.length > 0) {
            const theTime = this.times.find(el => el.time == this.appointment.timeInformation.time);
            this.appointment.paymentInformation.price = theTime.price;
        } else {
            this.appointment.paymentInformation.price = 0;
        }
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        this.submitted = true;

        if (this.appointment.timeInformation.customerId <= 0)
            return;
        if (this.appointment.timeInformation.serviceId <= 0)
            return;
        if (this.appointment.timeInformation.roomId <= 0)
            return;
        if (this.appointment.timeInformation.noOfSession <= 0)
            return;
        if (this.appointment.timeInformation.date == undefined)
            return;
        else {
            this.appointment.timeInformation.date = this.lemonade.formatPostDate(this.appointment.timeInformation.date);
        }
        if (this.appointment.timeInformation.time == undefined)
            return;
        this.appointment.paymentInformation.method = 'onsite';
        const data = {
            ...{
                paymentMethod: 'onsite',
                price: this.appointment.paymentInformation.price
            }, ...this.appointment.timeInformation
        };
        const me = this;
console.log('single appointment=', data);
        this.appointmentService.submit(data, function(res) {
            if (res.success == true) {
                me.loadData();
                me.appointment = undefined;
                me.formDialog = false;
            }
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
