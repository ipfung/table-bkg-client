import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";

@Component({
    selector: 'app-booking-time-range',
    templateUrl: './booking-time-range.component.html',
    styleUrls: ['./booking-time-range.component.scss']
})
export class BookingTimeRangeComponent implements OnInit {

    timeInformation: any;

    submitted = false;

    constructor(public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        this.timeInformation = this.appointmentService.getAppointmentInformation().timeInformation;
    }

    /**
     * store the value to localStorage in case browser refresh.
     * @param e Browser event
     * @param v Selected option value
     */
    storeUserPref(e) {
        this.timeInformation.noOfSession = e.value;
        // clear selected date & time once noOfSession changed.
        this.timeInformation.date = '';
        this.timeInformation.time = '';
    }

    selectedDescription() {
        return this.appointmentService.getSessionName(this.timeInformation.noOfSession);
    }

    nextPage() {
        if (this.timeInformation.noOfSession > 0) {
            this.appointmentService.getAppointmentInformation().timeInformation = this.timeInformation;
            this.appointmentService.updateUserSelection();
            this.router.navigate(['appointment/datetime']);

            return;
        }

        this.submitted = true;
    }
}
