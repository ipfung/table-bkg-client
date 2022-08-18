import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-notifications-list',
    templateUrl: './notifications-list.component.html',
    styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
    loading = true;
    notifications = [];


    constructor(private api: ApiService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.api.get('api/notifications').subscribe(res => {
            this.notifications = res.data;
            this.loading = false;
        });
    }

}
