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
    }

    edit(trainer) {
        // this.router.navigate(['/trainer-student-form', trainer.id]);
        this.trainer = {...trainer};
        this.formDialog = true;
        this.api.get('api/availability-students/' + trainer.id).subscribe( res => {
            console.log('/availability-students list=', res);
            this.availableStudents = res.data;
        });
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
}
