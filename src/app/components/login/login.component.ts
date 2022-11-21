import {Component, OnInit, OnDestroy, ViewChild, ElementRef} from '@angular/core';
import {ConfigService} from '../../service/app.config.service';
import {AppConfig} from '../../api/appconfig';
import {Subscription} from 'rxjs';
import {AuthService} from "../../service/auth.service";
import {ApiService} from "../../service/api.service";
import {environment} from "../../../environments/environment";

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
    @ViewChild('username', { static: false }) username: ElementRef;

    @ViewChild('phone1', { static: false }) phone1: ElementRef;

    @ViewChild('pwd', { static: false }) pwd: ElementRef;

    @ViewChild('pwdField', { static: false }) pwdField: ElementRef;

    valCheck: string[] = ['remember'];

    logo: string;
    appNames: string[] = ['Appointment System', 'Lemonade'];

    loginMethod: string = 'email';

    login = '';

    login_mobile = '';

    password = '';

    remember = false;

    isApp = false;

    submitted = false;

    errorMessage: string;

    config: AppConfig;

    subscription: Subscription;

    constructor(public configService: ConfigService, public authService: AuthService, public api: ApiService) {
    }

    async ngOnInit() {
        this.config = this.configService.config;
        this.logo = this.api.url + 'images/' + this.config.dark ? 'logo-white' : 'logo' + '.png';
        this.loginMethod = await this.authService.method();
        if (!this.loginMethod)
            this.loginMethod = 'email';
        if (this.loginMethod == 'phone')
            this.login_mobile = await this.authService.loginId();
        else {
            this.login = await this.authService.loginId();
        }
        this.isApp = environment.isApp;
        this.api.get('api/lemonade').subscribe(res => {
            this.appNames = res.name.split('-');
        });
        this.subscription = this.authService.loginComplete$.subscribe(obj => {
            this.errorMessage = obj.message;
        });
    }

    ngAfterViewInit() {
        if (this.login) {
            setTimeout(() => {
                this.pwd.nativeElement.click();
            }, 500);
        } else {
            setTimeout(() => {
                this.username.nativeElement.click();
            }, 50);
        }
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onEnter() {
        this.onLoginClick();
    }

    onLoginClick() {
        this.submitted = true;
        if (!this.password || this.password.trim() == '') {
            this.pwd.nativeElement.click();
            this.pwdField.nativeElement.focus();
            return;
        }

        if (this.loginMethod == 'phone') {
            if (!this.login_mobile || this.login_mobile.trim() == '') {
                this.phone1.nativeElement.click();
                return;
            }
            this.authService.mobileLogin(this.login_mobile, this.password, this.isApp ? true : this.remember);
        } else {
            if (!this.login || this.login.trim() == '') {
                this.username.nativeElement.click();
                return;
            }
            this.authService.emailLogin(this.login, this.password, this.isApp ? true : this.remember);
        }
    }
}
