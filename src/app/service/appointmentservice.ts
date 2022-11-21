import { Injectable } from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {ApiService} from "./api.service";
import {TranslateService} from "@ngx-translate/core";
import { enUS, zhHK } from 'date-fns/locale'
import {Lemonade} from "./lemonade.service";
import {AuthService} from "./auth.service";

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

    public readonly paymentMethods = [{
        code: 'octopus',
        name: 'Octopus',
        image: 'octopus.png'
    }, {
        code: 'payme',
        name: 'PayMe from HSBC',
        image: 'PayMe-Logo.wine.svg'
    }, {
        code: 'fps',
        name: '轉數快',
        image: 'fps_color.svg',
        width: '50%'
    }, {
        code: 'alipayHK',
        name: 'Alipay / 支付寶',
        image: 'Alipay-Logo.wine.svg'
    }, {
        code: 'wechatpayHK',
        name: 'WeChat Pay',
        image: 'WeChat_Pay_Emblem_HorW238.png'
    }, {
        code: 'pps',
        name: 'PPS',
        image: 'PPS_Logo.gif'
    }, {
        code: 'paypal',
        name: 'PayPal',
        image: 'PayPal-Logo.wine.svg'
    }, {
        code: 'stripe',
        name: 'Stripe',
        image: 'Stripe_(company)-Logo.wine.svg'
    }];

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
    readonly paymentSelection = false;

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
            firstname: '',
            lastname: '',
            email: ''
        },
        paymentInformation: {
            method: '',
            price: 0,
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
        bookId: 0,
        date: '',
        time: '',
        noOfSession: 2,  // from server side
        sessionInterval: 0,  // from server side
    };

    subscription: Subscription;

    private paymentComplete = new Subject<any>();

    paymentComplete$ = this.paymentComplete.asObservable();

    constructor(public api: ApiService, private translateService: TranslateService, private lemonade: Lemonade, private authService: AuthService) {
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
        if (this.appointmentInformation == undefined)
            this.prepareDefaultAppointment();
        if (!this.tableSessions) {
            this.api.get('api/user-service').subscribe(resp => {
                this.selectedService = resp;
                this.appointmentInformation.timeInformation.serviceId = resp.id;
                if (resp.trainer) {
                    this.appointmentInformation.timeInformation.trainerId = resp.trainer.id;
                }
                if (resp.room) {
                    this.appointmentInformation.timeInformation.roomId = resp.room.id;
                }
                this.tableSessions = resp.sessions;
            });
        }
        return this.appointmentInformation;
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
                name: query
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

    getActivePackages() {
        return this.api.get('api/packages', {
            status: 1001
        });
    }

    getActiveTrainers() {
        return this.api.get('api/users', {
            status: 'active',
            role: 'Trainer'
        });
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
        let params = {
            noOfSession: this.appointmentInformation.timeInformation.noOfSession,
            service_id: this.appointmentInformation.timeInformation.serviceId,
        };
        if (this.selectedService.requiredTrainer && this.appointmentInformation.timeInformation.trainerId > 0) {
            params = {...params, ...{
                trainer_id: this.appointmentInformation.timeInformation.trainerId
            }};
            if (this.appointmentInformation.timeInformation.trainerDate) {
                params = {...params, ...{
                    the_date: this.lemonade.formatPostDate(this.appointmentInformation.timeInformation.trainerDate)
                }};
            }
        }
        if (this.selectedService.requiredRoom && this.appointmentInformation.timeInformation.roomId) {
            params = {...params, ...{
                room_id: this.appointmentInformation.timeInformation.roomId
            }};
        }
        return this.api.get('api/appointment', params);
    }

    getTrainerNonWorkDates(trainerId, year, month) {
        return this.api.get('api/trainer-non-workdate/' + trainerId, {
            y: year,
            m: month
        });
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
                price: paymentInfo.price
            }, ...this.appointmentInformation.timeInformation
        };
        const me = this;
        this.submit(data, function(res) {
            console.log('complete res=', res);
            if (res.success === true) {
                me.paymentComplete.next({...{
                        success: true
                    }, ...me.appointmentInformation});
                // clear after payment complete.
                me.clearUserSelection();
            } else {
                me.paymentComplete.next(res);
            }
        });
    }

    submit(data, callback) {
        // submit to server.
        this.api.post('api/appointment', data).subscribe( res => {
            callback(res);
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

    getLang() {
        return this.lang;
    }

    formatDate(date, showWeekNo?: boolean) {
        return this.lemonade.formatDate(date, showWeekNo);
    }

    formatDateTime(datetime: string) {
        return this.lemonade.formatDateTime(datetime);
    }

    /**
     * copy from https://www.epochconverter.com/programming/#javascript
     * @param t
     */
    formatTime(t: number, date?) {
        return this.lemonade.formatTime(t, date);
    }

    getBookedDateTime(date, timeEpoch, sessionInterval, noOfSession) {
        return this.formatTime(timeEpoch, date) + " - " + this.formatTime(parseInt(timeEpoch, 10) + (noOfSession * sessionInterval));
    }

    getSessionName(noOfSession, tableSessions?) {
        if (tableSessions == undefined) {
            tableSessions = this.tableSessions;
        }
        if (noOfSession && tableSessions && tableSessions.length > 0) {
            let timeLen = tableSessions.find(el => el.code == noOfSession);
            let name = timeLen.name;
            if (timeLen.hour > 0) {
                this.translateService.get('hour Hours', {
                    hour: timeLen.hour,
                    s: timeLen.hour > 1 ? 's' : ''
                }).subscribe(res => {
                    name = res;
                });
                return name;
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
        if (this.paymentMethods.length > 0) {
            let paymentMethod = this.paymentMethods.find(el => el.code == code);
            return paymentMethod.name;
        }
        return '';
    }
}

@Injectable()
export class AppointmentStepsGuardService implements CanActivate {
    constructor(private router: Router, private appointmentService: AppointmentService) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
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
            return isValid;
        }
        return true;

    }
}
