import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {addDays, intervalToDuration, isWithinInterval, subHours} from "date-fns";
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-appointment-list',
    providers: [MessageService, ConfirmationService],
    templateUrl: './appointment-list.component.html',
    styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {
    loading = true;

    pageHeader = '';

    showCustomer = false;
    showTrainer = false;
    bookings: any;
    newable: boolean;

    // search fields
    rangeDates: Date[];
    users: any[];
    userObj: any;
    aptStatus: any = '';

    // appointment form
    appointment: any;
    services = [];
    sessions = [];
    rooms = [];
    statuses = [];
    day_of_weeks = [];
    customers: any[];
    trainers: any[];
    times: any[] = [];
    lessons: any[] = [];
    holidays: any[];
    packages: any[];
    selectedPackage: any;
    minExpiryDate: Date;

    submitted = false;
    formDialog = false;
    formHeader = 'Create Form';
    requiredTrainer = false;
    supportPackages = false;
    supportFinance = false;
    submitting: boolean;
    selectedCustomerId = 0;

    timeslotSetting: string;

    constructor(public appointmentService: AppointmentService, private router: Router, private confirmationService: ConfirmationService, public messageService: MessageService, private translateService: TranslateService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.rangeDates = [new Date(), addDays(new Date(), 14)];
        this.loadData();
        this.statuses = this.lemonade.appointmentStatus;
    }

    loadData() {
//console.log('date range2===', this.rangeDates);
        if (this.rangeDates.length == 2 && this.rangeDates[1]) {
            this.loading = true;
            let params = {
                from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
                to_date: this.lemonade.formatPostDate(this.rangeDates[1])
            }
            if (this.userObj) {
                params = {...params, ...{ownerId: this.userObj.id}};
            }
            if (this.aptStatus) {
                params = {...params, ...{status: this.aptStatus}};
            }

            this.appointmentService.getBookings(params).subscribe(res => {
                this.bookings = res.data;
                this.showCustomer = res.showCustomer;
                this.showTrainer = res.showTrainer;
                this.pageHeader = this.showCustomer ? 'Appointment' : 'My Booking';
                this.newable = res.newable;
                this.requiredTrainer = res.requiredTrainer;
                this.supportPackages = res.supportPackages;
                this.supportFinance = res.supportFinance;
                this.timeslotSetting = res.timeslotSetting;
                this.loading = false;
            });
        }
    }

    searchUsers(e) {
        this.appointmentService.getUsers(e.query).subscribe( res => {
            this.users = res.data;
        });
    }

    duration(appointment) {
        return this.lemonade.duration(appointment.start_time, appointment.end_time);
    }

    isPaid(appointment) {
        return appointment.payment_status === 'paid';
    }

    makePayment(appointment) {
        alert("to be implemented");
    }

    ableCheckin(booking) {
        const start_time = new Date(booking.start_time);
        const hour_ago = subHours(start_time, 1);
        // check is now between 1 hour before of start time and start time itself.
        return !booking.loading && !booking.checkin && isWithinInterval(new Date(), { start: hour_ago, end: new Date(booking.end_time) });
    }

    punchIn(booking) {
        if (this.ableCheckin(booking)) {
            this.translateService.get(['Check in now?', 'Error']).subscribe( res => {
                this.confirmationService.confirm({
                    message: res['Check in now?'],
                    accept: () => {
                        booking.loading = true;
                        this.appointmentService.punchIn(booking.id).subscribe(res => {
                            // console.log('checkin=', res);
                            if (res.success == true) {
                                booking.checkin = res.checkin;
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: res['Error'],
                                    detail: res.error
                                });
                            }
                            booking.loading = false;
                        });
                    }
                });
            });
        }
    }

    /**
     * pending or approved = valid.
     * rejected or canceled = invalid.
     * @param appointment
     */
    isValidStatus(appointment) {
        return appointment.loading !== true && (appointment.status == 'approved' || appointment.status == 'pending');
    }

    /**
     * action must be done X hour before start_time
     * @param appointment
     */
    canAmend(appointment) {
        const now = new Date(),
            start_time = (new Date(appointment.start_time));
        const hour48_ago = subHours(start_time, 48);
        return (now < hour48_ago && this.isValidStatus(appointment));
    }

    reschedule(appointment) {
        appointment.timeslotSetting = this.timeslotSetting;
        this.appointmentService.reschedule.appointment = appointment;
        this.router.navigate(['/reschedule', appointment.id]);
    }

    isAbleApprove(appointment) {
        return appointment.status == 'pending' && this.showCustomer == true;
    }

    reject(booking) {
        this.translateService.get(['Reject booking?', 'Warning']).subscribe( res => {
            this.confirmationService.confirm({
                message: res['Reject booking?'],
                accept: () => {
                    booking.loading = true;
                    this.appointmentService.reject(booking.id).subscribe(res => {
                        // console.log('checkin=', res);
                        if (res.success == true) {
                            booking.status = res.status;
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: res['Error'],
                                detail: res.error
                            });
                        }
                        booking.loading = false;
                    });
                }
            });
        });

    }

    approve(booking) {
        this.translateService.get(['Approve booking?', 'Warning']).subscribe( res => {
            this.confirmationService.confirm({
                message: res['Approve booking?'],
                accept: () => {
                    booking.loading = true;
                    this.appointmentService.approve(booking.id).subscribe(res => {
                        // console.log('checkin=', res);
                        if (res.success == true) {
                            booking.status = res.status;
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: res['Error'],
                                detail: res.error
                            });
                        }
                        booking.loading = false;
                    });
                }
            });
        });
    }

    /**
     * only unpaid appointment can be canceled.
     * @param booking
     */
    cancel(booking) {
        if (!this.isPaid(booking)) {
            this.translateService.get(['Are you sure to cancel booking?', 'Warning']).subscribe( res => {
                this.confirmationService.confirm({
                    message: res['Are you sure to cancel booking?'],
                    accept: () => {
                        booking.loading = true;
                        this.appointmentService.cancel(booking.id).subscribe(res => {
                            // console.log('checkin=', res);
                            if (res.success == true) {
                                booking.status = res.status;
                            } else {
                                this.messageService.add({
                                    severity: 'error',
                                    summary: res['Error'],
                                    detail: res.error
                                });
                            }
                            booking.loading = false;
                        });
                    }
                });
            });
        }
    }

    openNew() {
        this.formHeader = "Create Form";
        this.submitted = false;
        this.formDialog = true;
        this.prepareForForm();
        // make a new appointment information if it is empty.
        this.selectedPackage = null;
        this.selectedCustomerId = 0;
        this.appointment = {...this.appointmentService.defaultAppointment};
        this.appointment.isPackage = false;
        this.appointment.timeInformation.status = this.statuses[0].code;
        this.appointment.timeInformation.notify_parties = true;
        this.appointment.packageInfo = {
            quantity: 4,
            repeatable: true,   // default to true.
            recurring: [1]   // default to Monday.
        };
    }

    prepareForForm() {
        // for form, this wastes memory if user doesn't open the form.
        this.appointmentService.getRooms().subscribe( res => {
            this.rooms = res.data;
        });
        if (this.showTrainer) {
            this.appointmentService.getActiveTrainers().subscribe(res => {
                this.trainers = res.data;
            });
        }
        this.appointmentService.getActivePackages().subscribe(res => {
            this.packages = res.data;
        });
        this.appointmentService.getServices().subscribe(res => {
            this.services = res.data;
            this.appointment.timeInformation.serviceId = this.services[0].id;
            this.appointment.timeInformation.noOfSession = this.services[0].sessions[0].code;
            this.loadSessions(null);
        });
        this.day_of_weeks = this.lemonade.weeks;
    }

    getWeekNo(id) {
        let week = this.day_of_weeks.find(el => el.id == id);
        return week.name;
    }

    loadSessions(e) {
        if (this.services.length > 0) {
            let service = this.services.find(el => el.id == this.appointment.timeInformation.serviceId);
            this.sessions = service.sessions;
        } else {
            this.sessions = [];
        }
    }

    loadPackage() {
        if (this.selectedPackage && this.appointment.timeInformation.package_id != this.selectedPackage.id) {
            this.lessons = [];
            this.holidays = undefined;
            this.appointment.timeInformation = {
                ...this.appointment.timeInformation, ...{
                    serviceId: this.selectedPackage.service_id,
                    trainerId: this.selectedPackage.trainer_id,
                    roomId: this.selectedPackage.room_id,
                    noOfSession: this.selectedPackage.no_of_session,
                    date: this.selectedPackage.start_date ? new Date(this.selectedPackage.start_date) : null,
                    time: this.selectedPackage.start_time ? this.selectedPackage.start_time : null,
                    status: this.statuses[0].code
                }
            };
            this.appointment.packageInfo = {...this.selectedPackage};
            this.appointment.packageInfo.recurring = JSON.parse(this.selectedPackage.recurring).repeat;
            this.appointment.isPackage = true;
            this.appointment.timeInformation.package_id = this.selectedPackage.id;
            if (this.selectedPackage.start_date) {
                this.loadPackageTime();
                this.loadLessonDates();
            }
        }
    }

    clearPackage() {
        this.appointment.timeInformation.package_id = 0;
        this.selectedPackage = null;
    }

    loadPackageTime() {
        // always to package info to load data, especially the packageInfo.start_date because timeInformation.date could be changed manually.
        this.appointmentService.getPackageTimeslot(this.selectedPackage.service_id, this.selectedPackage.no_of_session, new Date(this.selectedPackage.start_date)).subscribe(res => {
            this.times = res.data;
            this.appointment.timeInformation.sessionInterval = res.sessionInterval;
        });
    }

    loadTime(e) {
        const customer = this.appointment.customer;
        if (customer && this.selectedCustomerId !== customer.id) {
            if (customer.settings && customer.settings.trainer && !this.selectedPackage) {
                const settings = customer.settings;
                this.translateService.get(['Is it a trainer course?', 'Error']).subscribe( res => {
                    this.confirmationService.confirm({
                        message: res['Is it a trainer course?'],
                        accept: () => {
                            this.appointment.timeInformation.trainerId = settings.trainer;
                            this.appointment.paymentInformation = {
                                price: settings.trainer_charge,
                                commission: settings.trainer_commission
                            };
                            if (settings.room)
                                this.appointment.timeInformation.roomId = settings.room;
                        }
                    });
                });
            } else {
                this.appointment.paymentInformation = {
                    price: 0,
                    commission: 0
                };
            }
            this.appointment.timeInformation.customerId = customer.id;
            this.selectedCustomerId = customer.id;
        }
        if (this.selectedPackage && this.selectedPackage.start_time) {
            this.loadPackageTime();
            return;
        }
        if (this.appointment.timeInformation.date && this.appointment.timeInformation.noOfSession && this.appointment.timeInformation.customerId > 0 && this.appointment.timeInformation.roomId > 0) {
            this.appointmentService.getTimeslotsByDate(this.appointment.timeInformation).subscribe(res => {
                this.lessons = [];
                this.holidays = undefined;
                if (res.success == false) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: res.error
                    });
                    this.times = [];
                } else {
                    this.times = res.data[0].freeslots;
                    this.appointment.timeInformation.sessionInterval = res.sessionInterval;
                }
                if (!this.selectedPackage) {
                    // reset for non-package.
                    this.appointment.timeInformation.time = undefined;
                    if (this.appointment.paymentInformation.commission <= 0)
                        this.appointment.paymentInformation.price = 0;
                }
            });
        } else {
            this.times = [];
        }
    }

    setPriceByTime(e) {
        if (this.appointment.paymentInformation.commission <= 0) {
            if (this.times.length > 0) {
                const theTime = this.times.find(el => el.time == this.appointment.timeInformation.time);
                this.appointment.paymentInformation.price = theTime.price;
                this.appointment.packageInfo.price = theTime.price * this.appointment.packageInfo.quantity;
            } else {
                this.appointment.paymentInformation.price = 0;
                this.appointment.packageInfo.price = 0;
            }
        }
    }

    hideDialog() {
        this.formDialog = false;
    }

    searchCustomers(e) {
        this.appointmentService.getActiveCustomers(e.query).subscribe( res => {
            this.customers = res.data;
        });
    }

    loadLessonDates() {
        if (!this.appointment.timeInformation.date) {
            this.submitted = true;
            return;
        }
        this.appointmentService.getPackageDates({
            start_date: this.lemonade.formatPostDate(this.appointment.timeInformation.date),
            dow: this.appointment.packageInfo.recurring,
            quantity: this.appointment.packageInfo.quantity
        }).subscribe(res => {
            this.lessons = res.data;
            this.holidays = res.holidays;
            if (!this.selectedPackage) {
                this.appointment.packageInfo.price = this.appointment.packageInfo.quantity * this.appointment.paymentInformation.price;
                if (this.appointment.paymentInformation.commission > 0) {
                    this.appointment.packageInfo.commission = this.appointment.packageInfo.quantity * this.appointment.paymentInformation.commission;
                }
            } else {
                this.minExpiryDate = new Date(this.lessons[this.lessons.length-1].date);
            }
        });
    }

    save() {
        this.submitted = true;
        const timeInfo = this.appointment.timeInformation;

        if (!timeInfo.customerId || timeInfo.customerId <= 0)
            return;
        if (timeInfo.serviceId <= 0)
            return;
        if (timeInfo.roomId <= 0)
            return;
        if (timeInfo.noOfSession <= 0)
            return;
        if (!timeInfo.date)
            return;
        if (timeInfo.time == undefined)
            return;
        let data = {
            ...timeInfo, ...{
                date: this.lemonade.formatPostDate(timeInfo.date),
                paymentMethod: 'onsite',
                price: this.appointment.paymentInformation.price,
                commission: this.appointment.paymentInformation.commission||0,
            }
        };
        if (this.appointment.isPackage === true) {
            const packageInfo = this.appointment.packageInfo;
            if (packageInfo.quantity <= 0)
                return;
            if (packageInfo.recurring.length == 0)
                return;
            if (this.lessons.length == 0) {
                this.loadLessonDates();
                return;
            }
            const lessonDates = this.lessons.map(function (obj) {
                return obj.date;
            });
            data = {...data, ...{
                    is_package: true,
                    recurring: {
                        cycle: 'weekly',
                        start_date: this.lemonade.formatPostDate(timeInfo.date),
                        // end_date = package expiry date, nullable.
                        end_date: (packageInfo.end_date && packageInfo.end_date instanceof Date) ? this.lemonade.formatPostDate(packageInfo.end_date) : null,
                        quantity: packageInfo.quantity,
                        repeat: packageInfo.recurring
                    },
                    lesson_dates: lessonDates,
                    repeatable: packageInfo.repeatable,
                    package_amount: packageInfo.price,
                    package_commission: packageInfo.commission
                }
            };
        }
        const me = this;
        this.submitting = true;   // show submitting modal after validation.

        this.appointmentService.submit(data, function(res) {
            if (res.success == true) {
                me.messageService.add({
                    severity: 'success',
                    summary: 'Appointment booked',
                    detail: 'Booking is completed.'
                });
                me.loadData();
                me.formDialog = false;
                // clean up
                me.appointment = null;
                me.holidays = undefined;
                me.lessons = undefined;
                me.selectedCustomerId = 0;
                me.selectedPackage = undefined;
            } else {
                me.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: res.error
                });
            }
            me.submitting = false;   // hide modal.
        });
    }

    calculateCustomerTotal(name) {
        let total = 0;

        if (this.customers) {
            for (let customer of this.customers) {
                if (customer.representative.name === name) {
                    total++;
                }
            }
        }

        return total;
    }
}
