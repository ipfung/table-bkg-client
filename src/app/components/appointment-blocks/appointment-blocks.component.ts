import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {CalendarOptions} from "@fullcalendar/core";
import {AppointmentService} from "../../service/appointmentservice";
import {LazyLoadEvent} from "primeng/api";
import {addDays, isSameDay} from "date-fns";

@Component({
  selector: 'app-appointment-blocks',
  templateUrl: './appointment-blocks.component.html',
  styleUrls: ['./appointment-blocks.component.scss']
})
export class AppointmentBlocksComponent implements OnInit {

    loading = true;
    events: any;
    appointments : any;
    filterAppointments : any[][];

    daylist: any;
    unidaylist : any;
    comparedaylist: any;

    cardtitle : any[] = [];

    date: Date;
    // search fields
    rangeDates: Date[];
    searchPaymentStatus = '';
    paymentStatusList = [];
    roles: any[];
    selectedRole = [];
    selectedRoleId = 0;
    rooms: any[];
    selectedRoom : any;
    trainer: any;
    trainers: any[];
    options: CalendarOptions;
    selectedTable: any;
    showRooms :boolean = false;

    // list
    showStudentList = false;
    showCustomer = false;
    showTrainer = false;
    bookings: any;
    supportFinance = false;

    norecord = false;
    calselectmode : string = "single";

    constructor(private api: ApiService, private appointmentService: AppointmentService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
      this.date = new Date();
      this.api.get('api/rooms').subscribe(res => {
        this.rooms = res.data;
    });

      this.loadData(null);
    }

    loadData(event: LazyLoadEvent) {
      let params = {};
      //console.log('hi selectedRoom=', this.selectedRoom);
     /*  if (this.selectedRole && this.selectedRole.length > 0) {
          const roles = this.selectedRole.map(a => a.id);
          params = {...params, ...{role_ids: roles}};
      } else {
          params = {...params, ...{role_id: this.selectedRoleId}};
      } */
      /* if (this.selectedRoom && this.selectedRoom.length > 0) {
          const rooms = this.selectedRoom.map(a => a.id);
          params = {...params, ...{room_ids: rooms}};
      } */
     /*  if (this.trainer && this.trainer.id) {
          params = {...params, ...{user_id: this.trainer.id}};
      } */
      // const roles = this.selectedRole.map(a => a.foo);
      //console.log("selected table", this.selectedTable);
      //console.log('tablechecked',this.TableChecked + "// " + this.date)
      let end_date = this.date;
      if (this.showRooms) {
          // show weekly data per room
          end_date = addDays(this.date, 6);
          const room_id = this.selectedRoom;
// console.log('this.selectedRoom=', this.selectedRoom);
          params = {...params, ...{room_ids: room_id}};
      }
      params = {
          ...params, ...{
              from_date: this.lemonade.formatPostDate(this.date),
              to_date: this.lemonade.formatPostDate(end_date),
          }
      }
      // console.log('Cardtitle=', this.cardtitle);
      // console.log('Params=', params);
      this.api.get('api/appointment-blocks', params).subscribe( res => {
          // this.events = res.data;   // FIXME apply different color to different role.
          // console.log('loaddata', res.data);
          this.appointments =  res.data;
          this.norecord = this.appointments.length ==0;
          this.cardtitle = [];
          this.filterAppointments = [];
          if (this.showRooms) {
              // display weekly data of particular 'room'
              let temp_date = null;
              for (let i = 0; i < 7; i++) {
                  temp_date = addDays(this.date, i);
                  this.cardtitle.push(this.lemonade.formatDate(temp_date, true));
                  this.filterAppointments[i] = this.appointments.filter(function (t) {
                      // console.log('t=', t, temp_date);
                      return isSameDay(new Date(t.start), temp_date);
                  });
                  // console.log('week' + i+ "===" + this.filterAppointments[i]);
              }
          } else {
              // display all room data of specific date.
              for (let i=0; i<this.rooms.length; i++) {
                  const rm = this.rooms[i];
                  this.cardtitle.push(rm.name);
                  this.filterAppointments[i] = this.appointments.filter( function (t) {
                      return t.room_id == rm.id;
                  });
              }
          }

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
    } // end loaddata

    toggleTableCalendar()
    {
      if (!this.selectedRoom) {
        this.selectedRoom = this.rooms[0].id;
      }
      this.loadData(null);
    }

}
