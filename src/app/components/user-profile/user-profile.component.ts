import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";
import {ApiService} from "../../service/api.service";
import {MessageService} from "primeng/api";

@Component({
    selector: 'app-user-profile',
    providers: [MessageService],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    avatar: string;
    email: string;
    userName: string;
    obj: any;

    submitted: boolean;
    formDialog: boolean;
    formHeader: string;
    old_password: string;
    new_password: string;
    cfm_password: string;

    constructor(private api: ApiService, public authService: AuthService, private messageService: MessageService, public lemonade: Lemonade) {
    }

    async ngOnInit() {
        this.avatar = await this.authService.avatar();
        this.email = await this.authService.email();
        this.userName = await this.authService.userName();
        this.api.get('api/user').subscribe(res => {
            this.obj = res;
        });
    }

    getAvatar() {
        return this.lemonade.getAvatar({
            avatar: this.avatar
        });
    }

    hidePwdDialog() {
        this.formDialog = false;
        this.submitted = false;
    }

    changePwd() {
        this.formHeader = "Change password";
        this.submitted = false;
        this.formDialog = true;
    }

    savePwd() {
        this.submitted = true;
        this.api.update('api/user-password/' + this.obj.id, {
            old_password: this.old_password,
            password: this.new_password,
            password_confirmation: this.cfm_password
        }).subscribe( res => {
            if (res.success === true) {
                this.hidePwdDialog();
                this.lemonade.ok(this.messageService);
            } else {
                // error.
                this.lemonade.error(this.messageService, res);
            }
        });
    }
}
