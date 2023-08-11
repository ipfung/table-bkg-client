import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../../service/appointmentservice";
import {Router} from "@angular/router";

@Component({
    selector: 'app-booking-confirmation',
    templateUrl: './booking-confirmation.component.html',
    styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
    appointmentInformation: any;
    paymentSelection: boolean;
    submitting: boolean;

    constructor(public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        this.appointmentInformation = this.appointmentService.getAppointmentInformation();
        this.paymentSelection = this.appointmentService.hasValidPayment();
    }

    selectedPreviousDescription() {
        return this.appointmentService.getPaymentMethodName(this.appointmentInformation.paymentInformation.method);
    }

    selectedDescription() {
        if (!this.appointmentService.paymentSelection)
            return 'Save & complete booking';
        return 'To a payment gateway';
    }

    getCompleteButtonText() {
        if (!this.appointmentService.paymentSelection)
            return 'Complete';
        return 'Pay Now';
    }

    complete() {
        this.submitting = true;
        this.appointmentService.complete();
    }

    prevPage() {
        this.router.navigate(['appointment/payment']);
    }

    selectedPreviousDateTimeDescription() {
        return this.appointmentService.getBookedDateTime(this.appointmentInformation.timeInformation.date, this.appointmentInformation.timeInformation.time, this.appointmentInformation.timeInformation.sessionInterval, this.appointmentInformation.timeInformation.noOfSession);
    }

    prevDateTimePage() {
        this.router.navigate(['appointment/datetime']);
    }
}
