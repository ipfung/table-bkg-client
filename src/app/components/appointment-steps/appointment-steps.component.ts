import {Component, OnInit} from '@angular/core';
import {MenuItem, MessageService} from "primeng/api";
import {AppointmentService} from "../../service/appointmentservice";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";

@Component({
    selector: 'app-appointment-steps',
    templateUrl: './appointment-steps.component.html',
    providers: [MessageService],
    styleUrls: ['./appointment-steps.component.scss']
})
export class AppointmentStepsComponent implements OnInit {
    items: MenuItem[];
    activeIndex = 0;
    subscription: Subscription;

    constructor(public messageService: MessageService, public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        this.items = [{
            label: 'Duration',
            routerLink: 'time-range'
        }, {
            label: 'Date & Time',
            routerLink: 'datetime'
        }, {
            label: 'Payment',
            routerLink: 'payment'
        }, {
            label: 'Confirmation',
            routerLink: 'confirmation'
        }];

        this.subscription = this.appointmentService.paymentComplete$.subscribe((data) => {
            if (data.success === true) {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Appointment booked',
                    detail: 'Dear ' + data.personalInformation.firstname + ', your booking is completed.'
                });
                this.router.navigate(['appointment']);
            } else {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: data.error
                });
                this.router.navigate(['appointment/datetime']);
            }
        });
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
