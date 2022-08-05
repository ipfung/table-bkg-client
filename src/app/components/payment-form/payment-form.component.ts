import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";

@Component({
    selector: 'app-payment-form',
    templateUrl: './payment-form.component.html',
    styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
    personalInformation: any;

    paymentInformation: any;

    timeInformation: any;

    constructor(public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        this.personalInformation = this.appointmentService.getAppointmentInformation().personalInformation;
        this.paymentInformation = this.appointmentService.getAppointmentInformation().paymentInformation;
        this.timeInformation = this.appointmentService.getAppointmentInformation().timeInformation;
    }

    selectPayment(selectPaymentMethod) {
        this.paymentInformation.method = selectPaymentMethod.code;
    }

    getPaymentBtnCls(paymentMethod) {
        return 'payment-btn ' + (paymentMethod.code == this.paymentInformation.method ? '' : 'p-button-outlined');
    }

    selectedPreviousDescription() {
        return this.timeInformation.date + "  " + this.appointmentService.formatTime(this.timeInformation.time) + " to " + this.appointmentService.formatTime(parseInt(this.timeInformation.time, 10) + (this.timeInformation.noOfSession * this.timeInformation.sessionInterval));
    }

    selectedDescription() {
        if (this.paymentInformation.method != '') {
            return this.appointmentService.getPaymentMethodName(this.paymentInformation.method);
        }
        return '-';
    }

    nextPage() {
        if (this.paymentInformation.method) {
            this.appointmentService.getAppointmentInformation().paymentInformation = this.paymentInformation;
            this.appointmentService.updateUserSelection();
            this.router.navigate(['appointment/confirmation']);
        }
    }

    prevPage() {
        this.router.navigate(['appointment/datetime']);
    }
}
