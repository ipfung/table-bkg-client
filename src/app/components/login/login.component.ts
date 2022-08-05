import {Component, OnInit, OnDestroy} from '@angular/core';
import {ConfigService} from '../../service/app.config.service';
import {AppConfig} from '../../api/appconfig';
import {Subscription} from 'rxjs';
import {AuthService} from "../../service/auth.service";
import {ApiService} from "../../service/api.service";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .p-password input {
            width: 100%;
            padding: 1rem;
        }

        :host ::ng-deep .pi-eye {
            transform: scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }

        :host ::ng-deep .pi-eye-slash {
            transform: scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent implements OnInit, OnDestroy {

    valCheck: string[] = ['remember'];

    logo: string;

    login: string;

    password: string;

    config: AppConfig;

    subscription: Subscription;

    constructor(public configService: ConfigService, public authService: AuthService, public api: ApiService) {
    }

    ngOnInit(): void {
        this.config = this.configService.config;
        this.logo = this.api.url + 'images/' + this.config.dark ? 'logo-white' : 'logo' + '.png';
        this.login = this.authService.loginId;
        this.subscription = this.configService.configUpdate$.subscribe(config => {
            this.config = config;
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onLoginClick(args) {
        // if (!args.validationGroup.validate().isValid) {
        //     return;
        // }
        console.log('test 123');
        this.authService.logIn(this.login, this.password, false);

        // args.validationGroup.reset();
    }
}
