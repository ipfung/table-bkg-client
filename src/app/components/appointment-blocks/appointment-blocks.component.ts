import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {environment} from "../../../environments/environment";
import {CalendarOptions} from "@fullcalendar/core";
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import {AppointmentService} from "../../service/appointmentservice";
import {LazyLoadEvent, MessageService} from "primeng/api";

@Component({
  selector: 'app-appointment-blocks',
  templateUrl: './appointment-blocks.component.html',
  styleUrls: ['./appointment-blocks.component.scss']
})
export class AppointmentBlocksComponent implements OnInit {

    loading = true;
    events: any;
    appointments : any;
    appointments1 : any;
    appointments2 : any;
    appointments3 : any;
    appointments4 : any;
    appointments5 : any;
    appointments6 : any;
    appointments7 : any;

    daylist: any;
    unidaylist : any;
    comparedaylist: any;

    title1: any ="";
    title2: any ="";
    title3: any ="";
    title4: any ="";
    title5: any ="";
    title6: any ="";
    title7: any ="";
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
    TableChecked :boolean = true;
    calselectmode : string = "single";

    constructor(private api: ApiService, private appointmentService: AppointmentService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
      this.date = new Date();
      this.api.get('api/rooms').subscribe(res => {
        this.rooms = res.data;
    });

      this.loadData(null);
      this.showRooms= this.TableChecked;
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
      var end_date : Date = new Date();
      if (this.TableChecked==false){       
        end_date.setDate(this.date.getDate() + 7);
      } else {
        end_date =this.date;
        
      }
      console.log('end_date', this.lemonade.formatPostDate(end_date));
      params = {
        from_date: this.lemonade.formatPostDate(this.date),
        to_date: this.lemonade.formatPostDate(end_date),
      }
      if (this.TableChecked==false){
        //console.log('selectedroom', this.selectedRoom );
        if (this.selectedRoom) {
          //const rooms = this.selectedRoom.id;
          const room_id = this.selectedRoom;
          params = {...params, ...{room_ids: room_id}};
        }
        this.cardtitle = [];
        for (let i = 0; i < 7; i++) {
          
          var temp_date : Date = new Date();
          temp_date.setDate(this.date.getDate() + i)
          var new_temp_date = this.lemonade.formatPostDate(temp_date) ;
          this.cardtitle.push(new_temp_date );
        }
      } else {
        this.cardtitle = [];
        for (let j = 1; j <= 7; j++) {          
          this.cardtitle.push("Table " + j );
        }
      }
      console.log('Cardtitle=', this.cardtitle);
      console.log('Params=', params);
      this.api.get('api/appointment-blocks', params).subscribe( res => {
          // this.events = res.data;   // FIXME apply different color to different role.
          console.log('loaddata', res.data);
          this.appointments =  res.data;
          if (this.appointments.length ==0){
            this.norecord = true;
          } else {
            this.norecord = false;
          }
          if (this.TableChecked) {
            this.appointments1 =  this.appointments.filter( function (t) {    
              return t.room_id == 1;

            } );
            this.appointments2 =  this.appointments.filter( function (t) {
              //return t.start == "2023-12-19 19:00:00";
              return t.room_id == 2;
            } );
            this.appointments3 =  this.appointments.filter( function (t) {           
              return t.room_id == 3;
            } );
            this.appointments4 =  this.appointments.filter( function (t) {           
              return t.room_id == 4;
            } );
            this.appointments5 =  this.appointments.filter( function (t) {           
              return t.room_id == 5;
            } );
            this.appointments6 =  this.appointments.filter( function (t) {           
              return t.room_id == 6;
            } );
            this.appointments7 =  this.appointments.filter( function (t) {           
              return t.room_id == 7;
            } );
          } else {

            this.appointments1 =  this.appointments.filter( function (t) {    
              /* var temp_date : Date = new Date();
              temp_date.setDate(this.date.getDate() )
              var new_temp_date = this.lemonade.formatPostDate(temp_date) ; */
              console.log("return param",params['from_date']);
              return t.start = "2024-01-01";
              return t.start = params['from_date'];;

            } );
            this.appointments2 =  this.appointments.filter( function (t) {
              //return t.start == "2023-12-19 19:00:00";
              var temp_date : Date = new Date();
              var temp_start_date = new Date(params['from_date']);
              temp_date.setDate(temp_start_date.getDate() + 1)
              console.log('temp_date', temp_date);
              //var new_temp_date = this.lemonade.formatPostDate(temp_date) ;
              return t.start = "2024-01-02";
              return t.start == temp_date;
            } );
            this.appointments3 =  this.appointments.filter( function (t) {           
              return t.room_id == 3;
            } );
            this.appointments4 =  this.appointments.filter( function (t) {           
              return t.room_id == 4;
            } );
            this.appointments5 =  this.appointments.filter( function (t) {           
              return t.room_id == 5;
            } );
            this.appointments6 =  this.appointments.filter( function (t) {           
              return t.room_id == 6;
            } );
            this.appointments7 =  this.appointments.filter( function (t) {           
              return t.room_id == 7;
            } );
          }

          //this.appointments1 = this.appointments;
          //this.appointmentsMon =  this.appointments.filter((t) => t.start == "2023-12-19 19:00:00" );
          this.appointments1 =  this.appointments.filter( function (t) {    
              return t.room_id == 1;

          } );
          this.appointments2 =  this.appointments.filter( function (t) {
            //return t.start == "2023-12-19 19:00:00";
            return t.room_id == 2;
          } );
          this.appointments3 =  this.appointments.filter( function (t) {           
            return t.room_id == 3;
          } );
          this.appointments4 =  this.appointments.filter( function (t) {           
            return t.room_id == 4;
          } );
          this.appointments5 =  this.appointments.filter( function (t) {           
            return t.room_id == 5;
          } );
          this.appointments6 =  this.appointments.filter( function (t) {           
            return t.room_id == 6;
          } );
          this.appointments7 =  this.appointments.filter( function (t) {           
            return t.room_id == 7;
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
    } // end loaddata

    SelectedTable(){
      console.log("selectedtable", this.selectedRoom);
    }

    ToggleTableCalendar()
    {
      console.log("ToggleTableCalendar", this.TableChecked);
      if (!this.selectedRoom)
      {
        this.selectedRoom = 1 ;
      }
      this.showRooms = this.TableChecked;
      //this.calselectmode = "range";
      this.loadData(null);
    }

}
