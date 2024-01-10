import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {MessageService} from "primeng/api";

@Component({
    selector: 'app-notification-templates',
    providers: [MessageService],
    templateUrl: './notification-templates.component.html',
    styleUrls: ['./notification-templates.component.scss']
})
export class NotificationTemplatesComponent implements OnInit {

    loading = true;

    customer_whatsapp_templates = [];
    trainer_whatsapp_templates = [];
    trainer_email_templates = [];
    customer_email_templates = [];

    editable = false;
    support_whatsapp = false;

    // form variables.
    formDialog = false;
    submitted = false;
    wtpl: any;    // whatsapp
    etpl: any;    // email
    statuses = [];
    languages = [];
    formHeader = "Edit Form";

    constructor(private api: ApiService, public lemonade: Lemonade, private messageService: MessageService) {

    }

    ngOnInit(): void {
        this.loadData();
    }

    loadData() {
        this.loading = true;
        this.api.get('api/notification-templates', {
            type: 'email'
        }).subscribe( res => {
            this.customer_email_templates = res.customer_data;
            this.trainer_email_templates = res.trainer_data;
            this.etpl = {...res.customer_data[0]};
            this.editable = res.editable;
            this.support_whatsapp = res.whatsapp_notifications;
            if (this.support_whatsapp) {
                this.api.get('api/notification-templates', {
                    type: 'whatsapp'
                }).subscribe(res1 => {
                    this.wtpl = {...res1.customer_data[0]};
                    this.customer_whatsapp_templates = res1.customer_data;
                    this.trainer_whatsapp_templates = res1.trainer_data;
                    this.editable = res1.editable;
                    this.loading = false;
                });
            } else {
                this.loading = false;
            }
        });
    }

    editWhatsApp(tpl) {
        this.wtpl = {...tpl};
    }

    editEmail(tpl) {
        this.etpl = {...tpl};
    }

    saveEmail() {

    }
}
