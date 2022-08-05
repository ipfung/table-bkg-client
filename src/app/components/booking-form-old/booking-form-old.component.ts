import { Component, OnInit } from '@angular/core';

import addDays from 'date-fns/addDays';
import format from 'date-fns/format';
import {Router} from "@angular/router";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-booking-form-old',
  templateUrl: './booking-form-old.component.html',
  styleUrls: ['./booking-form-old.component.scss']
})
export class BookingFormOldComponent implements OnInit {
    today: Date;

    // the maxBookDate depends on user level
    maxBookDate: Date;

    timeSlots: any[];

    valRadio: string;

  constructor(private router: Router, private http: HttpClient) {
  }

  ngOnInit(): void {
      // this.http.get()
      this.today = new Date();
      // below should be retrieved from service.
      this.maxBookDate = addDays(new Date(), 10);
      this.timeSlots = [{
          id: 1,
          date: '2022-07-25',
          start: '12:00',
          end: '1:00',
          price: 50,
          isChecked: 'no'
      }, {
          id: 2,
          date: '2022-07-25',
          start: '1:00',
          end: '2:00',
          price: 50,
          isChecked: 'no'
      }, {
          id: 3,
          date: '2022-07-25',
          start: '2:00',
          end: '3:00',
          price: 50,
          isChecked: 'no'
      }, {
          id: 4,
          date: '2022-07-25',
          start: '3:00',
          end: '4:00',
          price: 60,
          isChecked: 'no'
      }, {
          id: 5,
          date: '2022-07-25',
          start: '4:00',
          end: '5:00',
          price: 60,
          isChecked: 'no'
      }, {
          id: 6,
          date: '2022-07-25',
          start: '5:00',
          end: '6:00',
          price: 60,
          isChecked: 'no'
      }, {
          id: 7,
          date: '2022-07-25',
          start: '6:00',
          end: '7:00',
          price: 60,
          isChecked: 'no'
      }, {
          id: 8,
          date: '2022-07-25',
          start: '7:00',
          end: '8:00',
          price: 60,
          isChecked: 'no'
      }, {
          id: 9,
          date: '2022-07-25',
          start: '8:00',
          end: '9:00',
          price: 50,
          isChecked: 'no'
      }];
  }

  formatTime(time) {
      return time + ' pm';
  }

  checkTimeAvailability(item: any) {
      // check server availability.
console.log('yes', item);
      // mark
      item.isChecked = 'yes';
  }

  nextPage() {
    // if (this.personalInformation.firstname && this.personalInformation.lastname && this.personalInformation.age) {
    //     this.ticketService.ticketInformation.personalInformation = this.personalInformation;
        this.router.navigate(['appointment/payment']);

        return;
    // }

    // this.submitted = true;
  }
}
