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
    editable = false;

    // form variables.
    formDialog = false;
    submitted = false;
    isNew = false;
    partner: any;
    statuses = [];
    roles = [];
    formHeader = "Edit User";

    constructor(private api: ApiService, public authService: AuthService, public lemonade: Lemonade) {
    }

    ngOnInit(): void {
        this.statuses = [
            {
                name: 'active',
                code: 'active'
            }, {
                name: 'suspended',
                code: 'suspended'
            }, {
                name: 'banned',
                code: 'banned'
            }
        ];
        // load locations.
        this.api.get('api/roles').subscribe( res => {
            this.roles = res.data;
        });
        this.loadData();
    }

    loadData() {
        this.api.get('api/users').subscribe( res => {
            this.users = res.data;
            this.editable = res.editable;
            this.loading = false;
        });
    }

    roleRenderer(roleId) {
        if (this.roles && this.roles.length > 0 && roleId > 0) {
            let data = this.roles.find(el => el.id == roleId);
            return data.name;
        }
        return '';
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

    openNew() {
        this.formHeader = "Create Partner";
        this.partner = {
            status: this.statuses[0].code
        };
        this.submitted = false;
        this.formDialog = true;
        this.isNew = true;
    }

    edit(user) {
        this.formHeader = "Edit Partner";
        this.partner = {...user};
        this.formDialog = true;
        this.isNew = false;
    }

    canAmend(user) {
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        let call;
        if (this.partner.id > 0) {
            call = this.api.update('api/users/' + this.partner.id, this.partner)
        } else {
            call = this.api.post('api/users', this.partner);
        }
        call.subscribe( res => {
            console.log('save users res=', res);
            if (res.success == true) {
                this.loadData();
                this.hideDialog();
            }
        });
    }
}
