import { Component } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {AuthService} from "./service/auth.service";
import {TranslateService} from "@ngx-translate/core";
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    menuMode = 'static';

    constructor(private primengConfig: PrimeNGConfig, private authService: AuthService, private translate: TranslateService) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        document.documentElement.style.fontSize = '14px';
        this.translate.setDefaultLang('zh');
        // console.log('lang===', this.translate.getDefaultLang());
    }

    isAutorized(): boolean {
        return this.authService.isLoggedIn;
    }
}
