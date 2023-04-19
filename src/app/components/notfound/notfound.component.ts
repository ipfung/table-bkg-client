import { Component } from '@angular/core';
import {ConfigService} from "../../service/app.config.service";
import {AppConfig} from "../../api/appconfig";

@Component({
  selector: 'app-notfound',
  templateUrl: './notfound.component.html',
})
export class NotfoundComponent {
    config: AppConfig;

    constructor(public configService: ConfigService) {
    }

    ngOnInit() {
        this.config = this.configService.config;
    }
}
