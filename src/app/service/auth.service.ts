import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {ApiService} from './api.service';
import {PushService} from "./push.service";
import { get, set, remove } from './storage.service';
import {Subject} from "rxjs";

@Injectable()
export class AuthService {
    private loggedIn = false;
    static readonly TOKEN = 'lemonade-token';
    static readonly LOGIN_METHOD = 'lemonade-method';
    static readonly USER_NAME = 'lemonade-username';
    static readonly LOGIN_ID = 'lemonade-login';
    static readonly EMAIL = 'lemonade-email';
    static readonly AVATAR = 'lemonade-avatar';
    static readonly PID = 'lemonade-pid';   //push notification

    private loginComplete = new Subject<any>();
    private logoutComplete = new Subject<any>();

    loginComplete$ = this.loginComplete.asObservable();
    logoutComplete$ = this.logoutComplete.asObservable();

    constructor(private router: Router, private api: ApiService, private push: PushService) {
        if (this.token) {
            this.loggedIn = true;
        }
    }

    async method() {
        return get(AuthService.LOGIN_METHOD);
    }

    async userName() {
        return get(AuthService.USER_NAME);
    }

    async email() {
        return get(AuthService.EMAIL);
    }

    async loginId() {
        return get(AuthService.LOGIN_ID);
    }

    async avatar() {
        return get(AuthService.AVATAR);
    }

    mobileLogin(login: string, passord: string, remem: boolean): void {
        console.log('mobileLogin name-', login, passord);
        this.logIn({
            loginMethod: 'phone',
            mobile_no: login,
            password: passord,
            remember: remem
        });
    }

    emailLogin(login: string, passord: string, remem: boolean): void {
        console.log('emailLogin name-', login, passord);
        this.logIn({
            loginMethod: 'email',
            email: login,
            password: passord,
            remember: remem
        });
    }

    private logIn(obj): void {
        this.api.get('sanctum/csrf-cookie').subscribe(resp => {
            this.api.post('api/login', obj).subscribe(res => {
                console.log('login res-', res);
                this.loggedIn = true;
                this.setData({...res, ...{method: obj.loginMethod, login: obj.loginMethod == 'phone' ? obj.mobile_no : obj.email, remember: obj.remember}});
                if (obj.remember) {
                    localStorage.setItem(AuthService.TOKEN, res.token);
                } else {
                    // use session storage which will be destroyed once logout/browser close.
                    sessionStorage.setItem(AuthService.TOKEN, res.token);
                }
                const pid = localStorage.getItem(AuthService.PID);
// console.log('pid===', pid);
                if (pid == undefined || pid == null) {   // register once, otherwise it will call multiple times(depends on number of login.)
                    this.push.init();
                }
                this.router.navigate(['/']);
            }, error => {
                let msg = '';
                console.log('login error-', error);
                if (error.status == 401) {
                    msg = error.error.message;
                }
                this.loginComplete.next({
                    message: msg
                })
            });
        });
    }

    async setData(res) {
        set(AuthService.LOGIN_METHOD, res.method);
        set(AuthService.USER_NAME, res.name);
        set(AuthService.LOGIN_ID, res.login);
        set(AuthService.EMAIL, res.email);
        set(AuthService.AVATAR, res.avatar);
    }

    async logOut() {
        this.loggedIn = false;
        sessionStorage.removeItem(AuthService.TOKEN);
        localStorage.removeItem(AuthService.TOKEN);
        remove(AuthService.USER_NAME);
        remove(AuthService.AVATAR);
        this.push.logout();
        this.logoutComplete.next({
            message: 'logout'
        })
        this.router.navigate(['/login']);
    }

    get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    get token(): string {
        return localStorage.getItem(AuthService.TOKEN) || sessionStorage.getItem(AuthService.TOKEN);
    }
}


@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(private router: Router, private authService: AuthService) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const isLoggedIn = this.authService.isLoggedIn;
        const isLoginForm = route.routeConfig.path === 'login';

        if (isLoggedIn && isLoginForm) {
            this.router.navigate(['/']);
            return false;
        }

        if (!isLoggedIn && !isLoginForm) {
            this.router.navigate(['/login']);
        }

        return isLoggedIn || isLoginForm;
    }
}
