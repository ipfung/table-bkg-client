import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    avatar: string;
    email: string;
    userName: string;

    constructor(public authService: AuthService, public lemonade: Lemonade) {
    }

    async ngOnInit() {
        this.avatar = await this.authService.avatar();
        this.email = await this.authService.email();
        this.userName = await this.authService.userName();
    }

    getAvatar() {
        return this.lemonade.getAvatar({
            avatar: this.avatar
        });
    }
}
