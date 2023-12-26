import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {environment} from "../../../environments/environment";
import {CalendarOptions} from "@fullcalendar/core";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import {AppointmentService} from "../../service/appointmentservice";

@Component({
  selector: 'app-appointment-blocks',
  templateUrl: './appointment-blocks.component.html',
  styleUrls: ['./appointment-blocks.component.scss']
})
export class AppointmentBlocksComponent implements OnInit {

    loading = true;
    events: any;
    appointments : any;
    appointmentsMon : any;
    appointmentsTue : any;
    appointmentsWed : any;
    appointmentsThu : any;
    appointmentsFri : any;
    appointmentsSat : any;
    appointmentsSun : any;

    daylist: any;
    unidaylist : any;
    comparedaylist: any;

    titleMon: any ="";
    titleTue: any ="";
    titleWed: any ="";
    titleThu: any ="";
    titleFri: any ="";
    titleSat: any ="";
    titleSun: any ="";


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
      this.api.get('api/appointment-blocks', params).subscribe( res => {
          // this.events = res.data;   // FIXME apply different color to different role.
          console.log('loaddata', res.data);
          this.appointments =  res.data;

          this.appointmentsMon = this.appointments;
          //this.appointmentsMon =  this.appointments.filter((t) => t.start == "2023-12-19 19:00:00" );
          this.appointmentsTue =  this.appointments.filter( function (t) {
            //return t.start == "2023-12-19 19:00:00";
            return true;
          } );
          /* this.options = {...this.options, ...{
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
          }; */
      });
    }

}
