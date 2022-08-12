import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Router} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-trainer-student-list',
    templateUrl: './trainer-student-list.component.html',
    styleUrls: ['./trainer-student-list.component.scss']
})
export class TrainerStudentListComponent implements OnInit {
    trainers = [];
    loading = true;
    constructor(private api: ApiService, private router: Router) {
    }

    ngOnInit(): void {
        this.api.get('api/trainer-students').subscribe( res => {
            this.trainers = res.data;
            this.loading = false;
        });
    }

    getAvatar(user) {
        return environment.url + 'storage/' + user.avatar;
    }

    edit(trainer) {
        // this.router.navigate(['/reschedule', trainer.id]);
        this.router.navigate(['/trainer-student-form', trainer.id]);
    }

    canAmend(trainer) {
        // FIXME only manager could edit.
        return true;
    }
}
