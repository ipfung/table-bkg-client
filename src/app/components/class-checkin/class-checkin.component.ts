import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute, Router} from "@angular/router";
import {Lemonade} from "../../service/lemonade.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {isAfter, subMinutes} from "date-fns";

@Component({
    selector: 'app-class-checkin',
    providers: [MessageService, ConfirmationService],
    templateUrl: './class-checkin.component.html',
    styleUrls: ['./class-checkin.component.scss']
})
export class ClassCheckinComponent implements OnInit {
    loading = true;

    // different student will be in the same appointmentId.
    appointmentId = 0;

    pkg = {
        id: 0,
        name: 'Loading...',
        trainer: 'Loading...',
        room: 'Loading...',
        room_color: 'Loading...',
        start_time: null,
        end_time: null
    };
    bookings: any;
    isManager = false;
    supportFinance = false;
    checkInBeforeMinute = 15;

    submitting: boolean;
    saved: boolean;

    constructor(public appointmentService: AppointmentService, private confirmationService: ConfirmationService, public messageService: MessageService, private translateService: TranslateService, public lemonade: Lemonade, private route: ActivatedRoute, private router: Router) {
    }

    ngOnInit(): void {
        const appointmentId = this.route.snapshot.paramMap.get('id');
console.log('appointmentId=', appointmentId);
        if (appointmentId) {
            this.appointmentId = parseInt(appointmentId);
        } else {
            this.router.navigate(['/appointment-list']);
        }
        this.loadData();
    }


    loadData() {
//console.log('date range2===', this.rangeDates);
            this.loading = true;

            this.appointmentService.getBookings({
                appointmentId: this.appointmentId
            }).subscribe(res => {
                this.bookings = res.data;
                this.isManager = res.manager;
                this.supportFinance = res.supportFinance;
                this.checkInBeforeMinute = res.checkInBeforeMinute;
                for (const b of this.bookings) {
                    b.attendance = 'attend';   // make attend to true as default.
                    b.remark = '';
                }
                const bkg = this.bookings[0];
                this.pkg = {
                    id: bkg.package_id,
                    name: bkg.package_name,
                    trainer: bkg.user_name,
                    room: bkg.name,
                    room_color: bkg.color,
                    start_time: bkg.start_time,
                    end_time: bkg.end_time
                };
                this.loading = false;
            });
    }

    isPaid(appointment) {
        return appointment.payment_status === 'paid';
    }

    duration(appointment) {
        return this.lemonade.duration(appointment.start_time, appointment.end_time);
    }

    /**
     * copied from appointment-list
     * @param booking
     */
    ableCheckinCourse(booking) {
        const start_time = new Date(booking.start_time);
        const before = subMinutes(start_time, this.checkInBeforeMinute);
// console.log('start_time=', start_time, before, after, managerAfter);
        // check is now between time.
        return !booking.loading && !booking.checkin && booking.package_id > 0 && this.isManager && isAfter(new Date(), before);
    }

    alreadyCheckin(booking) {
        return booking.checkin;
    }

    save() {
        let data = [];
        for (const b of this.bookings) {
            if (!this.alreadyCheckin(b)) {
                data.push({
                    attendance: b.attendance,
                    booking_id: b.id,
                    remark: b.remark
                });
            }
        }
        if (data.length <= 0) {
            this.lemonade.error(this.messageService, {
                error: 'Already checked-in or no data to be saved'
            });
            return;
        }
        this.translateService.get(['Save', 'Error']).subscribe( res => {
            this.confirmationService.confirm({
                message: res['Save'] + '?',
                accept: () => {
                    this.submitting = true;
                    this.appointmentService.bulkPunchIn(this.appointmentId, {data: data}).subscribe(res => {
                        this.submitting = false;
                        this.saved = true;
                    });
                }
            });
        });
    }
}
