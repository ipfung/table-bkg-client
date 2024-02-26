import { Component } from '@angular/core';
import {environment} from "../environments/environment";
import {ConfigService} from "./service/app.config.service";
import {AppConfig} from "./api/appconfig";

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent{
    version: any;
    config: AppConfig;

    constructor(public configService: ConfigService) {
        this.config = this.configService.config;
        this.version = 'v0.196' + environment.version;
    }
}
