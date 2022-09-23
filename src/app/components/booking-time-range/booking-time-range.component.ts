import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";

@Component({
    selector: 'app-booking-time-range',
    templateUrl: './booking-time-range.component.html',
    styleUrls: ['./booking-time-range.component.scss']
})
export class BookingTimeRangeComponent implements OnInit {

    serviceSelection: boolean;
    timeInformation: any;
    submitted = false;

    constructor(public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        const appointmentInfo = this.appointmentService.getAppointmentInformation();
        this.serviceSelection = this.appointmentService.serviceSelection;
        this.timeInformation = appointmentInfo.timeInformation;
    }

    /**
     * store the value to localStorage in case browser refresh.
     * @param e Browser event
     * @param v Selected option value
     */
    storeUserPref(e) {
        // clear selected date & time once noOfSession changed.
        this.timeInformation.date = '';
        this.timeInformation.time = '';
    }

    selectedPreviousDescription() {
        return this.timeInformation.serviceName;
    }

    selectedDescription() {
        return this.appointmentService.getSessionName(this.timeInformation.noOfSession);
    }

    prevPage() {
        this.router.navigate(['appointment/service-selection']);
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
