import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";
import {ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
    loginId: string;

    loading = true;

    paramRole: any;
    users = [];
    newable = false;
    editable = false;
    // search
    roles: any[];
    selectedRole = [];
    selectedRoleId = 0;
    userName: any;
    userEmail: any;
    userStatus: any;

    // form variables.
    formDialog = false;
    submitted = false;
    isNew = false;
    partner: any;
    trainers = [];
    services = [];
    statuses = [];
    formHeader = "Edit Form";

    private subscription;

    constructor(private route: ActivatedRoute, private api: ApiService, public authService: AuthService, public lemonade: Lemonade) {
    }

    async ngOnInit() {
        this.loginId = await this.authService.loginId();
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

        this.api.get('api/services', {
            status: 1001
        }).subscribe( res => {
            this.services = res.data;
        });

        this.api.get('api/trainers', {
            status: 'active',
            role: 'Trainer'
        }).subscribe( res => {
            this.trainers = res.data;
        });

        this.subscription = this.route.params.subscribe(params => {
            this.paramRole = params['role'] || '';
        });
        // load roles.
        this.api.get('api/roles').subscribe( res => {
            this.roles = res.data;
        });
        this.loadData();
    }

    ngOnDestroy() {
console.log('ngOnDestroy=', this.subscription);
        this.subscription.unsubscribe();
    }

    loadRole(id) {
        console.log('hi selectedRole=', id);
        this.selectedRoleId = id;
        this.loadData();
    }

    loadData() {
        let params = {
            role: this.paramRole,
        };
        if (this.userName) {
            params = {...params, ...{name: this.userName}};
        }
        if (this.userEmail) {
            params = {...params, ...{email: this.userEmail}};
        }
        if (this.userStatus) {
            params = {...params, ...{status: this.userStatus}};
        }
        console.log('hiuser selectedRole=', this.selectedRole);
        if (this.selectedRole && this.selectedRole.length > 0) {
            const roles = this.selectedRole.map(a => a.id);
            params = {...params, ...{role_ids: roles}};
        } else {
            params = {...params, ...{role_id: this.selectedRoleId}};
        }
        this.api.get('api/users', params).subscribe( res => {
            this.users = res.data;
            this.editable = res.editable;
            this.newable = (this.paramRole == 'User');
            this.loading = false;
        });
    }

    findRoleColor(roleId) {
        if (this.roles && this.roles.length > 0 && roleId > 0) {
            let data = this.roles.find(el => el.id == roleId);
            return data.color_name;
        }
        return 'grey';
    }

    roleRenderer(roleId) {
        if (this.roles && this.roles.length > 0 && roleId > 0) {
            let data = this.roles.find(el => el.id == roleId);
            return data.name;
        }
        return '';
    }

    showService(partner): boolean {
        const roleName = this.roleRenderer(partner.role_id)
        return (roleName == 'user' || roleName == 'member');
    }

    /**
     * check user level and never let user ban himself/herself.
     * @param user
     */
    canBlock(user): boolean {
        // FIXME further check user leve.
        return user.email !== this.loginId;
    }

    blacklist(user, isBlack) {
        this.api.update('api/' + (isBlack ? 'ban' : 'active') + '-user/' + user.id, {}).subscribe( res => {
            if (res.success == true) {
                user.status = res.status;
            }
        });
    }

    openNew() {
        this.formHeader = "Create Form";
        this.partner = {
            status: this.statuses[0].code,
            settings: {
            }
        };
        this.submitted = false;
        this.formDialog = true;
        this.isNew = true;
    }

    edit(user) {
        this.formHeader = "Edit Form";
        this.partner = {...user};
        this.submitted = false;
        this.formDialog = true;
        this.isNew = false;
    }

    canAmend(user) {
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
        this.submitted = false;
    }

    save() {
        this.submitted = true;
        let call;
        if (this.partner.id > 0) {
            call = this.api.update('api/users/' + this.partner.id, this.partner)
        } else {
            call = this.api.post('api/users', this.partner);
        }
        call.subscribe( res => {
            console.log('save users res=', res);
            if (res.success === true) {
                this.loadData();
                this.hideDialog();
            } else {
                // error.
            }
        });
    }
}
