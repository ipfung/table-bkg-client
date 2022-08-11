import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {addDays, intervalToDuration, isWithinInterval, subHours} from "date-fns";
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-appointment-list',
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointment-list.component.html',
    styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
    loading: boolean;

    bookings: any;

    customers: any[];

    // search fields
    rangeDates: Date[];

    constructor(public appointmentService: AppointmentService, private router: Router, private confirmationService: ConfirmationService, private messageService: MessageService, private translateService: TranslateService) {
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
                this.bookings = res;
                this.loading = false;
            });
        }
    }

    getInitial(name) {
        // or ref: https://via.placeholder.com/300.png/09f/fff
        return name
            .toUpperCase()
            .split(' ')
            .map(word => word[0])
            .join('');
    }

    duration(appointment) {
        const duration = intervalToDuration({
            start: new Date(appointment.start_time),
            end: new Date(appointment.end_time)
        });
        return duration.hours + 'h ' + (duration.minutes > 0 ? duration.minutes + 'min' : '');
    }

    isPaid(appointment) {
        return appointment.payment_status === 'paid';
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
        return (appointment.status == 'approved' || appointment.status == 'pending');
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
                        });
                    }
                });
            });
        }
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
