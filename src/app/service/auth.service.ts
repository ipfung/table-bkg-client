import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {ApiService} from './api.service';
import {PushService} from "./push.service";

@Injectable()
export class AuthService {
    private loggedIn = false;
    static readonly TOKEN = 'lemonade-token';
    static readonly USER_NAME = 'lemonade-username';
    static readonly LOGIN_ID = 'lemonade-login';
    static readonly EMAIL = 'lemonade-email';
    static readonly AVATAR = 'lemonade-avatar';
    static readonly PID = 'lemonade-pid';

    private myRole: string;

    constructor(private router: Router, private api: ApiService, private push: PushService) {
        if (this.token) {
            this.loggedIn = true;
        }
    }

    logIn(login: string, passord: string, remem: boolean): void {
        console.log('login name-', login, passord);
        this.api.get('sanctum/csrf-cookie').subscribe(resp => {
            this.api.post('api/login', {
                email: login,
                password: passord,
                remember: remem
            }).subscribe(res => {
                console.log('login res-', res);
                this.loggedIn = true;
                localStorage.setItem(AuthService.USER_NAME, res.name);
                localStorage.setItem(AuthService.EMAIL, login);
                localStorage.setItem(AuthService.AVATAR, res.avatar);
                localStorage.setItem(AuthService.LOGIN_ID, login);   // should move inside remem.
                if (remem) {
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
            });
        });
    }

    logOut(): void {
        this.loggedIn = false;
        this.myRole = undefined;
        sessionStorage.removeItem(AuthService.TOKEN);
        localStorage.removeItem(AuthService.TOKEN);
        localStorage.removeItem(AuthService.USER_NAME);
        localStorage.removeItem(AuthService.AVATAR);
        this.push.logout();
        this.router.navigate(['/login']);
    }

    get isLoggedIn(): boolean {
        return this.loggedIn;
    }

    get userName(): string {
        return localStorage.getItem(AuthService.USER_NAME);
    }

    get email(): string {
        return localStorage.getItem(AuthService.EMAIL);
    }

    get loginId(): string {
        return localStorage.getItem(AuthService.LOGIN_ID);
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
