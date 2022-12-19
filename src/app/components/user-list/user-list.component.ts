import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";
import {ActivatedRoute} from "@angular/router";
import {ConfirmationService, LazyLoadEvent, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-user-list',
    providers: [MessageService, ConfirmationService],
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
    loginId: string;

    loading = true;
    //paginator
    rows = 0;
    totalRecords = 0;

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
    rooms = [];
    trainers = [];
    services = [];
    statuses = [];
    formHeader = "Edit Form";
    // env settings
    requiredTrainer: boolean;
    requiredRoom: boolean;

    private subscription;

    constructor(private route: ActivatedRoute, private api: ApiService, public authService: AuthService, private translateService: TranslateService, private messageService: MessageService, private confirmationService: ConfirmationService, public lemonade: Lemonade) {
        this.route.params.subscribe(params => {
            this.paramRole = params['role'] || 'Student';
        });
    }

    async ngOnInit() {
        this.loginId = await this.authService.loginId();
        this.statuses = this.lemonade.userStatus;

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

        this.api.get('api/rooms', {
            status: 1001
        }).subscribe( res => {
            this.rooms = res.data;
        });

        // load student roles only.
        this.api.get('api/get-roles').subscribe( res => {
            this.roles = res.data;
        });
    }

    ngOnDestroy() {
        if (this.subscription)
            this.subscription.unsubscribe();
    }

    loadRole(id) {
        console.log('hi selectedRole=', id);
        this.selectedRoleId = id;
        this.loadData(null);
    }

    loadData(event: LazyLoadEvent) {
        this.loading = true;
        let page = event && event.rows > 0 ? (event.first/event.rows) : 0;
        let params = {
            page: (1+page),
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
            this.newable = res.newable;
            this.requiredTrainer = res.requiredTrainer;
            this.requiredRoom = res.requiredRoom;
            this.loading = false;
            this.rows = res.per_page;
            this.totalRecords = res.total;
        });
    }

    findRoleColor(roleId) {
        if (this.roles && this.roles.length > 0 && roleId > 0) {
            let data = this.roles.find(el => el.id == roleId);
            console.log('findRoleColor22-', roleId, data.color_name);
            return data.color_name;
        } else {
            console.log('findRoleColor33-pink-', roleId);
            return 'bg-purple-500';
        }
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
        if (Array.isArray(user.settings)) {   // this fixes if settings = [] in DB.
            if (user.settings.length == 0)
                this.partner.settings = {};
        }
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

    isFormValid() {
        let failed = (!this.partner.name || !this.partner.email || !this.partner.mobile_no || !this.partner.second_name);
        if (this.requiredRoom && !this.partner.settings.room) {
            failed = true;
        }
        if (this.requiredTrainer && !this.partner.settings.trainer) {
            failed = true;
        }
        if (this.isNew && !failed) {
            failed = (!this.partner.password);
        }
        return !failed;
    }

    delete() {
        this.translateService.get(['Are you sure to delete?']).subscribe( msg => {
            this.confirmationService.confirm({
                message: msg['Are you sure to delete?'],
                accept: () => {
                    this.api.delete('api/users/' + this.partner.id).subscribe(res => {
                        if (res.success == true) {
                            this.loadData(null);
                            this.hideDialog();
                            this.lemonade.ok(this.messageService, 'The record is deleted successfully.');
                        } else {
                            this.lemonade.error(this.messageService, res);
                        }
                    });
                }
            });
        });
    }

    save() {
        this.submitted = true;
        if (!this.isFormValid()) return;
        let call;
        if (this.partner.id > 0) {
            call = this.api.update('api/users/' + this.partner.id, this.partner)
        } else {
            call = this.api.post('api/users', this.partner);
        }
        call.subscribe( res => {
            console.log('save users res=', res);
            if (res.success === true) {
                this.loadData(null);
                this.hideDialog();
                this.lemonade.ok(this.messageService);
            } else {
                // error.
                this.lemonade.error(this.messageService, res);
            }
        });
    }
}
