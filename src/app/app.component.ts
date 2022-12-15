import { Component } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {AuthService} from "./service/auth.service";
import {ConfigService} from "./service/app.config.service";
import {TranslateService} from "@ngx-translate/core";
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    menuMode = 'static';

    constructor(private primengConfig: PrimeNGConfig, private configService: ConfigService, private authService: AuthService, private translate: TranslateService) { }

    ngOnInit() {
        // change theme based on env.
        const config = this.configService.config;
        let themeElement = document.getElementById('theme-css');
        themeElement.setAttribute('href', 'assets/theme/' + config.theme + '/theme.css');

        this.primengConfig.ripple = true;
        document.documentElement.style.fontSize = '14px';
        this.translate.setDefaultLang('zh');
        this.translate.get('primeng').subscribe(res => this.primengConfig.setTranslation(res));
        // console.log('lang===', this.translate.getDefaultLang());
    }

    isAutorized(): boolean {
        return this.authService.isLoggedIn;
    }
}
