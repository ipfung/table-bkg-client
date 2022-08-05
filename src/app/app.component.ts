import { Component } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import {AuthService} from "./service/auth.service";
@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {

    menuMode = 'static';

    constructor(private primengConfig: PrimeNGConfig, private authService: AuthService) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        document.documentElement.style.fontSize = '14px';
    }

    isAutorized(): boolean {
        return this.authService.isLoggedIn;
    }
}
