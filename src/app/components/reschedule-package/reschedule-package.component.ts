import { Component, OnInit } from '@angular/core';
import {Subscription} from "rxjs";
import {AppointmentService} from "../../service/appointmentservice";
import {Lemonade} from "../../service/lemonade.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-reschedule-package',
    providers: [MessageService],
  templateUrl: './reschedule-package.component.html',
  styleUrls: ['./reschedule-package.component.scss']
})
export class ReschedulePackageComponent implements OnInit {
    reschedule: any;

    minDate: Date;
    maxDate: Date;
    selectedNewPkg: any;
    customDate: Date;
    dateTimeSlots: any[];

    packages: any;
    package_dates: any[];
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
            return;
        }
console.log('resch pkg ngOnInit=', this.reschedule);
        this.reschedule.bookId = this.route.snapshot.paramMap.get('id');
        this.appointmentService.getReschedulePackageTimeslots().subscribe(res => {
            this.reschedule.date = null;
            this.package_dates = [...res['data'], ...[{date: null, dow: null, id: 0}]];
            this.packages = res['package'];
            this.minDate = new Date(this.packages.start_date);
            if (this.packages.end_date)
                this.maxDate = new Date(this.packages.end_date);
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

    setPackageDate() {
        this.reschedule.appointment_id = this.selectedNewPkg.id;
        this.reschedule.date = this.selectedNewPkg.date;
        this.reschedule.time = this.selectedNewPkg.time;
        this.customDate = null;
    }

    setCustomDate() {
        this.reschedule.appointment_id = 0;
        this.reschedule.date = this.customDate;
        this.selectedNewPkg = this.package_dates[this.package_dates.length-1];
    }

    toPackage() {
        this.router.navigate(['settings/package-list', {id: this.packages.id, openForm: 'yes'}]);
    }

    back() {
        this.router.navigate(['appointment-list']);
    }

    selectedDescription() {
        console.log('selectedNewPkg=', this.selectedNewPkg);
        if (this.reschedule.date) {
            return this.appointmentService.formatDate(this.reschedule.date, true) + ' ' + this.appointmentService.formatTime(this.packages.start_time) + ' - ' + this.appointmentService.formatTime(this.packages.end_time);
        }
        return '-';
    }

    complete() {
        if (this.reschedule.appointment_id > 0)
            this.appointmentService.saveReschedulePackage();
        else
            this.appointmentService.saveReschedule();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
