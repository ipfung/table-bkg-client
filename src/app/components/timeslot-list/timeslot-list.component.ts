import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-timeslot-list',
    providers: [MessageService, ConfirmationService],
    templateUrl: './timeslot-list.component.html',
    styleUrls: ['./timeslot-list.component.scss']
})
export class TimeslotListComponent implements OnInit {

    loading = true;

    timeslots = [];
    editable = false;
    doLoading = true;
    daysoffs = [];

    // timeslot form variables.
    formDialog = false;
    submitted = false;
    timeslot: any;
    weeks = [];
    locations = [];
    formHeader = "Edit Form";
    // daysoff variables.
    daysoffFormHeader: string;
    daysoff: any;
    daysoffSubmitted: boolean;
    daysoffFormDialog: boolean;
    offDates: Date[];

    constructor(private api: ApiService, private confirmationService: ConfirmationService, private translateService: TranslateService, private messageService: MessageService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.loadData();
        this.weeks = this.lemonade.weeks;
        // load locations.
        this.api.get('api/locations').subscribe( res => {
            this.locations = res.data;
        });
        this.loadDaysoffData();
    }

    loadData() {
        this.loading = true;
        this.api.get('api/timeslots').subscribe( res => {
            this.timeslots = res.data;
            for (let week of this.weeks) {
                let timeslotData = [];
                for (let ts of this.timeslots) {
                    if (ts.day_idx == week.code) {
                        timeslotData.push(ts);
                    }
                }
                week.data = timeslotData;
            }
            this.loading = false;
            this.editable = res.editable;
        });
    }

    copyTimeslot() {
        // copy from Monday to all other days.
        this.translateService.get(['Apply to all days', 'Error']).subscribe( res => {
            this.confirmationService.confirm({
                message: res['Apply to all days'] + '?',
                accept: () => {
                    this.api.post('api/copy-timeslots', {}).subscribe(res => {
                        if (res.success == true)
                            this.loadData();
                    });
                }
            });
        });
    }

    openNew(weekDay) {
        this.formHeader = "Create Form";
        this.timeslot = {
            location_id: 1,
            day_idx: weekDay
        };
        this.submitted = false;
        this.formDialog = true;
    }

    edit(timeslot) {
        this.formHeader = "Edit Form";
        this.timeslot = {...timeslot};
        this.formDialog = true;
    }

    /**
     * reserved for next phase!!
     * @param weekDay
     */
    isCreating(weekDay) {
        return this.formDialog && this.timeslot.day_idx == weekDay && this.timeslot.id == undefined;
    }

    isEditing(current) {
        return this.formDialog && this.timeslot && this.timeslot.id && current.id == this.timeslot.id;
    }

    hideDialog() {
        this.formDialog = false;
        this.timeslot = {};
    }

    save() {
        let call;
        if (this.timeslot.id > 0) {
            call = this.api.update('api/timeslots/' + this.timeslot.id, this.timeslot);
        } else {
            call = this.api.post('api/timeslots', this.timeslot);
        }
        call.subscribe( res => {
            console.log('save room res=', res);
            if (res.success == true) {
                this.loadData();
                this.hideDialog();
            }
        });
    }

    loadDaysoffData() {
        this.loading = true;
        this.api.get('api/daysoff').subscribe( res => {
            this.daysoffs = res.data;
            this.doLoading = false;
        });
    }

    openNewDaysoff() {
        this.daysoffFormHeader = "Create Form";
        this.daysoff = {
            location_id: 1
        };
        this.offDates = [];
        this.daysoffSubmitted = false;
        this.daysoffFormDialog = true;
    }

    editDaysoff(daysoff) {
        this.daysoffFormHeader = "Edit Form";
        this.daysoff = {...daysoff};
        this.offDates = [new Date(daysoff.start_date), new Date(daysoff.end_date)];
        this.daysoffSubmitted = false;
        this.daysoffFormDialog = true;
    }

    hideDaysoffDialog() {
        this.daysoffFormDialog = false;
    }

    deleteDaysoff() {
        this.translateService.get(['Are you sure to delete?', 'The record is deleted successfully.', 'Warning', 'Error']).subscribe( msg => {
            this.confirmationService.confirm({
                message: msg['Are you sure to delete?'],
                accept: () => {
                    this.api.delete('api/daysoff/' + this.daysoff.id).subscribe(res => {
                        if (res.success == true) {
                            this.loadDaysoffData();
                            this.hideDaysoffDialog();
                            this.messageService.add({
                                severity: 'success',
                                summary: msg['The record is deleted successfully.']
                            });
                        } else {
                            this.messageService.add({
                                severity: 'error',
                                summary: msg['Error'],
                                detail: res.error
                            });
                        }
                    });
                }
            });
        });
    }

    saveDaysoff() {
        let call;
        this.daysoffSubmitted = true;
        if (this.daysoff.name == '') {
            return;
        }
        if (this.offDates.length != 2) {
            return;
        }
        this.daysoff.start_date = this.lemonade.formatPostDate(this.offDates[0]);
        if (this.offDates[1] instanceof Date)
            this.daysoff.end_date = this.lemonade.formatPostDate(this.offDates[1]);
        if (this.daysoff.id > 0) {
            call = this.api.update('api/daysoff/' + this.daysoff.id, this.daysoff);
        } else {
            call = this.api.post('api/daysoff', this.daysoff);
        }
        console.log('this.daysoff=', this.daysoff);
        call.subscribe( res => {
            console.log('save daysoff res=', res);
            if (res.success == true) {
                this.loadDaysoffData();
                this.hideDaysoffDialog();
            }
        });
    }

}
