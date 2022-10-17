import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {AppointmentService} from "../../service/appointmentservice";

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {

    loading = true;

    packages = [];
    editable = false;

    // form variables.
    formDialog = false;
    submitted = false;
    pkg: any;
    sessions = [];
    services = [];
    rooms = [];
    trainers = [];
    day_of_weeks = [];
    times: any[] = [];
    statuses = [];
    locations = [];
    formHeader = "Edit Form";

    constructor(private api: ApiService, public appointmentService: AppointmentService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.loadData();
        this.statuses = [
            {
                name: 'active',
                code: 1001
            }, {
                name: 'suspended',
                code: 1002
            }
        ];
        this.day_of_weeks = [{
            id: 1,
            name: 'Monday'
        }, {
            id: 2,
            name: 'Tuesday'
        }, {
            id: 3,
            name: 'Wednesday'
        },{
            id: 4,
            name: 'Thursday'
        },{
            id: 5,
            name: 'Friday'
        },{
            id: 6,
            name: 'Saturday'
        },{
            id: 7,
            name: 'Sunday'
        }];
        // load services.
        this.api.get('api/services', {
            status: 1001
        }).subscribe( res => {
            this.services = res.data;
            this.sessions = this.services[0].sessions;
        });

        this.api.get('api/rooms', {
            status: 1001
        }).subscribe( res => {
            this.rooms = res.data;
        });

        this.api.get('api/trainers', {
            status: 'active',
            role: 'Trainer'
        }).subscribe( res => {
            this.trainers = res.data;
        });
    }

    loadData() {
        this.loading = true;
        this.api.get('api/packages').subscribe( res => {
            this.packages = res.data;
            this.loading = false;
            this.editable = res.editable;
        });
    }

    openNew() {
        this.formHeader = "Create Form";
        this.pkg = {
            service_id: 0,
            room_id: '',
            trainer_id: '',
            quantity: 4,
            status: this.statuses[0].code,
            recurring: {
                repeat: []
            }
        };
        if (this.services.length > 0) {
            this.pkg.service_id = this.services[0].id;
            this.pkg.noOfSession = this.services[0].sessions[0].code;
        }
        this.submitted = false;
        this.formDialog = true;
    }

    edit(pkg) {
        this.formHeader = "Edit Form";
        this.pkg = {...pkg, ...{
            recurring: JSON.parse(pkg.recurring)
        }};
        this.formDialog = true;
    }

    canAmend(pkg) {
        // FIXME only manager could edit.
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        let call;
        this.submitted = true;
        if (this.pkg.name == undefined)
            return;
        if (this.pkg.description == undefined)
            return;
        if (this.pkg.service_id == undefined)
            return;
        if (this.pkg.quantity == undefined)
            return;
        if (this.pkg.recurring.repeat == undefined || this.pkg.recurring.repeat.length == 0)
            return;

        const data = {...this.pkg, ...{
                recurring: {cycle: 'weekly', quantity: this.pkg.quantity, repeat: this.pkg.recurring.repeat}
            }
        };
        if (this.pkg.id > 0) {
            call = this.api.update('api/packages/' + this.pkg.id, data)
        } else {
            call = this.api.post('api/packages', data);
        }
        call.subscribe( res => {
            console.log('save package res=', res);
            if (res.success == true) {
                this.submitted = false;
                this.loadData();
                this.hideDialog();
            }
        });
    }
}