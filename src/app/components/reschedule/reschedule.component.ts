import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {Subscription} from "rxjs";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-reschedule',
    providers: [MessageService],
    templateUrl: './reschedule.component.html',
    styleUrls: ['./reschedule.component.scss']
})
export class RescheduleComponent implements OnInit {
    reschedule: any;

    minDate: Date;
    maxDate: Date;
    timeSlots: any[];
    dateTimeSlots: any[];

    // since support 'trainer_date'.
    timeslotSetting: string;
    nonWorkingDates: Date[];
    loading: boolean;

    subscription: Subscription;
    //
    confirmModal = false;
    success = false;
    msgs = [];

    constructor(public appointmentService: AppointmentService, public lemonade: Lemonade, private route: ActivatedRoute, private router: Router, public messageService: MessageService, private translateService: TranslateService) {
    }

    ngOnInit(): void {
        this.reschedule = this.appointmentService.reschedule;
        if (this.reschedule.appointment == null) {
            this.router.navigate(['/appointment-list']);
        }
        this.timeslotSetting = this.reschedule.appointment.timeslotSetting;
        this.reschedule.bookId = this.route.snapshot.paramMap.get('id');
        if (this.timeslotSetting == 'trainer_date') {
            let d = new Date();
            this.loadTrainerNonWorkDates({year: d.getFullYear(), month: d.getMonth() + 1});
        } else {
            console.log('this.reschedule.bookId=', this.reschedule.bookId, this.timeslotSetting);
            this.appointmentService.getRescheduleTimeslots().subscribe(res => {
                this.minDate = new Date(res.minDate);
                this.maxDate = new Date(res.maxDate);
                this.reschedule.date = null;
                this.reschedule.noOfSession = res.noOfSession;
                this.reschedule.sessionInterval = res.sessionInterval;
                this.timeSlots = res['data'];
                this.appointmentService.tableSessions = res.tableSessions;
                this.dateTimeSlots = this.getTimeslotsByDate();
            });
        }
        this.subscription = this.appointmentService.paymentComplete$.subscribe((data) => {
            console.log('resch sub=', data);
            this.success = data.success;
            this.msgs = [];
            if (data.success === true) {
                this.translateService.get('Congratulations, booking rescheduled successfully.').subscribe( res => {
                    this.msgs.push({
                        severity: 'success',
                        detail: res
                    });
                });
            } else {
                this.translateService.get(data.error, {
                    param: data.params
                }).subscribe( res => {
                    this.msgs.push({
                        severity: 'error',
                        detail: res
                    });
                });
            }
        });
    }

    loadTrainerNonWorkDates(e) {
        if (this.timeslotSetting == 'trainer_date') {
            this.loading = true;
            this.appointmentService.getTrainerNonWorkDates(this.reschedule.appointment.trainer_id, e.year, e.month).subscribe(res => {
                this.nonWorkingDates = [];
                for (let i = 0; i < res.length; i++) {
                    this.nonWorkingDates.push(new Date(res[i]));
                }
                this.loading = false;
            });
        }
    }

    back() {
        this.router.navigate(['appointment-list']);
    }

    changeDate() {
        if (this.reschedule.date) {
            if (this.timeslotSetting == 'trainer_date') {
                this.appointmentService.getRescheduleTimeslots(this.reschedule.date).subscribe(res => {
                    this.reschedule.noOfSession = res.noOfSession;
                    this.reschedule.sessionInterval = res.sessionInterval;
                    this.timeSlots = res['data'];
                    this.appointmentService.tableSessions = res.tableSessions;
                    this.dateTimeSlots = this.getTimeslotsByDate();
                });
            } else {
                this.dateTimeSlots = this.getTimeslotsByDate();
            }
        }
    }

    getTimeslotsByDate() {
       const ymd = this.appointmentService.formatPostDate(this.reschedule.date);
        // console.log('yymmdd====', ymd);
        let slots = this.timeSlots.find(el => el.date == ymd);
        // console.log('slowttt===', slots.freeslots);
        if (slots) return slots.freeslots;
        return [];
    }

    selectedDescription() {
        if (this.reschedule.time) {
            return this.appointmentService.getBookedDateTime(this.appointmentService.formatPostDate(this.reschedule.date), this.reschedule.time, this.reschedule.sessionInterval, this.reschedule.noOfSession);
        }
        return '-';
    }

    complete() {
        this.appointmentService.saveReschedule();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
