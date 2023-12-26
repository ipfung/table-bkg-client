import {Component, Input, OnInit} from '@angular/core';
import {Lemonade} from "../../service/lemonade.service";

@Component({
  selector: 'app-order-appointment-list',
  templateUrl: './order-appointment-list.component.html',
  styleUrls: ['./order-appointment-list.component.scss']
})
export class OrderAppointmentListComponent implements OnInit {
    @Input()
    bookings: any[];

    @Input()
    title: string;

    @Input()
    appointmentType: string;

    constructor(private lemonade: Lemonade) { }

    ngOnInit(): void {
    }

    showAppointmentType(detail: any, type: string) {
        return (type === undefined || detail.entity == type);
    }

}
