import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {environment} from "../../../environments/environment";
import {CalendarOptions} from "@fullcalendar/core";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import {AppointmentService} from "../../service/appointmentservice";

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
    roles: any[];
    selectedRole = [];
    selectedRoleId = 0;
    rooms: any[];
    selectedRoom = [];
    trainer: any;
    trainers: any[];
    options: CalendarOptions;

    // list
    showStudentList = false;
    showCustomer = false;
    showTrainer = false;
    bookings: any;
    supportFinance = false;

    constructor(private api: ApiService, private appointmentService: AppointmentService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.loadData();
        this.api.get('api/roles').subscribe(res => {
            this.roles = res.data;
        });
        this.api.get('api/rooms').subscribe(res => {
            this.rooms = res.data;
        });
        const isApp = environment.isApp;
        const me = this;
        const srv = me.appointmentService;
        let headerToolbar = {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }, initialView = 'dayGridMonth';
        if (isApp) {
            initialView = 'timeGridWeek'
            // day view only
            headerToolbar = {
                left: 'prev',
                center: 'title',
                right: 'next'
            };
        }
        this.options = {
            initialView: initialView,
            initialDate : this.lemonade.formatPostDate(new Date()),
            plugins: [dayGridPlugin, timeGridPlugin],
            headerToolbar: headerToolbar,

            editable: false,
            selectable: true,
            selectMirror: true,
            dayMaxEvents: true,
            eventDidMount: function(info) {
                // console.log("cal extendedProps=", info.event.extendedProps);
                console.log("cal  info=", info);
            },
            eventClick: function(info) {
                var eventObj = info.event;
                me.showStudentList = false;

                if (eventObj.extendedProps.package) {
                    srv.getBookings({
                        appointmentId: eventObj.extendedProps.appointment_id
                    }).subscribe(res => {
                        me.bookings = res.data;
                        me.showCustomer = res.showCustomer;
                        me.showTrainer = res.showTrainer;
                        me.supportFinance = res.supportFinance;
                        me.showStudentList = true;
                    });
                }

                // if (eventObj.url) {
                //     alert(
                //         'Clicked ' + eventObj.title + '.\n' +
                //         'Will open ' + eventObj.url + ' in a new tab'
                //     );
                //
                //     window.open(eventObj.url);
                //
                //     info.jsEvent.preventDefault(); // prevents browser from following link in current tab.
                // } else {
                //     alert('Clicked ' + eventObj.title);
                // }
            }
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

    // debugMe(arg) {
    //     console.log(arg.event);
    // }

    searchTrainers(e) {
        this.api.get('api/users', {
            name: e.query
        }).subscribe(res => {
            this.trainers = res.data;
        });
    }

    allRoom() {
        this.selectedRoom = [];
        this.loadData();
    }

    loadRole(id) {
        console.log('hi selectedRole=', id);
        this.selectedRoleId = id;
        this.loadData();
    }

    loadData() {
        let params = {};
        console.log('hi selectedRoom=', this.selectedRoom);
        if (this.selectedRole && this.selectedRole.length > 0) {
            const roles = this.selectedRole.map(a => a.id);
            params = {...params, ...{role_ids: roles}};
        } else {
            params = {...params, ...{role_id: this.selectedRoleId}};
        }
        if (this.selectedRoom && this.selectedRoom.length > 0) {
            const rooms = this.selectedRoom.map(a => a.id);
            params = {...params, ...{room_ids: rooms}};
        }
        if (this.trainer && this.trainer.id) {
            params = {...params, ...{user_id: this.trainer.id}};
        }
        // const roles = this.selectedRole.map(a => a.foo);
        this.api.get('api/appointments', params).subscribe( res => {
            // this.events = res.data;   // FIXME apply different color to different role.
            this.options = {...this.options, ...{
                    eventSources: [{
                        events: res.data, color: 'yellow'//, textColor: '#266cda'
                    // }, {
                    //     events: [{
                    //         "title": "Event 1",
                    //         "start": "2022-09-05T09:00:00",
                    //         "end": "2022-09-05T18:00:00"
                    //     }, {
                    //         "title": "Event 2",
                    //         "start": "2022-09-08",
                    //         "end": "2022-09-10"
                    //     }],
                    //     color: 'yellow', textColor: 'red'
                    }]
                }
            };
        });
    }
}
