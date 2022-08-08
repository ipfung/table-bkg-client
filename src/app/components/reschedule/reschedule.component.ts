import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {Subscription} from "rxjs";

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

    subscription: Subscription;
    //
    confirmModal = false;
    success = false;
    msgs = [];

    constructor(public appointmentService: AppointmentService, private route: ActivatedRoute, private router: Router, public messageService: MessageService, private translateService: TranslateService) {
    }

    ngOnInit(): void {
        this.reschedule = this.appointmentService.reschedule;
        if (this.reschedule.appointment == null) {
            this.router.navigate(['/appointment-list']);
        }
        this.reschedule.bookId = this.route.snapshot.paramMap.get('id');
console.log('this.reschedule.bookId=', this.reschedule.bookId);
        this.appointmentService.getRescheduleTimeslots().subscribe(res => {
            this.minDate = new Date(res.minDate);
            this.maxDate = new Date(res.maxDate);
            this.reschedule.date = null;
            this.reschedule.noOfSession = res.noOfSession;
            this.reschedule.sessionInterval = res.sessionInterval;
            this.timeSlots = res['data'];
            this.dateTimeSlots = this.getTimeslotsByDate();
        });
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

    back() {
        this.router.navigate(['appointment-list']);
    }

    changeDate() {
        this.dateTimeSlots = this.getTimeslotsByDate();
    }

    getTimeslotsByDate() {
        if (this.reschedule.date) {
            const ymd = this.appointmentService.formatPostDate(this.reschedule.date);
            // console.log('yymmdd====', ymd);
            let slots = this.timeSlots.find(el => el.date == ymd);
            // console.log('slowttt===', slots.freeslots);
            return slots.freeslots;
        }
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
