import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Appointment } from '../../Appointment';

@Component({
  selector: 'app-appointment-block-items',
  templateUrl: './appointment-block-items.component.html',
  styleUrls: ['./appointment-block-items.component.scss']
})

export class AppointmentBlockItemsComponent {

  @Input()
  appointment!: Appointment;
 /*  @Output() onDeleteTask: EventEmitter<Task> = new EventEmitter();
  @Output() onToggleReminder: EventEmitter<Task> = new EventEmitter();
  faTimes = faTimes; */
  @Output()
  lessontime:string;
  constructor() { }

  ngOnInit(): void {
   this.setDisplayTime()
  }

  setDisplayTime(){

    var starttime = this.doformatTime(this.appointment.start);
   
    var endtime = this.doformatTime(this.appointment.end);
    
    //console.log ("time=", endtime);
    return this.lessontime = starttime + "-" + endtime;
  }

  public doformatTime( d: any)
  {
    var tmdate = new Date(d);
    var yy = tmdate.getFullYear();
    var mm= tmdate.getMonth()+1;
    var dd= tmdate.getDate();
    var hh = tmdate.getHours();
    var m= tmdate.getMinutes();
    var hhh,mmm : string;
    //var new_d = yy + "-" + mm + "-" + dd;
    if (Number(hh)< 9 ){
      hhh = "0" + hh.toString();
    } else {
      hhh = hh.toString();
    }
    //console.log ("hhh=", hh);
    if (Number(m)< 9 ){
      mmm = "0" + m;
    } else {
      mmm = m.toString();
    }
    var new_d = hhh + ":" + mmm;
    return new_d;
  }
}
