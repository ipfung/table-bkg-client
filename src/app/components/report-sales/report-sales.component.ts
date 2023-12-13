import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {LazyLoadEvent} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {AppointmentService} from "../../service/appointmentservice";
import {ActivatedRoute} from "@angular/router";
import * as FileSaver from 'file-saver';
import { jsPDF } from "jspdf";


import *  as xlsx from 'xlsx-js-style';

@Component({
  selector: 'app-report-sales',
  templateUrl: './report-sales.component.html',
  styleUrls: ['./report-sales.component.scss']
})
export class ReportSalesComponent implements OnInit {

  

  sales = [];
  cols: any[];
  bookings = [];

  exportColumns: any[];

  constructor(private api: ApiService, public appointmentService: AppointmentService, private translateService: TranslateService, public lemonade: Lemonade, private route: ActivatedRoute) { }
  

  ngOnInit(): void {   
    this.loadSalesReport();

    
  }

  /* loadData(event: LazyLoadEvent) {
    this.loading = true;
    let page = event ? (event.first/event.rows) : 0;
    let params = {
        page: (1+page),
        // size: event.rows,   // if we want to let user define no. of record per page. but server size neds to capture 'size' params too.
        // passing from_date 'Unsupported operand types' error.
        from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
        to_date: this.lemonade.formatPostDate(this.rangeDates[1]),
        payment_status: this.searchPaymentStatus ? this.searchPaymentStatus : ''
    };
    if (this.showCustomer && this.searchCustomer && this.searchCustomer.id) {
        params = {...params, ...{customer_id: this.searchCustomer.id}};
    }
// console.log('finance loaddata event===', event);
    if (this.rangeDates.length == 2 && this.rangeDates[1]) {
        this.api.get('api/finance', params).subscribe(res => {
            this.bookings = res.data;
            this.showCustomer = res.showCustomer;
            this.supportPaymentGateway = res.paymentGateway;
            this.loading = false;
            this.rows = res.per_page;
            this.totalRecords = res.total;
        });
    }
} */

loadSalesReport()
{
  this.api.get('api/report-sales').subscribe(res => {
     
    this.bookings = res.data;  
            
    console.log("loadPaymentReport=", res.data) ;
  });
}

exportExcel() {

  const prez = this.bookings ;
  const rows = prez.map(row => ({
    order_date: row.order_date ,
    order_number: row.order_number,
    student: row.customer.name ,
    amount: '$'  + row.order_total,
    payment_status: row.payment_status,
    //payment_gateway:row.payment_gateway
    
  }));
  import("xlsx").then(xlsx => {
    /*
      const worksheet = xlsx.utils.json_to_sheet(rows);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      /* fix headers */
     /* xlsx.utils.sheet_add_aoa(worksheet, [["Victory Table Tennis Limited"]], { origin: "A1" });
      xlsx.utils.sheet_add_aoa(worksheet, [["Order Date", "Order No.", "Student","Amount","Payment Status"]], { origin: "A5" });
      worksheet["!cols"] = [{width:20},{width:20},{width:20},{width:20},{width:18}]

      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "Sales");
*/

        

        let pageheader = [["Victory Table Tennis Limited" ]];
        let Heading = [["Order Date", "Order No.", "Student", "Amount", "Payment Status"]];
        //Had to create a new workbook and then add the header
        const wb = xlsx.utils.book_new();
        const WorkSheet = xlsx.utils.json_to_sheet([]);

        

        xlsx.utils.sheet_add_aoa(WorkSheet, pageheader, { origin: "A1" });

        WorkSheet["A1"].s = {
          font: {
            
            bold: true,
            color: { rgb: "FFFFAA00" },
          },
        };
        xlsx.utils.sheet_add_aoa(WorkSheet, Heading, { origin: "A5" });
        
        //Starting in the second row to avoid overriding and skipping headers
        xlsx.utils.sheet_add_json(WorkSheet, rows, { origin: 'A6', skipHeader: true });
        WorkSheet["A5"].s = {font: { bold:true,color:"#f2f2f2" }};

       
        xlsx.utils.book_append_sheet(wb, WorkSheet, 'Sheet1');
        WorkSheet["!cols"] = [{width:20},{width:20},{width:20},{width:20},{width:18}]
        //xlsx.utils.sheet_add_aoa(WorkSheet, [[{total:"1000"}]], { origin: 'A25' });


        xlsx.writeFile(wb, 'filename.xlsx');

  });

}

exportExcel2()
{
      // STEP 1: Create a new workbook
    const wb = xlsx.utils.book_new();

    // STEP 2: Create data rows and styles
    let row = [
      { v: "Courier: 24", t: "s", s: { font: { name: "Courier", sz: 24 } } },
      { v: "bold & color", t: "s", s: { font: { bold: true, color: { rgb: "FF0000" } } } },
      { v: "fill: color", t: "s", s: { fill: { fgColor: { rgb: "E9E9E9" } } } },
      { v: "line\nbreak", t: "s", s: { alignment: { wrapText: true } } },
    ];

    // STEP 3: Create worksheet with rows; Add worksheet to workbook
    const ws = xlsx.utils.aoa_to_sheet([row]);
    xlsx.utils.book_append_sheet(wb, ws, "readme demo");

    // STEP 4: Write Excel file to browser
    xlsx.writeFile(wb, "xlsx-js-style-demo.xlsx");
}

exportExcel3(){
  //export-report-sales-xlsx
}

exportPdf() {
    import('jspdf').then((jsPDF) => {
        import('jspdf-autotable').then((x) => {
            const doc = new jsPDF.default('p', 'px', 'a4');
            (doc as any).autoTable(this.exportColumns, this.bookings);
            doc.save('bookings.pdf');
        });
    });
}

saveAsExcelFile(buffer: any, fileName: string): void {
  let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
  let EXCEL_EXTENSION = '.xlsx';
  const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
  });
  FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}

}
