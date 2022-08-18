import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";

@Component({
    selector: 'app-user-profile',
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

    constructor(public authService: AuthService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
    }

    getAvatar() {
        return this.lemonade.getAvatar({
            avatar: localStorage.getItem(AuthService.AVATAR)
        });
    }
}
