import { Injectable } from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {ApiService} from "./api.service";
import {TranslateService} from "@ngx-translate/core";
import { enUS, zhHK } from 'date-fns/locale'
import {Lemonade} from "./lemonade.service";
import {AuthService} from "./auth.service";
import {environment} from "../../environments/environment";
import {isSameDay} from "date-fns";
import {DeviceDetectorService} from "ngx-device-detector";

@Injectable()
export class AppointmentService {
    static readonly APPOINTMENT_SESSION = 'user.preferred.appointment';
    static readonly APPOINTMENT_EXPIRY_TIME = 'user.preferred.appointment_expiry_time';
    static readonly EXPIRY_TIME = 8;     // hour

    lang: any;

    // for display only and should be retrieved from server
    // public readonly tableSessions = [
    //     {name: '1 Hour', code: 2, hour: 1},
    //     {name: '1.5 Hour', code: 3, hour: 1.5},
    //     {name: '2 Hours', code: 4, hour: 2},
    //     {name: '2.5 Hours', code: 5, hour: 2.5},
    //     {name: '3 Hours', code: 6, hour: 3},
    // ];

    /**
     * serviceSelection, set to true if client needs different 'duration' setup.
     * true = show service-selection page as step 1.
     * false = don't show service-selection page and show booking-time-range as step 1.
     */
    readonly serviceSelection = false;
    /**
     * paymentSelection, set to true if client needs payment gateway.
     * true = show payment-form.
     * false = don't show payment-form and show payment-confirmation directly.
     */
    readonly paymentSelection = environment.payment;

    readonly isApp = environment.isApp;

    validOrder: any;
    /**
     * service object that contains service's name, price...etc
     * it may also contain trainer object in it.
     */
    selectedService: any;
    /**
     * tableSessions, the sessions for user to select.
     * it will be retrieved from server side based on Service's duration & min_duration.
     */
    tableSessions: any[];

    readonly defaultAppointment = {
        timeInformation: {
            serviceId: 1,
            roomId: 0,
            trainerId: 0,
            date: '',
            noOfSession: 2,  // min 2 session = 1 hour.
            sessionInterval: 0,  // from server side
            time: ''
        },
        personalInformation: {
            trainers: null,
            firstname: '',
            lastname: '',
            email: ''
        },
        paymentInformation: {
            method: '',
            price: 0,
            commission: 0,
            status: 'pending',
            // cardholderName:'',
            // cardholderNumber:'',
            // date:'',
            // cvv:'',
            remember:false
        }
    };

    private appointmentInformation: any;

    reschedule = {
        appointment: null,
        appointment_id: 0,
        bookId: 0,
        date: '',
        time: '',
        noOfSession: 2,  // from server side
        sessionInterval: 0,  // from server side
    };

    subscription: Subscription;

    private paymentComplete = new Subject<any>();

    paymentComplete$ = this.paymentComplete.asObservable();

    deviceInfo = null;
    private needRefresh: boolean;

    constructor(public api: ApiService, private translateService: TranslateService, private lemonade: Lemonade, private authService: AuthService, private deviceService: DeviceDetectorService) {
        this.deviceInfo = this.deviceService.getDeviceInfo();
        // const isMobile = this.deviceService.isMobile();
        // const isTablet = this.deviceService.isTablet();
        // const isDesktopDevice = this.deviceService.isDesktop();
        // console.log(this.deviceInfo);
        // console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
        // console.log(isTablet);  // returns if the device us a tablet (iPad etc)
        // console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
        this.lang = this.translateService.getDefaultLang() === 'zh' ? zhHK : enUS;
        // cleanup when logout.
        this.subscription = this.authService.logoutComplete$.subscribe(obj => {
            if (obj.message == 'logout') {
                this.clearUserSelection();
            }
        });
    }

    private prepareDefaultAppointment() {
        this.appointmentInformation = { ...this.defaultAppointment };
    }

    hasValidPayment() {
        // if paymentMethods.length is 1, just go to payment gateway directly.
        return (this.needPayment() && this.lemonade.paymentMethods.length > 1);
    }

    needPayment() {
        // if paymentMethods.length is 1, just go to payment gateway directly.
        return (this.paymentSelection && !this.validOrder);
    }

    formatPostDate(d) {
        return this.lemonade.formatPostDate(d);
    }

    getBookings(params) {
        return this.api.get('api/booking', params);
    }

    punchIn(bookId) {
        return this.api.post('api/booking-checkin/' + bookId, {
            t: Math.floor(new Date().getTime()/1000.0)
        });
    }

    bulkPunchIn(appointmentId, data) {
        let params = {
            t: Math.floor(new Date().getTime()/1000.0)
        };
        return this.api.post('api/course-checkin/' + appointmentId, {
            ...params,
            ...data
        });
    }

    cancel(bookId) {
        return this.api.update('api/booking-cancel/' + bookId, {
            t: Math.floor(new Date().getTime()/1000.0)
        });
    }

    approve(bookId) {
        return this.api.update('api/booking-approve/' + bookId, {
            t: Math.floor(new Date().getTime()/1000.0)
        });
    }

    reject(bookId) {
        return this.api.update('api/booking-reject/' + bookId, {
            t: Math.floor(new Date().getTime()/1000.0)
        });
    }

    takeLeave(bookId) {
        return this.api.update('api/take-leave/' + bookId, {
            t: Math.floor(new Date().getTime()/1000.0)
        });
    }

    updateUserSelection() {
        let dt = new Date();
        dt.setHours( dt.getHours() + AppointmentService.EXPIRY_TIME );
// console.log('updateUserSelection=', dt.toString(), ', ', Math.floor(dt.getTime()/1000.0));
        sessionStorage.setItem(AppointmentService.APPOINTMENT_EXPIRY_TIME, Math.floor(dt.getTime()/1000.0)+"");
        sessionStorage.setItem(AppointmentService.APPOINTMENT_SESSION, JSON.stringify(this.appointmentInformation));
    }

    clearUserSelection() {
        sessionStorage.removeItem(AppointmentService.APPOINTMENT_EXPIRY_TIME);
        sessionStorage.removeItem(AppointmentService.APPOINTMENT_SESSION);
        // clear data.
        this.appointmentInformation = undefined;
        this.tableSessions = null;
    }

    isAppointmentValid() {
        let expiry = sessionStorage.getItem(AppointmentService.APPOINTMENT_EXPIRY_TIME);
        if (expiry) {
            let now = Math.floor(new Date().getTime() / 1000.0);
            return (parseFloat(expiry) > now);
        }
        return false;
    }

    getAppointmentInformation() {
        if (this.isAppointmentValid()) {
            // get from storage. FIXME how to prevent localStorage being removed issue?
            this.appointmentInformation = JSON.parse(sessionStorage.getItem(AppointmentService.APPOINTMENT_SESSION));
        }
        if (this.appointmentInformation == undefined) {
            this.prepareDefaultAppointment();
        }
        if (!this.tableSessions || !this.selectedService || this.needRefresh) {
            this.api.get('api/user-service').subscribe(resp => {
                this.needRefresh = false;
                this.selectedService = resp;
                this.appointmentInformation.timeInformation.serviceId = resp.id;
                if (resp.trainers) {
                    this.validOrder = {
                        trainers: resp.trainers,
                        orderNo: resp.order_number,
                        availableTokenQty: resp.token_quantity,
                        perSession: resp.no_of_session * resp.session_min,
                        freeQty: resp.free_quantity,
                        freeSession: resp.free_no_of_session
                    };
                    this.setValidOrder();
                    this.selectedService.requiredTrainer = true;
                } else if (resp.trainer) {
                    this.appointmentInformation.timeInformation.trainerId = resp.trainer.id;
                }
                if (resp.room) {
                    this.appointmentInformation.timeInformation.roomId = resp.room.id;
                }
                if (resp.trainers) {
                    let sessions = [],   // create a new array to store max session.
                        cus_max_order_duration = this.validOrder.availableTokenQty * this.validOrder.perSession;
                    if (resp.token_quantity > 0) {
                        // resp.sessions contains 'all' available
                        for (const key of resp.sessions) {
                            // check if customer remaining hour still can book which duration.
                            if (cus_max_order_duration >= key.duration) {
                                sessions.push(key);
                            }
                        }
                    }
                    this.tableSessions = sessions;
                } else {
                    this.tableSessions = resp.sessions;
                }
            });
        } else {
            if (this.validOrder && !this.appointmentInformation.personalInformation.trainers) {
                this.setValidOrder();
            }
        }
        return this.appointmentInformation;
    }

    setValidOrder() {
        this.appointmentInformation.timeInformation.orderNo = this.validOrder.orderNo;
        this.appointmentInformation.timeInformation.availableTokenQty = this.validOrder.availableTokenQty;
        this.appointmentInformation.personalInformation.trainers = this.validOrder.trainers;
        this.appointmentInformation.personalInformation.freeQty = this.validOrder.freeQty;
        this.appointmentInformation.personalInformation.freeSession = this.validOrder.freeSession;
    }

    getRescheduleTimeslots(trainerDate?) {
        let params = {
            bookId: this.reschedule.bookId
        };
        if (trainerDate) {
            params = {...params, ...{
                the_date: this.lemonade.formatPostDate(trainerDate)
            }};
        }
        return this.api.get('api/appointment', params);
    }

    getReschedulePackageTimeslots() {
        let params = {
            bookId: this.reschedule.bookId,
            packageId: this.reschedule.appointment.package_id
        };
        return this.api.get('api/reschedule-package/' + params.packageId, params);
    }

    getRooms() {
        return this.api.get('api/rooms', {
            status: 1001
        });
    }

    getPackageTimeslot(service_id, noOfSession, date) {
        return this.api.get('api/package-timeslots', {
            service_id: service_id,
            noOfSession: noOfSession,
            date: this.lemonade.formatPostDate(date)
        });
    }

    getActiveCustomers(query?) {
        let params = {
            status: 'active',
            role: 'Student'
        };
        if (query && query != '') {
            params = {...params, ...{
                q: query
            }};
        }
        return this.api.get('api/users', params);
    }

    /**
     * able to search user based on logged user permission, including active/suspend users.
     * @param query
     */
    getUsers(query?) {
        let params = {
        };
        if (query && query != '') {
            params = {...params, ...{
                    name: query
                }};
        }
        return this.api.get('api/users', params);
    }

    getActivePackages(params?) {
        return this.api.get('api/packages', {
            ...{
                status: 1001,
                'query_for': 'appointment'
            }, ...params
        });
    }

    getActiveTrainers() {
        return this.api.get('api/users', {
            status: 'active',
            role: 'Trainer'
        });
    }

    generateLessonDates(packageId) {
        return this.api.get('api/gen-package-lessons/' + packageId);
    }

    getPackageDates(params) {
        return this.api.post('api/package-dates', params);
    }

    getServices() {
        return this.api.get('api/services', {
            status: 1001
        });
    }

    /**
     * for end user book real time appointments only, as it checks requiredTrainer.
     */
    getTimeslots() {
        const timeInfo = this.appointmentInformation.timeInformation;
        let params = {
            noOfSession: timeInfo.noOfSession,
            service_id: timeInfo.serviceId,
        };
        if (this.selectedService.requiredTrainer && timeInfo.trainerId > 0) {
            params = {...params, ...{
                trainer_id: timeInfo.trainerId
            }};
            if (timeInfo.trainerDate) {
                params = {...params, ...{
                    the_date: this.lemonade.formatPostDate(timeInfo.trainerDate)
                }};
            }
        }
        if (this.selectedService.requiredRoom && timeInfo.roomId) {
            params = {...params, ...{
                room_id: timeInfo.roomId
            }};
        }
        return this.api.get('api/appointment', params);
    }

    /**
     * for end user book real time appointments only, as it checks requiredTrainer.
     */
    getTimeslotsForGroupEvent(noOfSession, serviceId) {
        return this.api.get('api/group-event-packages', {
            no_of_session: noOfSession,
            service_id: serviceId,
        });
    }

    getTrainerNonWorkDates(trainerId, year, month) {
        return this.api.get('api/trainer-non-workdate/' + trainerId, {
            y: year,
            m: month
        });
    }

    getCourse(orderId) {
        return this.api.get('api/course/' + orderId);
    }

    getTimeslotsByDate(appointment) {
        return this.api.get('api/appointment', {
            the_date: this.lemonade.formatPostDate(appointment.date),
            noOfSession: appointment.noOfSession,
            customer_id: appointment.customerId,
            room_id: appointment.roomId,
            trainer_id: appointment.trainerId,
            service_id: appointment.serviceId
        });
    }

    complete() {
        const paymentInfo = this.appointmentInformation.paymentInformation;
        const data = {
            ...{
                paymentMethod: paymentInfo.method,
                paymentStatus: 'pending',   // always pending until payment gateway done
                price: paymentInfo.price
            }, ...this.appointmentInformation.timeInformation
        };
        const me = this;
        this.submit(data, function(res) {
            console.log('complete res=', res);
            if (res.success === true) {
                me.paymentComplete.next({...{
                        success: true,
                        pay_status: res.pay_status,
                        order_num: res.order_num
                    }, ...me.appointmentInformation});
                // clear after payment complete.
                me.clearUserSelection();
                this.needRefresh = true;
            } else {
                me.paymentComplete.next(res);
            }
        });
    }

    private isMobile() {
        return this.deviceService.isMobile() || this.deviceService.isMobile() || this.isApp;
    }

    checkout(orderNo) {
        if (this.needPayment()) {
            return this.api.url + 'checkout/' + orderNo + (this.isMobile() ? '?urlType=app' : '');
        } else {
            console.log('not support payment.');
            return null;
        }
    }

    makePayment(orderNo) {
        if (this.needPayment()) {
            return this.api.url + 'pay/' + orderNo + (this.isMobile() ? '?urlType=app' : '');
        } else {
            console.log('not support payment.');
            return null;
        }
    }

    submit(data, callback) {
        // submit to server.
        this.api.post('api/appointment', data).subscribe( res => {
            callback(res);
        });
    }

    saveReschedulePackage() {
        this.api.post('api/reschedule-package/' + this.reschedule.bookId, {
            appointment_id: this.reschedule.appointment_id
        }).subscribe( res => {
            console.log('reschedule package res=', res);
            if (res.success === true) {
                this.paymentComplete.next({...{
                        success: true,
                        room: res.room
                    }, ...this.reschedule});
            } else {
                this.paymentComplete.next(res);
            }
        });
    }

    saveReschedule() {
        this.api.post('api/reschedule/' + this.reschedule.bookId, this.lemonade.applyIf( {
            date: this.lemonade.formatPostDate(this.reschedule.date)
        }, this.reschedule)).subscribe( res => {
            console.log('reschedule res=', res);
            if (res.success === true) {
                this.paymentComplete.next({...{
                    success: true,
                    room: res.room
                }, ...this.reschedule});
            } else {
                this.paymentComplete.next(res);
            }
        });
    }

    /**
     * @param orderId
     * @param docType 'invoice' or 'receipt'
     */
    printInvoice(orderId, docType) {
        if (this.paymentSelection) {
            return this.api.html('api/' + docType + '/' + orderId);
        } else {
            console.log('not support payment.');
            return null;
        }
    }

    getLang() {
        return this.lang;
    }

    formatDate(date, showWeekNo?: boolean) {
        return this.lemonade.formatDate(date, showWeekNo);
    }

    formatDateTime(datetime: string) {
        return this.lemonade.formatDateTime(datetime);
    }

    formatPunchInTime(start_time: string, checkin_time: string) {
        const st = new Date(start_time),
            ct = new Date(checkin_time);
        if (isSameDay(st, ct))
            return this.lemonade.formatDateTime(checkin_time);
        return this.formatDate(checkin_time, false) + ' ' + this.lemonade.formatDateTime(checkin_time);
    }

    /**
     * copy from https://www.epochconverter.com/programming/#javascript
     * @param t
     */
    formatTime(t: number, date?) {
        return this.lemonade.formatTime(t, date);
    }

    getBookedDateTime(date, timeEpoch, sessionInterval, noOfSession) {
        if (date && timeEpoch && sessionInterval && noOfSession)
            return this.formatTime(timeEpoch, date) + " - " + this.formatTime(parseInt(timeEpoch, 10) + (noOfSession * sessionInterval));
        return '';
    }

    getSessionName(noOfSession, tableSessions?) {
        if (tableSessions == undefined) {
            tableSessions = this.tableSessions;
        }
        if (noOfSession && tableSessions && tableSessions.length > 0) {
            let timeLen = tableSessions.find(el => el.code == noOfSession);
            let name = timeLen.name;
            if (timeLen.hour > 0) {
                if (timeLen.minute != 30 && timeLen.minute != 0) {
                    this.translateService.get('hour Minutes', {
                        hour: timeLen.hour,
                        s: timeLen.hour > 1 ? 's' : '',
                        minute: timeLen.minute,
                        ms: timeLen.minute > 1 ? 's' : ''
                    }).subscribe(res => {
                        name = res;
                    });
                    return name;
                } else {
                    this.translateService.get('hour Hours', {
                        hour: timeLen.hour,
                        s: timeLen.hour > 1 ? 's' : ''
                    }).subscribe(res => {
                        name = res;
                    });
                    return name;
                }
            } else {
                this.translateService.get('N minutes', {
                    minute: timeLen.minute,
                    s: timeLen.minute > 1 ? 's' : ''
                }).subscribe(res => {
                    name = res;
                });
                return name;
            }
        }
        return '';
    }

    getPaymentMethodName(code) {
        if (this.lemonade.paymentMethods.length > 0) {
            let paymentMethod = this.lemonade.paymentMethods.find(el => el.code == code);
            return paymentMethod ? paymentMethod.name : '-';
        }
        return '';
    }

    getHourBySession(no_of_session) {
        const MIN_SESSION = 2;
        const session = (no_of_session  / MIN_SESSION);
        return session + ' Hour' + (session > 1 ? 's' : '');
    }
}

@Injectable()
export class AppointmentStepsGuardService implements CanActivate {
    constructor(private router: Router, private appointmentService: AppointmentService, private authService: AuthService) { }

    canActivate(route: ActivatedRouteSnapshot): Promise<boolean>|boolean {
        return new Promise((resolve, reject) => {
            this.authService.appointmentButton().then(res => {
                const canAccess = (res === AuthService.YES);
                if (!canAccess) {
                    this.router.navigate(['/appointment-list']);
                    resolve(false);
                }
            });
            const rpath = route.routeConfig.path,
                srv = this.appointmentService.selectedService;
            if (!srv && (rpath === 'confirmation' || rpath === 'payment' || rpath === 'datetime')) {
                this.router.navigate(['/appointment/']);
                resolve(false);
            }
            if (!this.appointmentService.serviceSelection) {
                const isValid = this.appointmentService.isAppointmentValid();
// console.log('AppointmentStepsGuardService isvalid=', isValid, route.routeConfig.path);
                if (!isValid) {
                    this.router.navigate(['/appointment/time-range']);
                }
                const isServiceSelectionPage = route.routeConfig.path === 'service-selection';
                if (isServiceSelectionPage) {
                    this.router.navigate(['/appointment/time-range']);
                }
                resolve(isValid);
            }
            resolve(true);
        });
    }
}
