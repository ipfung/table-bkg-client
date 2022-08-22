import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";

@Component({
  selector: 'app-timeslot-list',
  templateUrl: './timeslot-list.component.html',
  styleUrls: ['./timeslot-list.component.scss']
})
export class TimeslotListComponent implements OnInit {

    loading = true;

    timeslots = [];
    editable = false;

    // form variables.
    formDialog = false;
    submitted = false;
    timeslot: any;
    weeks = [];
    locations = [];
    formHeader = "Edit Timeslot";

    constructor(private api: ApiService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.loadData();
        this.weeks = [
            {
                name: 'Monday',
                code: 1
            }, {
                name: 'Tuesday',
                code: 2
            }, {
                name: 'Wednesday',
                code: 3
            }, {
                name: 'Thursday',
                code: 4
            }, {
                name: 'Friday',
                code: 5
            }, {
                name: 'Saturday',
                code: 6
            }, {
                name: 'Sunday',
                code: 7
            }
        ];
        // load locations.
        this.api.get('api/locations').subscribe( res => {
            this.locations = res.data;
            this.editable = res.editable;
        });
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
        });
    }

    openNew(weekDay) {
        this.formHeader = "Create Working Hours";
        this.timeslot = {
            location_id: 1,
            day_idx: weekDay
        };
        this.submitted = false;
        this.formDialog = true;
    }

    edit(timeslot) {
        this.formHeader = "Edit Working Hours";
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
}
