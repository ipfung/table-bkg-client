import { Component } from '@angular/core';
import { AppMainComponent } from './app.main.component';
import {environment} from "../environments/environment";

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent{
    version: any;
    constructor(public appMain: AppMainComponent) {
        this.version = 'v0.5' + environment.version;
    }
}
