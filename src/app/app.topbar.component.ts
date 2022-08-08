import {Component, OnDestroy, OnInit} from '@angular/core';
import { AppMainComponent } from './app.main.component';
import { Subscription } from 'rxjs';
import { MenuItem } from 'primeng/api';
import {AuthService} from "./service/auth.service";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent implements OnInit {

    items: MenuItem[];

    userProFileItems: MenuItem[];

    constructor(public appMain: AppMainComponent, private authService: AuthService, private translateService: TranslateService) { }

    ngOnInit() {
        this.translateService.get(['Edit Profile', 'Sign Out']).subscribe(res => {
            this.userProFileItems = [{
                label: res['Edit Profile'],
                icon: 'pi pi-user-edit',
                // routerLink: '/user-profile',
                command: () => {
                    this.profile();
                }
            }, {
                label: res['Sign Out'],
                icon: 'pi pi-sign-out',
                command: () => {
                    this.logout();
                }
            }];
        });
    }

    profile(e?) {

    }

    logout() {
        this.authService.logOut();
    }
}
