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

    constructor(public appMain: AppMainComponent, public authService: AuthService, private translateService: TranslateService) { }

    ngOnInit() {
    }

    logout() {
        this.authService.logOut();
    }
}
