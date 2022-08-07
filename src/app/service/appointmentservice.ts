import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import format from "date-fns/format";
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {ApiService} from "./api.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable()
export class AppointmentService {
    static readonly APPOINTMENT_SESSION = 'user.preferred.appointment';
    static readonly APPOINTMENT_EXPIRY_TIME = 'user.preferred.appointment_expiry_time';
    static readonly EXPIRY_TIME = 8;     // hour

    public readonly colors = ["1788FB","FBC22D","FA3C52","D696B8","689BCA","26CC2B","4BBEC6","FD7E35","E38587","774DFB","31CDF3","6AB76C","FD5FA1","A697C5"];
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

    private appointmentInformation = {
        timeInformation: {
            serviceId: 1,
            roomId: 1,
            date: '',
            noOfSession: 2,  // min 2 session = 1 hour.
            sessionInterval: 0,  // from server side
            time: ''
        },
        personalInformation: {
            firstname: localStorage.getItem(AuthService.USER_NAME),
            lastname: '',
            email: localStorage.getItem(AuthService.EMAIL)
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

    private paymentComplete = new Subject<any>();

    paymentComplete$ = this.paymentComplete.asObservable();

    constructor(public api: ApiService, private translateService: TranslateService) {
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

    /**
     * this acts like Ext.apply().
     * TODO move to util file if it exists.
     * @param o
     * @param c
     */
    apply(o, c) {
        if (o && c && typeof c == 'object') {
            for (var p in c) {
                o[p] = c[p];
            }
        }
        return o;
    }

    getTimeslots() {
        return this.api.get('api/appointment', {
            noOfSession: this.appointmentInformation.timeInformation.noOfSession
        });
    }

    complete() {
        const paymentInfo = this.appointmentInformation.paymentInformation;
        const data = this.apply({
            paymentMethod: paymentInfo.method,
            price: paymentInfo.price
        }, this.appointmentInformation.timeInformation);
        // submit to server.
        this.api.post('api/appointment', data).subscribe( res => {
            console.log('complete res=', res);
            if (res.success === true) {
                this.clearUserSelection();
                this.paymentComplete.next(this.apply({
                    success: true
                }, this.appointmentInformation));
            } else {
                this.paymentComplete.next(res);
            }
        });
    }


    formatDate(date, showWeekNo?: boolean) {
        if (showWeekNo) {
            return format(new Date(date), "EEE d/M");
        }
        return format(new Date(date), "d/M");
    }

    formatDateTime(datetime: string) {
        if (datetime)
            return format(new Date(datetime), 'h:mm aa');
        return '';
    }

    /**
     * copy from https://www.epochconverter.com/programming/#javascript
     * @param t
     */
    formatTime(t: number, date?) {
        let content = '';
        if (date) {   // optional show date.
            content += format(new Date(date), "dd/MMM") + " - ";
        }
        const days = parseInt(String(t / 86400), 10);
        t = t - (days * 86400);
        const hours = parseInt(String(t / 3600), 10);
        t = t - (hours * 3600);
        const minutes = parseInt(String(t / 60), 10);
        t = t - (minutes * 60);
        if (days) content += days + " days";    // FIXME throw error if time more than a day?
        if (hours || days) {
            if (days) content += ", ";
            content += hours + ":";
        }
        content += (minutes + "").padStart(2, '0');
        return content;
    }

    getBookedDateTime(date, timeEpoch, sessionInterval) {
        let result = '';
        this.translateService.get('to').subscribe( res => {
            result = date + "  " + this.formatTime(timeEpoch) + " " + res + " " + this.formatTime(parseInt(timeEpoch, 10) + (this.appointmentInformation.timeInformation.noOfSession * sessionInterval));
        });
        return result;
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
