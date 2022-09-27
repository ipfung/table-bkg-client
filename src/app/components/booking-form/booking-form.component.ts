import {Component, OnInit} from '@angular/core';

import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {AuthService} from "../../service/auth.service";

@Component({
    selector: 'app-booking-form',
    templateUrl: './booking-form.component.html',
    styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
    timeInformation: any;

    paymentSelection: boolean;
    paymentInformation: any;

    today: Date;

    // the maxBookDate depends on user level
    maxBookDate: Date;

    loading = true;
    timeSlots: any[];   // ngIf the tabView is the trick to show. ref: https://stackblitz.com/edit/github-s9uwhf-yy9nq2?file=src%2Fapp%2Fapp.component.ts

    multipleYear: boolean;

    constructor(public appointmentService: AppointmentService, private authService: AuthService, private router: Router) {
    }

    ngOnInit(): void {
        const appointmentInformation = this.appointmentService.getAppointmentInformation();
        this.timeInformation = appointmentInformation.timeInformation;
        this.paymentInformation = appointmentInformation.paymentInformation;
        this.paymentSelection = this.appointmentService.paymentSelection;
        // below should be retrieved from service.
        this.appointmentService.getTimeslots().subscribe(res => {
            this.today = res['minDate'];
            this.maxBookDate = res['maxDate'];
            this.timeSlots = res['data'];
            this.timeInformation.sessionInterval = res['sessionInterval'];
            this.multipleYear = (this.today !== this.maxBookDate);
            this.loading = false;
        });
    }

    selectedPreviousDescription() {
        return this.appointmentService.getSessionName(this.timeInformation.noOfSession);
    }

    selectedDescription() {
        // console.log('this.timeInformation.time=', this.timeInformation.time, this.timeInformation.noOfSession, this.timeInformation.sessionInterval, (this.timeInformation.noOfSession * this.timeInformation.sessionInterval), (this.timeInformation.time + (this.timeInformation.noOfSession * this.timeInformation.sessionInterval)));
        if (this.timeInformation.time) {
            return this.appointmentService.getBookedDateTime(this.timeInformation.date, this.timeInformation.time, this.timeInformation.sessionInterval, this.timeInformation.noOfSession);
        }
        return '-';
    }

    selectTime(obj, date) {
        this.timeInformation.date = date;
        this.timeInformation.time = obj.time;
        this.paymentInformation.price = obj.price;
    }

    getBtnCls(obj, date) {
        return 'p-button-text timeslot-btn' + (this.timeInformation.date == date && this.timeInformation.time == obj.time ? ' bg-primary' : '');
    }

    async nextPage() {
        // don't check timeInformation.time because 0:00 will not pass it.
        if (this.timeInformation.date && this.timeInformation.sessionInterval > 0) {
            let appointmentInfo = this.appointmentService.getAppointmentInformation();   // note!! can call getAppointmentInformation() in each function, otherwise will not store data.
            appointmentInfo.personalInformation = {
                firstname: await this.authService.userName(),
                lastname: '',
                email: await this.authService.email()
            };
            appointmentInfo.timeInformation = this.timeInformation;
            appointmentInfo.paymentInformation = this.paymentInformation;
            this.appointmentService.updateUserSelection();
            if (this.paymentSelection)
                this.router.navigate(['appointment/payment']);
            else {
                this.router.navigate(['appointment/confirmation']);
            }

            return;
        }

        // this.submitted = true;
    }

    prevPage() {
        this.router.navigate(['appointment/time-range']);
    }
}
