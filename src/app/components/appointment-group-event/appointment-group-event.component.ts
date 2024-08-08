import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {AppointmentService} from "../../service/appointmentservice";
import {ConfirmationService, MessageService} from "primeng/api";
import {DialogService, DynamicDialogRef} from "primeng/dynamicdialog";
import {TranslateService} from "@ngx-translate/core";
import {Lemonade} from "../../service/lemonade.service";
import {addDays, addMinutes, isAfter, isWithinInterval, subHours, subMinutes} from "date-fns";


import {ApiService} from "../../service/api.service";
import { collectExternalReferences } from '@angular/compiler';


@Component({
  selector: 'app-appointment-group-event',  
  providers: [DialogService, MessageService, ConfirmationService],
  templateUrl: './appointment-group-event.component.html',
  styleUrls: ['./appointment-group-event.component.scss']
})
export class AppointmentGroupEventComponent implements OnInit {
  loading = true;
  //paginator
  rows = 0;
  totalRecords = 0;

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


   //dialog
   trainerrateFormDialog = false;
   formHeader = 'Edit Form';
   submitted = false;
   editable = false;
   trainer_and_rate_lists : any ;
   trainer_and_rate_lists2 : any ;
   dialog_appointment_id = null;
   dialog_package_description : any;
   dialog_appointment_starttime : any;
   dialog_start_time : any;
   dialog_end_time : any;
   dialog_trainer_and_rate : [];
   clonedTrainerRate : [][];

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
                    console.log("appointments111=",this.appointments)
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

  onRowEditInit(trainer_and_rate_list)
  {

    this.clonedTrainerRate = JSON.parse(JSON.stringify(this.trainer_and_rate_lists));
    //console.log("trainer====", trainer_and_rate_list.id) ;
    
    console.log("temp1=", this.clonedTrainerRate);
  }

  onRowEditSave(appointment_id, trainer_and_rate_lists)
  {
    this.saveform(appointment_id, trainer_and_rate_lists)
    

  }

  onRowEditCancel(trainer_and_rate_list, index: number)
  {
    this.trainer_and_rate_lists = JSON.parse(JSON.stringify(this.clonedTrainerRate));
  }
  
  edit(appointment){
    this.formHeader = "Edit Form";
    this.submitted = false;
    this.trainerrateFormDialog = true;
    console.log("appointment====", appointment);
    this.trainer_and_rate_lists =  this.lemonade.showTrainerRateList(appointment.trainer_and_rate_list);
    this.trainer_and_rate_lists2 =  this.lemonade.showTrainerRateList(appointment.trainer_and_rate_list);
    console.log("trainer and rate lists====",  this.trainer_and_rate_lists);

    this.dialog_appointment_id = appointment.appointment_id;
    this.dialog_package_description = appointment.description;
    this.dialog_appointment_starttime = appointment.appointment_starttime;
    this.dialog_start_time = appointment.appointment_starttime;
    this.dialog_end_time = appointment.appointment_endtime;
    this.dialog_trainer_and_rate = appointment.trainer_and_rate_list;
    console.log("DTR==", this.dialog_trainer_and_rate);

  }
  
  canAmend(user) {
    return true; // this.editable;
  }

  
  hideDialog() {
    this.trainerrateFormDialog = false
    
  } 

  doDelTrainerRate(appointment_id, trainer_and_rate_list, trainer_and_rate_lists)
    {
        
        this.translateService.get(['Are you sure to delete?']).subscribe( msg => {
            this.confirmationService.confirm({
                message: msg['Are you sure to delete?'],
                accept: () => {
                    //remove from trainer_and_rate_lists
                
                var index = this.trainer_and_rate_lists.findIndex(function(item, i){
                  return item.id === trainer_and_rate_list.id;
                });
                console.log("delete", trainer_and_rate_list );
                console.log("index==", index );
                this.trainer_and_rate_lists.splice(index, 1);
                console.log("after delete", trainer_and_rate_lists );
                
                this.saveform(appointment_id, trainer_and_rate_lists);
                    /* this.api.delete('api/trainerrates/' +  trainerrate.id ).subscribe(res => {
                        if (res.success == true) {
                            this.loadTrainerRates(student_id, true);

                            this.lemonade.ok(this.messageService, 'The record is deleted successfully.');
                        } else {
                            this.lemonade.error(this.messageService, res);
                        }
                    }); */
                }
            });
        });
  }

 saveform(appointment_id, trainer_and_rate_lists){
  console.log("save trainer rate list=", trainer_and_rate_lists );
    console.log("app_id=", appointment_id);
    this.submitted = true;
    let data = {
      appointmentid: appointment_id,
      trainerandratelist: trainer_and_rate_lists,
      
    };
    let call = this.api.post('api/group-event-update-trainer', data)

    call.subscribe( res => {
        console.log('save package res=', res);
        if (res.success == true) {
            this.submitted = false;
            this.loadData();
            this.hideDialog();
            this.lemonade.ok(this.messageService);
        } else {
            // error.
            this.lemonade.error(this.messageService, res);
        }
    }, error => {
        this.lemonade.validateError(this.messageService, error);
    });;
 }   
}
