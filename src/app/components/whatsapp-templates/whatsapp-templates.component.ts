import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {MessageService} from "primeng/api";

@Component({
    selector: 'app-whatsapp-templates',
    providers: [MessageService],
    templateUrl: './whatsapp-templates.component.html',
    styleUrls: ['./whatsapp-templates.component.scss']
})
export class WhatsappTemplatesComponent implements OnInit {

    loading = true;

    templates = [];
    editable = false;

    // form variables.
    formDialog = false;
    submitted = false;
    tpl: any;
    statuses = [];
    languages = [];
    formHeader = "Edit Form";

    constructor(private api: ApiService, public lemonade: Lemonade, private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.loadData();
        this.languages = [{
            name: 'approved',
            code: 'APPROVED'   // from whatsapp
        }, {
            name: 'pending',
            code: 'pending'
        }];
    }

    loadData() {
        this.loading = true;
        this.api.get('api/whatsapp/message-templates').subscribe( res => {
            this.templates = [];
            for (const d of res.data) {
                if (d.name.indexOf("sample_") == 0 || d.name == 'hello_world')
                    continue;
                this.templates.push(d);
            }
            this.loading = false;
            this.editable = res.editable;
        });
    }

    openNew() {
        this.formHeader = "Create Form";
        this.tpl = {
            location_id: 0,
            status: this.statuses[0].code
        };
        this.submitted = false;
        this.formDialog = true;
    }

    edit(tpl) {
        this.formHeader = "Edit Form";
        this.tpl = {...tpl};
        this.formDialog = true;
    }

    canAmend(room) {
        // FIXME only manager could edit.
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        let call;
        this.submitted = true;
        if (this.tpl.name == undefined)
            return;
        if (this.tpl.id > 0) {
            call = this.api.update('api/whatsapp/message-templates' + this.tpl.id, this.tpl)
        } else {
            call = this.api.post('api/whatsapp/message-templates', this.tpl);
        }
        call.subscribe( res => {
            console.log('save room res=', res);
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
        });
    }
}
