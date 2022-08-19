import {Component, OnDestroy, OnInit} from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import {AuthService} from "./service/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {DashboardService} from "./service/dashboard.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

    items: MenuItem[];

    subscription: Subscription;

    notificationsBadge = 0;

    constructor(public appMain: AppMainComponent, public authService: AuthService, private translateService: TranslateService, private dashboardService: DashboardService) { }

    ngOnInit() {
        this.subscription = this.dashboardService.notifications$.subscribe(counter => {
            this.notificationsBadge = counter;
        });
    }

    logout() {
        this.authService.logOut();
    }
}
