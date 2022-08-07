import {Component, OnInit} from '@angular/core';
import {MenuItem, MessageService} from "primeng/api";
import {AppointmentService} from "../../service/appointmentservice";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";

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

    constructor(public messageService: MessageService, public appointmentService: AppointmentService, private router: Router, private translateService: TranslateService) {
    }

    ngOnInit(): void {
        this.translateService.get(['Duration', 'Date & Time', 'Payment', 'Confirmation']).subscribe( res => {
            console.log('res.Confirmation=', res);
            this.items = [{
                label: res.Duration,
                routerLink: 'time-range'
            }, {
                label: res['Date & Time'],
                routerLink: 'datetime'
            }, {
                label: res['Payment'],
                routerLink: 'payment'
            }, {
                label: res.Confirmation,
                routerLink: 'confirmation'
            }];
        });

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
