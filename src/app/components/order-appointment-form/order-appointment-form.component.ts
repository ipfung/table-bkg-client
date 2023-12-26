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

    appointment: any;
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

    constructor(private appointmentService: AppointmentService, public messageService: MessageService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.newAppointment();
    }

    newAppointment() {
        this.order_type = 'token';
        this.appointment = JSON.parse(JSON.stringify(this.appointmentService.defaultAppointment));
        this.appointment.timeInformation.customerId = this.order.customer_id;
        this.appointment.timeInformation.orderNo = this.order.order_number;
        this.appointment.timeInformation.price = 0;
        this.trainers = this.order.trainers;
        if (this.order.token_quantity <= 0) {
            // no more hours, select group.
            this.order_type = 'free_token';
        }
        const start_date = new Date(this.order.start_date),
            today = new Date();
        this.minDate = isBefore(today, start_date) ? start_date : today;
        this.maxDate = new Date(this.order.end_date);
        // for form, this wastes memory if user doesn't open the form.
        this.appointmentService.getRooms().subscribe( res => {
            this.rooms = res.data;
        });
        this.appointmentService.getServices().subscribe(res => {
            const services = this.services = res.data;
            this.appointment.timeInformation.serviceId = services[0].id;
            this.appointment.timeInformation.noOfSession = services[0].sessions[0].code;
            this.loadSessions(null);
        });
    }

    loadSessions(e) {
        if (this.services.length > 0) {
            let service = this.services.find(el => el.id == this.appointment.timeInformation.serviceId);

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

    loadTime(evt) {
        if (this.isGroupSession()) {
            this.loadFreeTimeslotByDate();
        } else {
            if (this.appointment.timeInformation.date && this.appointment.timeInformation.noOfSession && this.appointment.timeInformation.customerId > 0 && this.appointment.timeInformation.roomId > 0) {
                this.appointmentService.getTimeslotsByDate(this.appointment.timeInformation).subscribe(res => {
                    if (res.success == false) {
                        this.lemonade.error(this.messageService, res);
                        this.times = [];
                    } else {
                        this.times = res.data[0].freeslots;
                        this.appointment.timeInformation.sessionInterval = res.sessionInterval;
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
        const d = this.appointment.timeInformation.date;
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
            this.appointment.timeInformation.appointment_id = this.groupLesson.id;
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
        const timeInfo = this.appointment.timeInformation;

        if (!timeInfo.orderNo)
            return;
        if (!timeInfo.customerId || timeInfo.customerId <= 0)
            return;
        if (timeInfo.noOfSession <= 0)
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
                me.newAppointment();
            } else {
                me.lemonade.error(me.messageService, res);
            }
            me.submittingModal = false;   // hide modal.
        });
    }

    loadCalendar() {
        if (this.isGroupSession()) {
            //
            this.appointment.timeInformation.noOfSession = this.order.free_no_of_session;
            this.appointment.timeInformation.trainerId = 0;
            this.appointment.timeInformation.roomId = 0;
            this.appointmentService.getTimeslotsForGroupEvent(this.appointment.timeInformation.noOfSession, this.appointment.timeInformation.serviceId).subscribe(res => {
                this.freeTimeSlots = res['data'];
                let sd = new Date();
                if (this.freeTimeSlots && this.freeTimeSlots.length > 0) {
                    for (const t of this.freeTimeSlots) {
                        sd = new Date(t.start_time);
                        break;
                    }
                } else {
                    this.appointment.timeInformation.date = null;
                    this.appointment.timeInformation.time = null;
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
