import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {DashboardService} from "../../service/dashboard.service";

@Component({
    selector: 'app-notifications-list',
    templateUrl: './notifications-list.component.html',
    styleUrls: ['./notifications-list.component.scss']
})
export class NotificationsListComponent implements OnInit {
    loading = true;
    notifications = [];

    showCustomer: boolean;
    constructor(private api: ApiService, public lemonade: Lemonade, private dashboardService: DashboardService) {
    }

    ngOnInit(): void {
        this.api.get('api/notifications').subscribe(res => {
            this.notifications = res.data;
            this.showCustomer = res.showCustomer;  // it's manager
            this.loading = false;
        });
    }

    markAsRead(message) {
        this.api.update('api/notifications/' + message.id, {
            read: 1
        }).subscribe( res => {
            if (res.success == true) {
                message.has_read = res.read;
                this.dashboardService.markAsRead();
            }
        })
    }
}
