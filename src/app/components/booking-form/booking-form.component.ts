import {Component, OnInit} from '@angular/core';

import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";
import {endOfMonth, isAfter, isBefore, isSameDay} from "date-fns";
import {addDays} from "@fullcalendar/core/internal";

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
    freeTimeSlots: any[];

    multipleYear: boolean;

    // since support 'trainer_date'.
    timeslotSetting: string;
    selectedDate: Date;
    nonWorkingDates: Date[];
    trainerTsLoading: boolean;

    // group event
    minDate: Date;
    maxDate: Date;
    noFreeSessionAvailable: boolean;

    constructor(public appointmentService: AppointmentService, private lemonade: Lemonade, private authService: AuthService, private router: Router) {
    }

    ngOnInit(): void {
        const appointmentInformation = this.appointmentService.getAppointmentInformation();
        this.timeInformation = appointmentInformation.timeInformation;
        this.paymentInformation = appointmentInformation.paymentInformation;
        this.paymentSelection = this.appointmentService.hasValidPayment();
        if (this.timeInformation.isFreeSession === true) {
            this.appointmentService.getTimeslotsForGroupEvent(this.timeInformation.noOfSession, this.timeInformation.serviceId).subscribe(res => {
                this.loading = false;
                this.freeTimeSlots = res['data'];
                this.timeSlots = [];
                if (this.freeTimeSlots && this.freeTimeSlots.length > 0) {
                    this.noFreeSessionAvailable = false;
                    this.minDate = new Date();
                    this.maxDate = new Date();
                    for (const t of this.freeTimeSlots) {
                        const sd = new Date(t.start_time),
                            ed = new Date(t.start_time);
                        if (this.selectedDate == null)
                            this.selectedDate = sd;
                        if (isBefore(sd, this.minDate)) {
                            this.minDate = sd;
                        }
                        if (isAfter(ed, this.maxDate)) {
                            this.maxDate = ed;
                        }
                    }
                    this.timeInformation.sessionInterval = 1;   // fake number to pass nextPage()
                    this.loadFreeTimeslotByDate(this.selectedDate);
                    this.loadFreeNonWorkDates({
                        year: this.selectedDate.getFullYear(),
                        month: 1+this.selectedDate.getMonth()
                    });
                } else {
                    this.noFreeSessionAvailable = true;
                    this.timeInformation.sessionInterval = 0;   // fake number to not allow to nextPage()
                    this.timeInformation.date = null;
                }
            });
        } else {
            if (this.appointmentService.selectedService)
                this.timeslotSetting = this.appointmentService.selectedService.timeslotSetting;
            else {
                this.timeslotSetting = this.timeInformation.timeslotSetting;
            }
            if (this.timeslotSetting == 'week') {
                // below should be retrieved from service.
                this.appointmentService.getTimeslots().subscribe(res => {
                    this.today = res['minDate'];
                    this.maxBookDate = res['maxDate'];
                    this.timeSlots = res['data'];
                    this.timeInformation.sessionInterval = res['sessionInterval'];
                    this.multipleYear = (this.today !== this.maxBookDate);
                    this.loading = false;
                });
            } else {
                // load current year+month
                let d = new Date();
                if (this.timeInformation.date && this.timeInformation.time) {
                    d = new Date(this.timeInformation.date);
                    this.selectedDate = d;
                    this.loadTrainerTimeslotByDate(d);
                }
                this.loadTrainerNonWorkDates({year: d.getFullYear(), month: d.getMonth() + 1});
            }
        }
    }

    loadFreeTimeslotByDate(d) {
        this.trainerTsLoading = true;
        this.timeSlots = [];
        for (const t of this.freeTimeSlots) {
            const sd = new Date(t.start_time);
            if (isSameDay(d, sd)) {
                this.timeSlots.push(t);
            }
        };
        this.trainerTsLoading = false;
    }

    /**
     * note params month is 1-12 based, need to use 0-11 based when converting to Date object.
     * @param e with year & month properties.
     */
    loadFreeNonWorkDates(e) {
        this.nonWorkingDates = [];
        let sDateOfMonth = new Date(e.year, e.month-1, 1);
        let disableDate = true;
        const eDateOfMonth = endOfMonth(sDateOfMonth);
        while (isBefore(sDateOfMonth, eDateOfMonth)) {
            disableDate = true;
            for (const t of this.freeTimeSlots) {
                if (isSameDay(sDateOfMonth, new Date(t.start_time))) {
                    // found event, enable.
                    disableDate = false;
                    break;
                }
            }
            if (disableDate) {
                this.nonWorkingDates.push(sDateOfMonth);
            }
            sDateOfMonth = addDays(sDateOfMonth, 1);
        }
    }

    selectFreeTime(obj) {
        if (obj.package.total_space - obj.no_of_booked <= 0) {
            return;
        }
        this.timeInformation.appointment_id = obj.id;
        this.timeInformation.start_time = obj.start_time;
        this.timeInformation.end_time = obj.end_time;
        this.timeInformation.date = this.lemonade.formatPostDate(new Date(obj.start_time));  // for nextPage()
        this.paymentInformation.apt = obj;  // for confirmation page display only.
    }

    getFreeBtnCls(obj) {
        return 'p-button-text timeslot-btn' + (this.timeInformation.appointment_id == obj.id ? ' bg-primary' : '');
    }

    loadTrainerTimeslotByDate(d) {
        this.trainerTsLoading = true;
        let appointmentInfo = this.appointmentService.getAppointmentInformation();   // note!! can call getAppointmentInformation() in each function, otherwise will not store data.
        appointmentInfo.timeInformation.trainerDate = d;
        this.appointmentService.getTimeslots().subscribe(res => {
            this.timeSlots = res['data'];
            this.timeInformation.sessionInterval = res['sessionInterval'];
            this.trainerTsLoading = false;
        });
    }

    loadTrainerNonWorkDates(e) {
        this.loading = true;
        let appointmentInfo = this.appointmentService.getAppointmentInformation();   // note!! can call getAppointmentInformation() in each function, otherwise will not store data.
        this.appointmentService.getTrainerNonWorkDates(appointmentInfo.timeInformation.trainerId, e.year, e.month).subscribe(res => {
            this.nonWorkingDates = [];
            for (let i=0; i<res.length; i++) {
                this.nonWorkingDates.push(new Date(res[i]));
            }
            this.loading = false;
        });
    }

    selectedPreviousDescription() {
        if (this.timeInformation.isFreeSession == true) {
            return 'Free Session';
        }
        return this.appointmentService.getSessionName(this.timeInformation.noOfSession);
    }

    selectedDescription() {
        // console.log('this.timeInformation.time=', this.timeInformation.time, this.timeInformation.noOfSession, this.timeInformation.sessionInterval, (this.timeInformation.noOfSession * this.timeInformation.sessionInterval), (this.timeInformation.time + (this.timeInformation.noOfSession * this.timeInformation.sessionInterval)));
        if (this.timeInformation.isFreeSession == true) {
            if (this.timeInformation.start_time) {
                return this.lemonade.formatDate(this.timeInformation.start_time, true) + ' ' + this.lemonade.formatDateTime(this.timeInformation.start_time) + ' - ' + this.lemonade.formatDateTime(this.timeInformation.end_time);
            }
        }
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
            this.timeInformation.timeslotSetting = this.timeslotSetting;  // in case user refresh this page.
            const paymethods = this.lemonade.paymentMethods.length;
            if (1 == paymethods) {
                // set default payment gateway if paymentMethods has 1 option only.
                this.paymentInformation.method = this.lemonade.paymentMethods[0].code;
            }
            appointmentInfo.timeInformation = this.timeInformation;
            appointmentInfo.paymentInformation = this.paymentInformation;
            this.appointmentService.updateUserSelection();
            if (this.paymentSelection) {
                // go to payment selection page if paymethods more than 1.
                this.router.navigate(['appointment/payment']);
            } else {
                this.router.navigate(['appointment/confirmation']);
            }

            return;
        }

        // this.submitted = true;
    }

    prevPage() {
        this.router.navigate(['appointment/time-range']);
    }

    isOutOfSpace(obj) {
        return (obj.package.total_space - obj.no_of_booked <= 0);
    }
}
