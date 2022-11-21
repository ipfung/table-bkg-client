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
    newable = false;
    roles: any[];

    isNew = false;
    //general form
    statuses = [];

    // form variables.
    supportMultiStudent: boolean;
    timeslotSetting: string;
    editable = false;
    formDialog = false;
    submitted = false;
    trainer: any;
    availableStudents = [];
    formHeader = "Edit Form";

    // timeslot tab
    timeslots = [];
    timeslot: any;
    weeks = [];
    tsEditable = false;
    tsFormDialog = false;
    tsFormHeader = "Edit Form";
    tsSubmitted = false;

    //trainer workDates.
    workdateFormHeader: string;
    workDate: any;
    workdateSubmitted: boolean;
    workdateFormDialog: boolean;
    trainerWorkDate: Date;
    workdateLoading: boolean;
    trainerWorkdateTimeslots: any[];

    constructor(private api: ApiService, private router: Router, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.loadData();
        // load trainer roles only.
        this.api.get('api/get-roles', {type: 'coach'}).subscribe( res => {
            this.roles = res.data;
        });
        this.weeks = this.lemonade.weeks;
        this.statuses = this.lemonade.userStatus;
    }

    loadData() {
        this.api.get('api/trainers').subscribe( res => {
            this.trainers = res.data;
            this.totalRecords = res.total;
            this.editable = res.editable;
            this.newable = res.newable;
            this.supportMultiStudent = res.multi_student;
            this.timeslotSetting = res.timeslotSetting;
            this.loading = false;
        });
    }

    findRoleColor(roleId) {
        if (this.roles && this.roles.length > 0 && roleId > 0) {
            let data = this.roles.find(el => el.id == roleId);
            return data.color_name;
        }
        return 'grey';
    }

    roleRenderer(roleId) {
        if (this.roles && this.roles.length > 0 && roleId > 0) {
            let data = this.roles.find(el => el.id == roleId);
            return data.name;
        }
        return '';
    }

    openNew() {
        this.formHeader = "Create Form";
        this.trainer = {
            status: this.statuses[0].code,
            teammates: []
        };
        this.submitted = false;
        this.formDialog = true;
        this.api.get('api/availability-students/0').subscribe( res => {
            this.availableStudents = res.data;
        });
        this.isNew = true;
    }

    edit(trainer) {
        this.formHeader = "Edit Form";
        // this.router.navigate(['/trainer-student-form', trainer.id]);
        this.trainer = {...trainer};
        this.formDialog = true;
        this.api.get('api/availability-students/' + trainer.id).subscribe( res => {
            console.log('/availability-students edit list=', res);
            this.availableStudents = res.data;
        });
        if (this.timeslotSetting == 'trainer_date') {
            this.loadWorkDateData()
        } else {
            this.loadTimeslotData(trainer);
        }
        this.isNew = false;
    }

    canAmend(trainer) {
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
    }


    isFormValid() {
        let failed = (!this.trainer.name || !this.trainer.email || !this.trainer.mobile_no || !this.trainer.second_name);
        if (this.isNew && !failed) {
            failed = (!this.trainer.password);
        }
        return !failed;
    }

    save() {
        this.submitted = true;
        if (!this.isFormValid()) return;
        let call;
        let params = {...this.trainer, ...{
                "teammates": this.trainer.teammates.map((obj) => obj.id),
                "counter": this.trainer.teammates.length
            }
        };
        if (this.trainer.id > 0) {
            call = this.api.update('api/trainers/' + this.trainer.id, params)
        } else {
            call = this.api.post('api/trainers', params);
        }
        call.subscribe( res => {
            console.log('save users res=', res);
            if (res.success === true) {
                this.loadData();
                this.hideDialog();
            } else {
                // error.
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
            day_idx: weekDay,
            from_time: '09:00',
            to_time: '18:00'
        };
        this.tsSubmitted = false;
        this.tsFormDialog = true;
    }

    copyTimeslot(trainer) {
        // copy from Monday to all other days.
        this.api.post('api/copy-trainer-timeslots', {
            trainer_id: trainer.id
        }).subscribe(res => {
            if (res.success == true)
                this.loadTimeslotData(trainer);
        });
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

    /**
     * Trainer working hours per date.
     */
    loadWorkDateData() {
        this.api.get('api/trainer-workdate-timeslots', {
            trainer_id: this.trainer.id
        }).subscribe( res => {
            this.trainerWorkdateTimeslots = res.data;
            this.workdateLoading = false;
        });
    }

    openNewWorkDate() {
        this.workdateFormHeader = "Create Form";
        this.workDate = {
            location_id: 1,
            trainer_id: this.trainer.id,
            from_time: '09:00',
            to_time: '18:00'
        };
        this.trainerWorkDate = null;
        this.workdateSubmitted = false;
        this.workdateFormDialog = true;
    }

    editWorkDate(workdate) {
        this.workdateFormHeader = "Edit Form";
        this.workDate = {...workdate};
        this.trainerWorkDate = new Date(workdate.work_date);
        this.workdateSubmitted = false;
        this.workdateFormDialog = true;
    }

    hideWorkDateDialog() {
        this.workdateFormDialog = false;
    }

    saveWorkDate() {
        let call;
        this.workdateSubmitted = true;
        if (!this.trainerWorkDate || !this.workDate.from_time || !this.workDate.to_time) {
            return;
        }
        this.workDate.work_date = this.lemonade.formatPostDate(this.trainerWorkDate);
        if (this.workDate.id > 0) {
            call = this.api.update('api/trainer-workdate-timeslots/' + this.workDate.id, this.workDate);
        } else {
            call = this.api.post('api/trainer-workdate-timeslots', this.workDate);
        }
        call.subscribe( res => {
            console.log('save trainer-workdate-timeslots res=', res);
            if (res.success == true) {
                this.loadWorkDateData();
                this.hideWorkDateDialog();
            }
        });
    }
}
