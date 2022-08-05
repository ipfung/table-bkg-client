import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../../service/appointmentservice";
import {ApiService} from "../../service/api.service";
import {Router} from "@angular/router";
import {Subject} from "rxjs";

@Component({
    selector: 'app-payment-confirmation',
    templateUrl: './payment-confirmation.component.html',
    styleUrls: ['./payment-confirmation.component.scss']
})
export class PaymentConfirmationComponent implements OnInit {
    appointmentInformation: any;

    constructor(public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        this.appointmentInformation = this.appointmentService.getAppointmentInformation();
    }

    selectedPreviousDescription() {
        return this.appointmentService.getPaymentMethodName(this.appointmentInformation.paymentInformation.method);
    }

    selectedDescription() {
        return 'To a payment gateway';
    }

    complete() {
        this.appointmentService.complete();
    }

    prevPage() {
        this.router.navigate(['appointment/payment']);
    }
}
