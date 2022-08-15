import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import format from "date-fns/format";
import {AuthService} from "./auth.service";
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {ApiService} from "./api.service";
import {TranslateService} from "@ngx-translate/core";
import { enUS, zhHK } from 'date-fns/locale'
import {addDays} from "date-fns";
import {environment} from "../../environments/environment";

@Injectable()
export class Lemonade {
    lang: any;

    constructor(private translateService: TranslateService) {
        this.lang = this.translateService.getDefaultLang() === 'zh' ? zhHK : enUS;
    }

    formatPostDate(d) {
        if (d)
            return format(d, 'yyyy-MM-dd');
        return '';
    }

    isDefined(v){
        return typeof v !== 'undefined';
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

    getAvatar(user) {
        return environment.url + 'storage/' + user.avatar;
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
            return format(new Date(datetime), 'h:mm aa', {locale: this.lang});
        return '';
    }

    /**
     * copy from https://www.epochconverter.com/programming/#javascript
     * @param t
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
            return format(new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes), "EEE d/M - h:mm aa", {locale: this.lang});
        }
        const d = new Date();   // give it a fake date for below formatting.
        return format(new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes), "h:mm aa", {locale: this.lang});
    }

}
