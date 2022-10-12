import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {AppointmentService} from "../../service/appointmentservice";
import {addDays, subDays} from "date-fns";
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-trainer-commission',
    providers: [MessageService, ConfirmationService],
  templateUrl: './trainer-commission.component.html',
  styleUrls: ['./trainer-commission.component.scss']
})
export class TrainerCommissionComponent implements OnInit {
    loading = true;

    orders: any;

    // search fields
    rangeDates: Date[];
    trainerList = [];
    newable = false;
    searchCustomer: any;
    searchTrainer: any = 0;    // set 0 or '' the first option will be empty.

    //form
    trainers = [];
    customers = [];
    submitted = false;
    formHeader = 'Create Form';
    formDialog = false;
    order: any;

    constructor(private api: ApiService, private appointmentService: AppointmentService, public lemonade: Lemonade, private confirmationService: ConfirmationService, public messageService: MessageService, private translateService: TranslateService) { }

    ngOnInit(): void {
        this.rangeDates = [subDays(new Date(), 7), addDays(new Date(), 7)];
        this.loadData();
        this.api.get('api/trainers').subscribe(res => {
            this.trainerList = res.data;
        });
    }

    loadData() {
        this.loading = true;
        let params = {
            // page: (1+event.first),
            // size: event.rows,
            // passing from_date 'Unsupported operand types' error.
            order_type: 'commission',
            from_date: this.lemonade.formatPostDate(this.rangeDates[0]),
            to_date: this.lemonade.formatPostDate(this.rangeDates[1])
        };
        if (this.searchCustomer && this.searchCustomer.id) {
            params = {...params, ...{customer_id: this.searchCustomer.id}};
        }
        if (this.rangeDates.length == 2 && this.rangeDates[1]) {
            this.api.get('api/order-commission', params).subscribe(res => {
                this.orders = res.data;
                this.loading = false;
                this.newable = res.showCustomer;
            });
        }
    }

    openNew() {
        this.formHeader = "Create Form";
        this.submitted = false;
        this.formDialog = true;
        this.order = {};
        this.appointmentService.getActiveTrainers().subscribe( res => {
            this.trainers = res.data;
        });
    }

    edit(order) {
        this.order = {...order};
        this.formHeader = "Edit Form";
        this.submitted = false;
        this.formDialog = true;
        this.appointmentService.getActiveTrainers().subscribe( res => {
            this.trainers = res.data;
        });
    }

    searchCustomers(e) {
        this.appointmentService.getActiveCustomers(e.query).subscribe( res => {
            this.customers = res.data;
        });
    }

    hideDialog() {
        this.formDialog = false;
    }

    copy() {
        this.formHeader = "Create Form";
        this.submitted = false;
        this.order.id = 0;
        this.order.customer = undefined;
        this.order.customer_id = 0;
    }

    delete() {
        this.translateService.get(['Are you sure to delete?', 'Error', 'Succeed', 'The record is deleted successfully.']).subscribe( res => {
            this.confirmationService.confirm({
                message: res['Are you sure to delete?'],
                accept: () => {
                    this.api.delete('api/order-commission/' + this.order.id).subscribe(resp => {
                        if (resp.success == true) {
                            this.hideDialog();
                            this.loadData();
                            this.messageService.add({
                                severity: 'success',
                                summary: res['Succeed'],
                                detail: res['The record is deleted successfully.']
                            });
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: res['Error'],
                                detail: res.error
                            });
                        }
                    });
                }
            });
        });
    }

    save() {
        this.submitted = true;
        if (!this.order.customer) {
            return;
        } else {
            this.order.customer_id = this.order.customer.id;
        }
        if (!this.order.trainer_id) {
            return;
        }
        if (!this.order.order_total) {
            return;
        }
        if (!this.order.commission) {
            return;
        }
        let call;
        this.order = {...this.order, ...{
                order_status: 'confirmed',
                payment_status: 'paid',
                order_type: 'commission',
                order_date: this.lemonade.formatPostDate(new Date())

            }
        };
        if (this.order.id > 0) {
            call = this.api.update('api/order-commission/' + this.order.id, this.order);
        } else {
            call = this.api.post('api/order-commission', this.order);
        }
        call.subscribe( res => {
            console.log('save order res=', res);
            if (res.success == true) {
                this.hideDialog();
                this.loadData();
            }
        });
    }
}
