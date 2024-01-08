import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Appointment } from '../../Appointment';
import {Lemonade} from "../../service/lemonade.service";

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
  constructor(public lemonade: Lemonade) { }

  ngOnInit(): void {
  }

}
