import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {environment} from "../../../environments/environment";

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {

    loading = false;

    users = [];

    constructor(private api: ApiService) {
    }

    ngOnInit(): void {
        this.api.get('api/users').subscribe( res => {
            this.users = res.data;
        });
    }

    getInitial(obj) {
        // or ref: https://via.placeholder.com/300.png/09f/fff
        // return obj.name
        //     .toUpperCase()
        //     .split(' ')
        //     .map(word => word[0])
        //     .join('');
        return environment.url + 'storage/' + obj.avatar;
    }

    canBlock() {
        return true;
    }

    blacklist(user) {
        this.api.update('api/ban-user/' + user.id, {}).subscribe( res => {
            if (res.success == true) {
                user.status = res.status;
            }
        });
    }

    whitelist(user) {
        this.api.update('api/active-user/' + user.id, {}).subscribe( res => {
            if (res.success == true) {
                user.status = res.status;
            }
        });
    }
}
