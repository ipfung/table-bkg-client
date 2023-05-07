import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {MessageService} from "primeng/api";

@Component({
    selector: 'app-service-list',
    providers: [MessageService],
    templateUrl: './service-list.component.html',
    styleUrls: ['./service-list.component.scss']
})
export class ServiceListComponent implements OnInit {

    loading = true;

    services = [];
    editable = false;

    // form variables.
    formDialog = false;
    submitted = false;
    service: any;
    statuses = [];
    categories = [];
    formHeader = "Edit Form";

    constructor(private api: ApiService, public lemonade: Lemonade, private messageService: MessageService) {
    }

    ngOnInit(): void {
        this.loadData();
        this.statuses = [
            {
                name: 'visible on website',
                code: 1001
            }, {
                name: 'invisible on website',
                code: 1002
            }
        ];
        // load categories.
        this.api.get('api/categories').subscribe( res => {
            this.categories = res.data;
        });
    }

    loadData() {
        this.loading = true;
        this.api.get('api/services').subscribe( res => {
            this.services = res.data;
            this.loading = false;
            this.editable = res.editable;
        });
    }

    openNew() {
        this.formHeader = "Create Form";
        this.service = {
            location_id: 0,
            status: this.statuses[0].code
        };
        this.submitted = false;
        this.formDialog = true;
    }

    edit(service) {
        this.formHeader = "Edit Form";
        this.service = {...service};
        this.formDialog = true;
    }

    canAmend(service) {
        // FIXME only manager could edit.
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        let call;
        this.submitted = true;
        if (this.service.name == undefined)
            return;
        if (this.service.id > 0) {
            call = this.api.update('api/services/' + this.service.id, this.service)
        } else {
            call = this.api.post('api/services', this.service);
        }
        call.subscribe( res => {
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
