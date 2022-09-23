import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {AuthService} from "../../service/auth.service";

@Component({
    selector: 'app-payment-form',
    templateUrl: './payment-form.component.html',
    styleUrls: ['./payment-form.component.scss']
})
export class PaymentFormComponent implements OnInit {
    personalInformation: any;

    paymentInformation: any;

    timeInformation: any;

    constructor(public appointmentService: AppointmentService, private authService: AuthService, private router: Router) {
    }

    ngOnInit() {
        const appointmentInformation = this.appointmentService.getAppointmentInformation();
        this.paymentInformation = appointmentInformation.paymentInformation;
        this.timeInformation = appointmentInformation.timeInformation;
    }

    selectPayment(selectPaymentMethod) {
        this.paymentInformation.method = selectPaymentMethod.code;
    }

    getPaymentBtnCls(paymentMethod) {
        return 'payment-btn ' + (paymentMethod.code == this.paymentInformation.method ? '' : 'p-button-outlined');
    }

    selectedPreviousDescription() {
        if (this.timeInformation && this.timeInformation.date)
            return this.appointmentService.getBookedDateTime(this.timeInformation.date, this.timeInformation.time, this.timeInformation.sessionInterval, this.timeInformation.noOfSession);
        return '-';
    }

    selectedDescription() {
        if (this.paymentInformation.method != '') {
            return this.appointmentService.getPaymentMethodName(this.paymentInformation.method);
        }
        return '-';
    }

    nextPage() {
        if (this.paymentInformation.method) {
            let appointmentInfo = this.appointmentService.getAppointmentInformation();   // note!! can call getAppointmentInformation() in each function, otherwise will not store data.
            appointmentInfo.personalInformation = this.personalInformation;
            appointmentInfo.paymentInformation = this.paymentInformation;
            this.appointmentService.updateUserSelection();
            this.router.navigate(['appointment/confirmation']);
        }
    }

    prevPage() {
        this.router.navigate(['appointment/datetime']);
    }
}
