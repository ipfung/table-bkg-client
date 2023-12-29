import { Component, OnInit } from '@angular/core';


import {addDays, subDays} from "date-fns";
import {ApiService} from "../../service/api.service";
import {LazyLoadEvent, MessageService} from "primeng/api";
import {Lemonade} from "../../service/lemonade.service";
import {TranslateService} from "@ngx-translate/core";
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute} from "@angular/router";
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-report-trainer-commissions',
  templateUrl: './report-trainer-commissions.component.html',
  styleUrls: ['./report-trainer-commissions.component.scss']
})
export class ReportTrainerCommissionsComponent implements OnInit {
  private EXCEL_EXTENSION = '.xlsx';
  loading = true;
  //paginator
  rows = 0;
  totalRecords = 0;
  commissions: any;

  // search fields
  rangeDates: Date[];
  searchPaymentStatus = '';
  paymentStatusList = [];
  searchTrainer: any;
  supportPaymentGateway = false;
  trainers = [];    
  
  showTrainer = true;
  trainerObj = null;

  constructor(private api: ApiService, public appointmentService: AppointmentService, private translateService: TranslateService, public lemonade: Lemonade, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.rangeDates = [subDays(new Date(), 7), addDays(new Date(), 7)];
  }

  loadTrainerCommissionsData(event: LazyLoadEvent){
    this.loading = true;
    let page = event ? (event.first/event.rows) : 0;
     let params = {
        page: (1+page),
        // size: event.rows,   // if we want to let user define no. of record per page. but server size neds to capture 'size' params too.
        // passing from_date 'Unsupported operand types' error.
        from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
        to_date: this.lemonade.formatPostDate(this.rangeDates[1]),
        //payment_status: this.searchPaymentStatus ? this.searchPaymentStatus : ''
    };
   /*  if (this.showTrainer && this.searchTrainer && this.searchTrainer.id) {
        params = {...params, ...{trainer_id: this.searchTrainer.id}};
    }  */
    if (this.trainerObj > 0) {
        params = {...params, ...{trainerId: this.trainerObj}};
      }
    console.log('trainer commission loaddata event===', event);
    console.log('trainer params', params   );
    //if (this.rangeDates.length == 2 && this.rangeDates[1]) {
        this.api.get('api/report-trainer-commission', params).subscribe(res => {
             this.commissions = res.data;
           /* this.showCustomer = res.showCustomer;
            this.editable = res.showCustomer; */
            console.log('trainercommission',res )
            this.supportPaymentGateway = res.paymentGateway;
            this.loading = false;
            this.rows = res.per_page;
            this.totalRecords = res.total;
        });
    //}

     this.appointmentService.getActiveTrainers().subscribe( res => {
            this.trainers = res.data;
        });
  }

    exportExcel3() {
        console.log('export-report-sales-xlsx===');
        this.downloadfile().subscribe((resp: any) => {
            // const fileSaver: any = new FileSaver();
            // fileSaver.responseData = resp.body;
            // fileSaver.strFileName = 'testdata.xls';
            // fileSaver.strMimeType = 'application/vnd.ms-excel;charset=utf-8';
            // fileSaver.initSaveFile();
            FileSaver.saveAs(resp.body, 'Trainer Commission Report_' + new Date().getTime() + this.EXCEL_EXTENSION);
        });
    }

    downloadfile() {
        const formDataForExport: FormData = new FormData();
        formDataForExport.append('export', 'ALL');

        let params = {
            //page: (1+page),
            // size: event.rows,   // if we want to let user define no. of record per page. but server size neds to capture 'size' params too.
            // passing from_date 'Unsupported operand types' error.
            exporttoexcel: true,
             from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
            to_date: this.lemonade.formatPostDate(this.rangeDates[1]),
           /* payment_status: this.searchPaymentStatus ? this.searchPaymentStatus : '' */
        };
    /* if (this.showCustomer && this.searchCustomer && this.searchCustomer.id) {
            params = {...params, ...{customer_id: this.searchCustomer.id}};
        } */
        if (this.trainerObj > 0) {
            params = {...params, ...{trainerId: this.trainerObj}};
          }
        console.log('formdata', params)
        return this.api.post('api/export-report-trainer-commission-xlsx',params , {
            headers: { 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' },
            responseType: 'blob',
            observe: 'response'
        });
    }

    searchTrainers(e) {
        this.appointmentService.getActiveTrainers().subscribe( res => {
            this.trainers = res.data;
        });
      }

}
