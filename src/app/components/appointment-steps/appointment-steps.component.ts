import {Component, OnInit} from '@angular/core';
import {MenuItem, MessageService} from "primeng/api";
import {AppointmentService} from "../../service/appointmentservice";
import {Subscription} from "rxjs";
import {Router} from "@angular/router";
import {TranslateService} from "@ngx-translate/core";
import {Lemonade} from "../../service/lemonade.service";

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

    constructor(public messageService: MessageService, public appointmentService: AppointmentService, private lemonade: Lemonade, private router: Router, private translateService: TranslateService) {
    }

    ngOnInit(): void {
        const serviceSelection = this.appointmentService.serviceSelection;
        const paymentSelection = this.appointmentService.hasValidPayment();
        this.translateService.get(['Service', 'Duration', 'Date & Time', 'Payment', 'Confirmation']).subscribe( res => {
            console.log('res.Confirmation=', res, serviceSelection);
            this.items = [];
            if (serviceSelection) {
                this.items.push({
                    label: res['Service'],
                    routerLink: 'service-selection'
                });
            }
            this.items.push({
                label: res.Duration,
                routerLink: 'time-range'
            }, {
                label: res['Date & Time'],
                routerLink: 'datetime'
            });
            if (paymentSelection) {
                this.items.push({
                    label: res['Payment'],
                    routerLink: 'payment'
                });
            }
            this.items.push({
                label: res.Confirmation,
                routerLink: 'confirmation'
            });
        });

        this.subscription = this.appointmentService.paymentComplete$.subscribe((data) => {
            if (data.success === true) {
                if (this.appointmentService.paymentSelection && data.pay_status == 'pending') {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Appointment reserved',
                        detail: 'Dear ' + data.personalInformation.firstname + ', redirecting to the payment gateway.'
                    });
                    window.location.href = this.appointmentService.checkout(data.order_num);
                    return;
                } else {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Appointment booked',
                        detail: 'Dear ' + data.personalInformation.firstname + ', your booking is completed.'
                    });
                }
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
