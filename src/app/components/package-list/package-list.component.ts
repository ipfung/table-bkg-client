import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {AppointmentService} from "../../service/appointmentservice";
import {LazyLoadEvent} from "primeng/api";

@Component({
  selector: 'app-package-list',
  templateUrl: './package-list.component.html',
  styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {

    loading = true;
    //paginator
    rows = 0;
    totalRecords = 0;

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
    sessionInterval: any;

    constructor(private api: ApiService, public appointmentService: AppointmentService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.statuses = [
            {
                name: 'active',
                code: '1001'
            }, {
                name: 'suspended',
                code: '1002'
            }
        ];
        this.day_of_weeks = this.lemonade.weeks;

        // load data for form.
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

    loadData(event: LazyLoadEvent) {
        this.loading = true;
        let page = event ? (event.first/event.rows) : 0;
        let params = {
            page: (1 + page),
        };
        this.api.get('api/packages', params).subscribe( res => {
            this.packages = res.data;
            this.loading = false;
            this.editable = res.editable;
            this.rows = res.per_page;
            this.totalRecords = res.total;
        });
    }

    loadTime() {
        this.appointmentService.getPackageTimeslot(this.pkg.service_id, this.pkg.no_of_session, this.pkg.start_date).subscribe( res => {
            this.times = res.data;
            this.sessionInterval = res.sessionInterval;
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
        // fix pkg.recurring.repeat if it's crashed.
        const recurring = JSON.parse(pkg.recurring);
        if (recurring.cycle == 'weekly') {
            // only allow 1-7(monday to sunday)
            const filteredArray = recurring.repeat.filter(e => ([1,2,3,4,5,6,7].includes(e)));
            recurring.repeat = filteredArray;
        }

        this.pkg = {...pkg, ...{
                recurring: recurring,
                start_date: pkg.start_date ? new Date(pkg.start_date) : undefined,
                end_date: pkg.end_date ? new Date(pkg.end_date) : undefined
            }
        };
        this.loadTime();
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

        let data = {...this.pkg, ...{
                recurring: {cycle: 'weekly', quantity: this.pkg.quantity, repeat: this.pkg.recurring.repeat.sort()}
            }
        };
        if (this.pkg.start_date) {
            data = {...data, ...{
                    start_date: this.lemonade.formatPostDate(this.pkg.start_date)
                }
            }
        }
        if (this.pkg.end_date) {
            data = {...data, ...{
                    end_date: this.lemonade.formatPostDate(this.pkg.end_date)
                }
            }
        }
        if (this.pkg.id > 0) {
            call = this.api.update('api/packages/' + this.pkg.id, data)
        } else {
            call = this.api.post('api/packages', data);
        }
        call.subscribe( res => {
            console.log('save package res=', res);
            if (res.success == true) {
                this.submitted = false;
                this.loadData(null);
                this.hideDialog();
            }
        });
    }
}
