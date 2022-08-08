import {Component, OnInit} from '@angular/core';

import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";

@Component({
    selector: 'app-booking-form',
    templateUrl: './booking-form.component.html',
    styleUrls: ['./booking-form.component.scss']
})
export class BookingFormComponent implements OnInit {
    timeInformation: any;

    paymentInformation: any;

    today: Date;

    // the maxBookDate depends on user level
    maxBookDate: Date;

    timeSlots: any[];   // ngIf the tabView is the trick to show. ref: https://stackblitz.com/edit/github-s9uwhf-yy9nq2?file=src%2Fapp%2Fapp.component.ts

    multipleYear: boolean;

    constructor(public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        this.timeInformation = this.appointmentService.getAppointmentInformation().timeInformation;
        this.paymentInformation = this.appointmentService.getAppointmentInformation().paymentInformation;
        // below should be retrieved from service.
        this.appointmentService.getTimeslots().subscribe(res => {
            this.today = res['minDate'];
            this.maxBookDate = res['maxDate'];
            this.timeSlots = res['data'];
            this.timeInformation.sessionInterval = res['sessionInterval'];
            this.multipleYear = (this.today !== this.maxBookDate);
        })
    }

    selectedPreviousDescription() {
        return this.appointmentService.getSessionName(this.timeInformation.noOfSession);
    }

    selectedDescription() {
        console.log('this.timeInformation.time=', this.timeInformation.time, this.timeInformation.noOfSession, this.timeInformation.sessionInterval, (this.timeInformation.noOfSession * this.timeInformation.sessionInterval), (this.timeInformation.time + (this.timeInformation.noOfSession * this.timeInformation.sessionInterval)));
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

    nextPage() {
        if (this.timeInformation.date && this.timeInformation.time && this.timeInformation.sessionInterval > 0) {
            let appointmentInfo = this.appointmentService.getAppointmentInformation();   // note!! can call getAppointmentInformation() in each function, otherwise will not store data.
            appointmentInfo.timeInformation = this.timeInformation;
            appointmentInfo.paymentInformation = this.paymentInformation;
            this.appointmentService.updateUserSelection();
            this.router.navigate(['appointment/payment']);

            return;
        }

        // this.submitted = true;
    }

    prevPage() {
        this.router.navigate(['appointment/time-range']);
    }
}
