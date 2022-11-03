import { Injectable } from '@angular/core';
import format from "date-fns/format";
import {TranslateService} from "@ngx-translate/core";
import { enUS, zhHK } from 'date-fns/locale'
import {addDays, intervalToDuration} from "date-fns";
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

    readonly dateFormat = 'dd/mm/yy';
    timeFormat = 'h:mm aa';
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
            return format(d, fmt, {locale: this.lang});
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
        if ('weekly' == recurring.cycle) {
            const WEEK_NAMES = ['', "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            return recurring.repeat.map(e => WEEK_NAMES[e]);
        }
        return recurring.repeat;
    }

}
