import {Component, NgZone} from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {AuthService} from "./service/auth.service";
import {ConfigService} from "./service/app.config.service";
import {TranslateService} from "@ngx-translate/core";

import {App, URLOpenListenerEvent} from "@capacitor/app";
import {Router} from "@angular/router";


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    menuMode = 'static';

    constructor(private primengConfig: PrimeNGConfig, private router: Router, private zone: NgZone, private configService: ConfigService, private authService: AuthService, private translate: TranslateService) {
        this.initializeApp();
    }

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

    initializeApp() {
        App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
            this.zone.run(() => {
                // Example url: https://beerswift.app/tabs/tab2
                // slug = /tabs/tab2
                const slug = event.url.split(".com").pop();
                if (slug) {
                    this.router.navigateByUrl(slug);
                }
                // If no match, do nothing - let regular routing
                // logic take over
            });
        });
    }

    isAutorized(): boolean {
        return this.authService.isLoggedIn;
    }
}
