import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import format from "date-fns/format";
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {ApiService} from "./api.service";
import {TranslateService} from "@ngx-translate/core";
import { enUS, zhHK } from 'date-fns/locale'
import {addDays} from "date-fns";
import {Lemonade} from "./lemonade.service";

@Injectable()
export class AppointmentService {
    static readonly APPOINTMENT_SESSION = 'user.preferred.appointment';
    static readonly APPOINTMENT_EXPIRY_TIME = 'user.preferred.appointment_expiry_time';
    static readonly EXPIRY_TIME = 8;     // hour

    lang: any;

    // for display only and should be retrieved from server
    public readonly tableSessions = [
        {name: '1 Hour', code: 2, hour: 1},
        {name: '1.5 Hour', code: 3, hour: 1.5},
        {name: '2 Hours', code: 4, hour: 2},
        {name: '2.5 Hours', code: 5, hour: 2.5},
        {name: '3 Hours', code: 6, hour: 3},
    ];

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

    private readonly defaultAppointment = {
        timeInformation: {
            serviceId: 1,
            roomId: 1,
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

    private appointmentInformation;

    reschedule = {
        appointment: null,
        bookId: 0,
        date: '',
        time: '',
        noOfSession: 2,  // from server side
        sessionInterval: 0,  // from server side
    };

    private paymentComplete = new Subject<any>();

    paymentComplete$ = this.paymentComplete.asObservable();

    constructor(public api: ApiService, private translateService: TranslateService, private lemonade: Lemonade) {
        this.lang = this.translateService.getDefaultLang() === 'zh' ? zhHK : enUS;
        // init, copy from default data.
        this.appointmentInformation = { ...this.defaultAppointment };
    }

    formatPostDate(d) {
        return this.lemonade.formatPostDate(d);
    }

    getBookings(date1, date2) {
        return this.api.get('api/booking', {
            from_date: this.lemonade.formatPostDate(date1),
            to_date: this.lemonade.formatPostDate(date2)
        });
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
        // cleanup, copy from default data.
        this.appointmentInformation = { ...this.defaultAppointment };
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
// console.log('now======', now, expiry)
        if (this.isAppointmentValid()) {
            // get from storage.
            this.appointmentInformation = JSON.parse(sessionStorage.getItem(AppointmentService.APPOINTMENT_SESSION));
            return this.appointmentInformation;
        }
        return this.appointmentInformation;
    }

    setAppointmentInformation(appointmentInformation) {
        this.appointmentInformation = appointmentInformation;
    }

    getRescheduleTimeslots() {
        return this.api.get('api/appointment', {
            bookId: this.reschedule.bookId
        });
    }

    getTimeslots() {
        return this.api.get('api/appointment', {
            noOfSession: this.appointmentInformation.timeInformation.noOfSession
        });
    }

    complete() {
        const paymentInfo = this.appointmentInformation.paymentInformation;
        const data = {...{
            paymentMethod: paymentInfo.method,
            price: paymentInfo.price
        }, ...this.appointmentInformation.timeInformation};
        // submit to server.
        this.api.post('api/appointment', data).subscribe( res => {
            console.log('complete res=', res);
            if (res.success === true) {
                this.paymentComplete.next({...{
                    success: true
                }, ...this.appointmentInformation});
                // clear after payment complete.
                this.clearUserSelection();
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

    getSessionName(noOfSession) {
// console.log("getsessionname=", this.tableSessions, noOfSession);
        if (this.tableSessions.length > 0) {
            let timeLen = this.tableSessions.find(el => el.code == noOfSession);
            let name = timeLen.name;
            this.translateService.get('hour Hours', {
                hour: timeLen.hour,
                s: timeLen.hour
            }).subscribe( res => {
                name = res;
            });
            return name;
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
        const isValid = this.appointmentService.isAppointmentValid();
// console.log('AppointmentStepsGuardService isvalid=', isValid);
        if (!isValid) {
            this.router.navigate(['/appointment/time-range']);
        }

        return isValid;
    }
}
