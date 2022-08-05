import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {AppointmentService} from "../../service/appointmentservice";
import {intervalToDuration, isWithinInterval, parseISO, subHours} from "date-fns";
import {ConfirmationService, MessageService} from "primeng/api";

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

    constructor(private api: ApiService, public appointmentService: AppointmentService, private confirmationService: ConfirmationService, private messageService: MessageService) {
    }

    ngOnInit(): void {
        // this.appointments = [{
        //
        // }];
        this.loading = true;
        this.api.get('api/booking').subscribe( res => {
           this.bookings = res;
            this.loading = false;
        });
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

    ableCheckin(booking) {
        const start_time = new Date(booking.start_time);
        const hour_ago = subHours(start_time, 1);
        // check is now between 1 hour before of start time and start time itself.
        return !booking.checkin && isWithinInterval(new Date(), { start: hour_ago, end: start_time });
    }

    punchIn(booking) {
        if (this.ableCheckin(booking)) {
            this.confirmationService.confirm({
                message: 'Check in now?',
                accept: () => {
                    this.api.post('api/booking-checkin/' + booking.id, {}).subscribe(res => {
                        console.log('checkin=', res);
                        if (res.success == true) {
                            booking.checkin = res.checkin;
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: 'Error',
                                detail: res.error
                            });
                        }
                    });
                }
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
