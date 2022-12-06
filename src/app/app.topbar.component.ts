import {Component, OnDestroy, OnInit} from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import {AuthService} from "./service/auth.service";
import {TranslateService} from "@ngx-translate/core";
import {DashboardService} from "./service/dashboard.service";
import {Lemonade} from "./service/lemonade.service";

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html',
    styleUrls: ['./app.topbar.component.scss']
})
export class AppTopBarComponent implements OnInit {
    userName: string;
    userNameBg: string;
    showAppointmentButton: boolean;

    items: MenuItem[];

    subscription: Subscription;

    notificationsBadge = 0;

    avatar: string;

    constructor(public appMain: AppMainComponent, public authService: AuthService, private translateService: TranslateService, private dashboardService: DashboardService, public lemonade: Lemonade) { }

    async ngOnInit() {
        this.avatar = await this.authService.avatar();
        this.userName = await this.authService.userName();
        this.userNameBg = await this.authService.avatarColor();
        const btn = await this.authService.appointmentButton();
        this.showAppointmentButton = (btn === 'true');
        this.subscription = this.dashboardService.notifications$.subscribe(counter => {
            this.notificationsBadge = counter;
        });
    }

    getAvatar() {
        return this.lemonade.getAvatar({
            avatar: this.avatar
        });
    }

    logout() {
        this.authService.logOut();
    }
}
