import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {environment} from "../../../environments/environment";
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

    loading = true;

    users = [];

    constructor(private api: ApiService, public authService: AuthService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.api.get('api/users').subscribe( res => {
            this.users = res.data;
            this.loading = false;
        });
    }

    /**
     * check user level and never let user ban himself/herself.
     * @param user
     */
    canBlock(user) {
        // FIXME further check user leve.
        return user.email !== this.authService.loginId;
    }

    blacklist(user, isBlack) {
        this.api.update('api/' + (isBlack ? 'ban' : 'active') + '-user/' + user.id, {}).subscribe( res => {
            if (res.success == true) {
                user.status = res.status;
            }
        });
    }
}
