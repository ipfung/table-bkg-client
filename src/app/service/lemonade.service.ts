import {ElementRef, Injectable} from '@angular/core';
import format from "date-fns/format";
import {TranslateService} from "@ngx-translate/core";
import { enUS, zhHK } from 'date-fns/locale'
import {addDays, intervalToDuration, isToday} from "date-fns";
import {environment} from "../../environments/environment";

@Injectable()
export class Lemonade {
    lang: any;

    readonly appointmentStatus = [
        {
            name: 'approve',   // without 'ed'
            code: 'approved'
        }, {
            name: 'pending',
            code: 'pending'
        }
    ];

    readonly paymentStatuses = [{
        code: 'pending',
        name: 'unpaid'
    }, {
        code: 'paid',
        name: 'Paid'
    }];

    // shall we put methods in env for different customer?
    readonly paymentMethods = [{
        code: 'mpay',
        name: 'mPay',
        image: 'mPay.png',
        selected: true    // don't set to any specific gateway.
    //     code: 'octopus',
    //     name: 'Octopus',
    //     image: 'octopus.png'
    // }, {
    //     code: 'payme',
    //     name: 'PayMe from HSBC',
    //     image: 'PayMe-Logo.wine.svg'
    // }, {
    //     code: 'fps',
    //     name: '轉數快',
    //     image: 'fps_color.svg',
    //     width: '50%'
    // }, {
    //     code: 'alipayHK',
    //     name: 'Alipay / 支付寶',
    //     image: 'Alipay-Logo.wine.svg'
    // }, {
    //     code: 'wechatpayHK',
    //     name: 'WeChat Pay',
    //     image: 'WeChat_Pay_Emblem_HorW238.png'
    // }, {
    //     code: 'pps',
    //     name: 'PPS',
    //     image: 'PPS_Logo.gif'
    // // }, {
    // //     code: 'vm',
    // //     name: 'Visa / Master',
    // // }, {
    // //     code: 'paypal',
    // //     name: 'PayPal',
    // //     image: 'PayPal-Logo.wine.svg'
    // // }, {
    // //     code: 'stripe',
    // //     name: 'Stripe',
    // //     image: 'Stripe_(company)-Logo.wine.svg'
    }];

    readonly dateFormat = 'dd/mm/yy';
    timeFormat = 'h:mm aa';
    readonly endTimeFormat = 'h:mm';
    readonly weeks = [
        {
            name: 'Monday',
            code: 1
        }, {
            name: 'Tuesday',
            code: 2
        }, {
            name: 'Wednesday',
            code: 3
        }, {
            name: 'Thursday',
            code: 4
        }, {
            name: 'Friday',
            code: 5
        }, {
            name: 'Saturday',
            code: 6
        }, {
            name: 'Sunday',
            code: 7
        }
    ];

    readonly userStatus = [
        {
            name: 'active',
            code: 'active'
        }, {
            name: 'suspended',
            code: 'suspended'
        }, {
            name: 'banned',
            code: 'banned'
        }
    ];

    constructor(private translateService: TranslateService) {
        if (this.translateService.getDefaultLang() === 'zh') {
            this.lang = zhHK;
            this.timeFormat = 'aa h:mm';
        } else {
            this.lang = enUS;
            this.timeFormat = 'h:mm aa';
        }
    }

    getAppName() {
        return environment.name;
    }

    formatPostDate(d) {
        if (d)
            return format(d, 'yyyy-MM-dd');
        return '';
    }

    getInitial(name) {
        if (!name) return '';
        // or ref: https://via.placeholder.com/300.png/09f/fff
        let name1 = name
            .toUpperCase()
            .split(' ');
        //trim array to max length of 2.
        if (name1.length > 2) {
            name1 = name1.slice(0, 2);
        }

        return name1
            .map(word => word[0])
            .join('');
    }

    getAvatar(user) {
        return environment.url + 'storage/' + user.avatar;
    }

    isDefined(v){
        return typeof v !== 'undefined';
    }

    applyIf(o, c){
        if(o){
            for(var p in c){
                if(!this.isDefined(o[p])){
                    o[p] = c[p];
                }
            }
        }
        return o;
    }

    getLang() {
        return this.lang;
    }

    formatDate(date, showWeekNo?: boolean) {
        if (date) {
            const d = new Date(date);
            const today = new Date();
            const isDiffYr = (d.getFullYear() != today.getFullYear());
            let fmt = "d/M" + (isDiffYr ? '/Y' : '');
            // show year when param date is different year compare with today.
            if (showWeekNo) {
                fmt = "EEE d/M" + (isDiffYr ? '/Y' : '');
            }
            let str = '';
            // show today.
            if (isToday(d)) {
                this.translateService.get(['Today']).subscribe( msg => {
                    str += msg["Today"] + ", ";
                });
            }
            str += format(d, fmt, {locale: this.lang});
            return str;
        }
        return '';
    }

    formatDateTime(datetime: string) {
        if (datetime)
            return format(new Date(datetime), this.timeFormat, {locale: this.lang});
        return '';
    }

    /**
     * copy from https://www.epochconverter.com/programming/#javascript
     * @param t epoch time
     */
    formatTime(t: number, date?) {
        const days = parseInt(String(t / 86400), 10);
        t = t - (days * 86400);
        const hours = parseInt(String(t / 3600), 10);
        t = t - (hours * 3600);
        const minutes = parseInt(String(t / 60), 10);
        t = t - (minutes * 60);
        if (date) {
            const d = addDays(new Date(date), days);
            return this.formatFullDateTime(new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes));
        }
        const d = new Date();   // give it a fake date for below formatting.
        return format(new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes), this.timeFormat, {locale: this.lang});
    }

    formatFullDateTime(d, convertMe?: boolean) {
        if (convertMe) {
            d = new Date(d);
        }
        return format(d, "EEE d/M " + this.timeFormat, {locale: this.lang});
    }

    format(d, fmt) {
        return format(d, fmt, {locale: this.lang});
    }

    duration(start_time, end_time) {
        const duration = intervalToDuration({
            start: new Date(start_time),
            end: new Date(end_time)
        });
        return (duration.hours > 0 ? duration.hours + 'h ' : '') + (duration.minutes > 0 ? duration.minutes + 'min' : '');
    }

    /**
     * get the 'name' attribute from an array by 'code'.
     * @param list the array
     * @param code the code to be search.
     */
    comboRenderer(list, code, fieldName?) {
        if (list.length > 0) {
            let data;
            if (fieldName) {
                data = list.find(el => el[fieldName] == code);
            } else {
                // use code.
                data = list.find(el => el.code == code);
            }
            if (data)
                return data.name;
        }
        return '';
    }

    /**
     * it could be 'weekly', 'monthly'
     * @param recurringStr
     */
    getRecurringCycle(recurringStr) {
        const recurring = JSON.parse(recurringStr);
        return recurring.cycle;
    }

    displayRecurring(recurringStr) {
        const recurring = JSON.parse(recurringStr);
        if ('weekly' == recurring.cycle || 'group_event' == recurring.cycle) {
            const WEEK_NAMES = ['', "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            return recurring.repeat.map(e => WEEK_NAMES[e]);
        }
        return recurring.repeat;
    }

    /**
     *
     * @param messageService
     * @param obj {message: '', params: []}
     */
    ok(messageService, obj?: any) {
        let message = 'Record is stored successfully';
        let hasParams = false;
        if (obj && obj.message) {
            message = obj.message;
            hasParams = (obj.params);
        } else if (typeof obj === 'string' || obj instanceof String) {
            // @ts-ignore
            message = obj;
        }
        this.translateService.get(['Succeed', message]).subscribe( msg => {
            messageService.add({
                severity: 'success',
                summary: msg['Succeed'],
                detail: msg[message]
            });
        });
    }

    error(messageService, err) {
        messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error||err.message
        });
    }

    /**
     * form validation where will throw server side error.
     * @param messageService
     * @param response
     */
    validateError(messageService, response) {
        const errors = response.error.errors;
//console.log('errors1===', errors);
        for (const e in errors) {
            messageService.add({
                severity: 'error',
                summary: 'Validation failed',
                detail: errors[e]
            })
        }
    }

    // ref: https://stackoverflow.com/questions/53343911/dynamic-iframe-source-with-angular
    setIframe(iframe: ElementRef, content: any): void {
        const win: Window = iframe.nativeElement.contentWindow;
        const doc: Document = win.document;
        doc.open();
        doc.write(content);
        doc.close()
    }
}
