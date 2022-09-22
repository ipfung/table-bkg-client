import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Router} from "@angular/router";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-trainer-student-list',
    templateUrl: './trainer-student-list.component.html',
    styleUrls: ['./trainer-student-list.component.scss']
})
export class TrainerStudentListComponent implements OnInit {
    trainers = [];
    loading = true;
    totalRecords = 0;

    // form variables.
    editable = false;
    formDialog = false;
    submitted = false;
    trainer: any;
    availableStudents = [];
    formHeader = "Edit Student List";

    // timeslot tab
    timeslots = [];
    timeslot: any;
    weeks = [];
    tsEditable = false;
    tsFormDialog = false;
    tsFormHeader = "Edit Form";
    tsSubmitted = false;

    constructor(private api: ApiService, private router: Router, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.api.get('api/trainer-students', {
            status: 'active'
        }).subscribe( res => {
            this.trainers = res.data;
            this.totalRecords = res.total;
            this.editable = res.editable;
            this.loading = false;
        });
        this.weeks = this.lemonade.weeks;
    }

    edit(trainer) {
        // this.router.navigate(['/trainer-student-form', trainer.id]);
        this.trainer = {...trainer};
        this.formDialog = true;
        this.api.get('api/availability-students/' + trainer.id).subscribe( res => {
            console.log('/availability-students list=', res);
            this.availableStudents = res.data;
        });
        this.loadTimeslotData(trainer);
    }

    canAmend(trainer) {
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        this.api.post('api/trainer-students', {
            "user_id": this.trainer.id,
            "teammates": this.trainer.teammates.map((obj) => obj.id),
            "counter": this.trainer.teammates.length
        }).subscribe( res => {
            console.log('save res=', res);
            if (res.success == true) {
                this.hideDialog();
            }
        });
    }

    /**
     * Below reference(copied) from timeslot-list.component.ts
     */

    /**
     * Below reference(copied) from timeslot-list.component.ts
     * @param trainer
     */
    loadTimeslotData(trainer) {
        this.api.get('api/trainer-timeslots', {
            trainer_id: trainer.id
        }).subscribe( res => {
            this.timeslots = res.data;
            this.hideTimeslotDialog();
            for (let week of this.weeks) {
                let timeslotData = [];
                for (let ts of this.timeslots) {
                    if (ts.day_idx == week.code) {
                        timeslotData.push(ts);
                    }
                }
                week.data = timeslotData;
            }
            this.tsEditable = res.editable;
        });
    }

    openNewTimeslot(weekDay) {
        this.tsFormHeader = "Create Form";
        this.timeslot = {
            trainer_id: this.trainer.id,
            location_id: 1,
            day_idx: weekDay
        };
        this.tsSubmitted = false;
        this.tsFormDialog = true;
    }

    /**
     * reserved for next phase!!
     * @param weekDay
     */
    isCreatingTimeslot(weekDay) {
        return this.tsFormDialog && this.timeslot.day_idx == weekDay && this.timeslot.id == undefined;
    }

    isEditingTimeslot(current) {
        return this.tsFormDialog && this.timeslot && this.timeslot.id && current.id == this.timeslot.id;
    }

    hideTimeslotDialog() {
        this.tsFormDialog = false;
        this.timeslot = {};
    }

    editTimeslot(timeslot) {
        this.tsFormHeader = "Edit Form";
        this.timeslot = {...timeslot};
        this.tsFormDialog = true;
    }

    saveTimeslot() {
        let call;
        if (this.timeslot.id > 0) {
            call = this.api.update('api/trainer-timeslots/' + this.timeslot.id, this.timeslot);
        } else {
            call = this.api.post('api/trainer-timeslots', this.timeslot);
        }
        call.subscribe( res => {
            console.log('save trainer-timeslots res=', res);
            if (res.success == true) {
                this.loadTimeslotData(this.trainer);
                this.hideTimeslotDialog();
            }
        });
    }
}
