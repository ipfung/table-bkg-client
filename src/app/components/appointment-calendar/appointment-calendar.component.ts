import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-appointment-calendar',
    templateUrl: './appointment-calendar.component.html',
    styleUrls: ['./appointment-calendar.component.scss']
})
export class AppointmentCalendarComponent implements OnInit {
    loading = true;

    events: any;

    // search fields
    rangeDates: Date[];
    searchPaymentStatus = '';
    paymentStatusList = [];
    searchCustomer = 0;
    customers = [];
    options: any;

    constructor(private api: ApiService, private lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.api.get('api/appointments').subscribe( res => {
            this.events = res.data;
            this.options = {...this.options, ...{events: res.data}};
        });
        this.options = {
            initialDate : this.lemonade.formatPostDate(new Date()),
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            },

            editable: false,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            // events: {   // below causes 2 issues, (1) can't pass token, (2) can't pass content-type json.
            //     url: this.api.url + 'api/appointments',
            //     startParam: 'start_time',
            //     endParam: 'end_time',
            //     failure: function() {
            //         alert('there was an error while fetching events!');
            //     },
            //     color: 'yellow',   // a non-ajax option
            //     textColor: 'black' // a non-ajax option
            // }
        };
    }

}
