import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {TranslateService} from "@ngx-translate/core";
import {Lemonade} from "../../service/lemonade.service";
import {addDays, addMinutes, isAfter, isWithinInterval, subHours, subMinutes} from "date-fns";


import {ApiService} from "../../service/api.service";


@Component({
  selector: 'app-appointment-group-event',  
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './appointment-group-event.component.html',
  styleUrls: ['./appointment-group-event.component.scss']
})
export class AppointmentGroupEventComponent implements OnInit {
  loading = true;

  pageHeader = '';
   // search fields
   rangeDates: Date[];
   users: any[];
   userObj: any;
   trainerObj = null;
   aptStatus: any = '';

   trainers: any[];
   statuses = [];
   bookings: any;
   appointments: any;

   paramBookId: string;
   date: Date;
   showTrainer = true;

   constructor(private api: ApiService,private route: ActivatedRoute, public appointmentService: AppointmentService, private router: Router, private confirmationService: ConfirmationService, public dialogService: DialogService, public messageService: MessageService, private translateService: TranslateService, public lemonade: Lemonade) {
    this.paramBookId = this.route.snapshot.paramMap.get('id');
  }


  ngOnInit(): void {
    this.date = new Date();
    this.pageHeader = "Change Trainer of Group Training";
    this.rangeDates = [new Date(), addDays(new Date(), 14)];
    this.loadData();
    //this.statuses = this.lemonade.appointmentStatus;
  }

  loadData() {
    //console.log('date range2===', this.rangeDates);
         /*   if (this.rangeDates.length == 2 && this.rangeDates[1]) { */
                this.loading = true;
                let params = {
                    from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
                    to_date: this.lemonade.formatPostDate(this.rangeDates[1])
                } 
                /* if (this.userObj) {
                    params = {...params, ...{customerId: this.userObj.id}};
                } */
                /* if (this.trainerObj > 0) {
                    params = {...params, ...{trainerId: this.trainerObj}};
                }
                if (this.aptStatus) {
                    params = {...params, ...{status: this.aptStatus}};
                } */
                /* if (this.paramBookId) {
                    params = {...params, ...{bookId: this.paramBookId}};
                }
     */
                this.api.get('api/gorup-event-appointments', params).subscribe( res => {
                //this.appointmentService.getGroupEventAppointments(params).subscribe(res => {
                    this.appointments = res.data;

                    console.log("appointments=",this.appointments)
                    this.pageHeader = "Change Trainer of Group Training";
                   /*  this.isManager = res.manager;   // 202303 internal coach or above
                    //
                    this.showCustomer = res.showCustomer;
                    this.showTrainer = res.showTrainer;
                    this.newable = res.newable;
                    this.requiredTrainer = res.requiredTrainer;
                    this.supportPackages = res.supportPackages;
                    this.supportFinance = res.supportFinance;
                    this.supportPaymentGateway = res.paymentGateway;
                    this.timeslotSetting = res.timeslotSetting;
                    this.checkInBeforeMinute = res.checkInBeforeMinute;
                    this.checkInAfterMinute = res.checkInAfterMinute;
                    if (this.showTrainer) {
                        this.appointmentService.getActiveTrainers().subscribe(res => {
                            this.trainers = res.data;
                        });
                    } */
                    this.loading = false;
                });
           // } 
  }

  
  searchUsers(e) {
    this.appointmentService.getUsers(e.query).subscribe( res => {
        this.users = res.data;
    });
  }

}
