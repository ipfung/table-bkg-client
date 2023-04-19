import { Component } from '@angular/core';
import {AppConfig} from "../../api/appconfig";
import {ConfigService} from "../../service/app.config.service";

@Component({
  selector: 'app-access',
  templateUrl: './access.component.html',
})
export class AccessComponent {
    config: AppConfig;

    constructor(public configService: ConfigService) {
    }

    ngOnInit() {
        this.config = this.configService.config;
    }
}
