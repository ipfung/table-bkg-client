import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AppointmentService} from "../../service/appointmentservice";
import {ConfirmationService, MessageService} from "primeng/api";
import {Lemonade} from "../../service/lemonade.service";
import {endOfMonth, isBefore, isSameDay} from "date-fns";
import {addDays} from "@fullcalendar/core/internal";

@Component({
    selector: 'app-order-appointment-form',
    providers: [MessageService, ConfirmationService],
    templateUrl: './order-appointment-form.component.html',
    styleUrls: ['./order-appointment-form.component.scss']
})
export class OrderAppointmentFormComponent implements OnInit {
    @Input()
    order: any;
    @Output() orderChange = new EventEmitter<number>();

    @Input() showDialog: boolean;
    @Output() showDialogChange = new EventEmitter<boolean>();

    order_type: string;

    minDate: Date;
    maxDate: Date;
    nonWorkingDates: Date[];

    timeInformation: any;
    sessions = [];
    services = [];
    rooms = [];
    statuses = [];
    day_of_weeks = [];
    customers: any[];
    trainers: any[];
    times: any[] = [];
    submitted: boolean;
    freeTimeSlots = [];
    freeTimes: any[] = [];
    groupLesson: any;
    submittingModal: boolean;
    noOfSession: number;

    constructor(private appointmentService: AppointmentService, public messageService: MessageService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.newAppointment();
    }

    newAppointment() {
// console.log('newAppointment123=', this.showDialog);
        if (!this.showDialog) {
            this.order_type = 'free_token';    // free_token = 大班
            this.timeInformation = {...{}, ...this.appointmentService.defaultAppointment.timeInformation};
            this.timeInformation.customerId = this.order.customer_id;
            this.timeInformation.orderNo = this.order.order_number;
            this.timeInformation.price = 0;
            this.trainers = this.order.trainers.filter((obj) => obj.rate_type == 3);   // 3=ONE_TO_ONE_MONTHLY
            if (this.order.token_quantity <= 0) {
                // no more hours, select group.
                this.order_type = 'free_token';
            }
            const start_date = new Date(this.order.start_date),
                today = new Date();
            this.minDate = isBefore(today, start_date) ? start_date : today;
            this.maxDate = new Date(this.order.end_date);
            // for form, this wastes memory if user doesn't open the form.
            this.appointmentService.getRooms().subscribe(res => {
                this.rooms = res.data;
            });
            this.appointmentService.getServices().subscribe(res => {
                this.services = res.data;
                console.log('appointmentService this.services=', this.services);
                this.loadSessions(null);
                this.loadCalendar(null);
            });
        }
    }

    loadSessions(e) {
        const service = this.services.find(el => el.id == this.timeInformation.serviceId);
        this.timeInformation.serviceId = service.id;
        if (this.isGroupSession()) {
            this.sessions = service.sessions;
// console.log('this.timeInformation obj11=', this.timeInformation);
            this.noOfSession = this.order.free_no_of_session;
// console.log('this.timeInformation.noOfSession=', this.noOfSession);
// console.log('this.timeInformation obj11222=', this.timeInformation);
        } else {
// console.log('loadSessions this.services=', this.services);
            if (this.services.length > 0) {
                this.noOfSession = service.sessions[0].code;
// console.log('this.timeInformation.noOfSession2222=', this.noOfSession);

// console.log('cus_max_order_duration333 token_quantity=', this.order.token_quantity, this.order.no_of_session)
                let sessions = [],   // create a new array to store max session.
                    cus_max_order_duration = this.order.token_quantity * this.order.no_of_session * service.session_min;
// console.log('cus_max_order_duration333=', cus_max_order_duration, service.sessions[service.sessions.length - 1].duration)
                if (cus_max_order_duration < service.sessions[service.sessions.length - 1].duration) {
                    // resp.sessions contains 'all' available
                    for (const key of service.sessions) {
                        // check if customer remaining hour still can book which duration.
                        if (cus_max_order_duration >= key.duration) {
                            sessions.push(key);
                        }
                    }
                    this.sessions = sessions;
                } else {
                    this.sessions = service.sessions;
                }
            } else {
                this.sessions = [];
            }
        }
    }

    loadTime(evt) {
        if (this.isGroupSession()) {
            this.loadFreeTimeslotByDate();
        } else {
            if (this.timeInformation.date && this.noOfSession && this.timeInformation.customerId > 0 && this.timeInformation.roomId > 0) {
                this.timeInformation.noOfSession = this.noOfSession;
                this.appointmentService.getTimeslotsByDate(this.timeInformation).subscribe(res => {
                    if (res.success == false) {
                        this.lemonade.error(this.messageService, res);
                        this.times = [];
                    } else {
                        this.times = res.data[0].freeslots;
                        this.timeInformation.sessionInterval = res.sessionInterval;
                    }
                });
            } else {
                this.times = [];
            }
        }
    }

    loadNonWorkDates(evt: any) {
        if (this.isGroupSession()) {
            this.loadFreeNonWorkDates(evt)
        } else {
            // load holiday?
        }
    }

    loadFreeTimeslotByDate() {
        const d = this.timeInformation.date;
        this.freeTimes = [];
        for (const t of this.freeTimeSlots) {
            const sd = new Date(t.start_time);
            if (isSameDay(d, sd)) {
                this.freeTimes.push(t);
            }
        }
    }

    selectFreeTime() {
        if (this.groupLesson) {
            if ((this.groupLesson.package.total_space - this.groupLesson.no_of_booked) <= 0) {
                return;
            }
            this.timeInformation.appointment_id = this.groupLesson.id;
        }
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

    hideDialog() {
        this.showDialog = false;
        this.showDialogChange.emit(this.showDialog);
    }

    saveOrderAppointment() {
        this.submitted = true;
        const timeInfo = this.timeInformation;

        console.log('save this.timeInformation=', timeInfo);
        if (!timeInfo.orderNo)
            return;
        if (!timeInfo.customerId || timeInfo.customerId <= 0)
            return;
        if (this.noOfSession <= 0)
            return;
        if (this.isGroupSession()) {
            if (!timeInfo.appointment_id || timeInfo.appointment_id <= 0)
                return;
        } else {
            if (!timeInfo.trainerId || timeInfo.trainerId <= 0)
                return;
            if (!timeInfo.roomId || timeInfo.roomId <= 0)
                return;
            if (!timeInfo.date)
                return;
            if (timeInfo.time == undefined)
                return;
        }
        let data = {
            ...timeInfo, ...{
                date: this.lemonade.formatPostDate(timeInfo.date),
            }
        };
        const me = this;
        me.submittingModal = true;   // show submitting modal after validation.

        me.appointmentService.submit(data, function(res) {
            if (res.success == true) {
                me.messageService.add({
                    severity: 'success',
                    summary: 'Lesson booked',
                    detail: 'Booking is completed.'
                });
                me.hideDialog();
                // clean up after hide dialog.
                me.orderChange.emit(1);
                this.submitted = false;
            } else {
                me.lemonade.error(me.messageService, res);
            }
            me.submittingModal = false;   // hide modal.
        });
    }

    loadCalendar(e) {
// console.log('loadCalendar e===', e, this.isGroupSession());
        this.loadSessions(null);
        if (this.isGroupSession()) {
            //
            this.timeInformation.trainerId = 0;
            this.timeInformation.roomId = 0;
            this.appointmentService.getTimeslotsForGroupEvent(this.noOfSession, this.timeInformation.serviceId).subscribe(res => {
                this.freeTimeSlots = res['data'];
                let sd = new Date();
                if (this.freeTimeSlots && this.freeTimeSlots.length > 0) {
                    for (const t of this.freeTimeSlots) {
                        sd = new Date(t.start_time);
                        break;
                    }
                } else {
                    this.timeInformation.date = null;
                    this.timeInformation.time = null;
                }
                this.loadFreeNonWorkDates({
                    year: sd.getFullYear(),
                    month: 1+sd.getMonth()
                });
            });
        } else {
            this.nonWorkingDates = [];
        }
    }

    isGroupSession() {
        return this.order_type === 'free_token';
    }
}
