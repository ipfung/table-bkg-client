import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";
import {ActivatedRoute} from "@angular/router";
import {ConfirmationService, LazyLoadEvent, MessageService, SelectItem} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {AppointmentService} from "../../service/appointmentservice";

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
    showQr = false;
    // search
    roles: any[];
    selectedRole = [];
    selectedRoleId = 0;
    userName: any;
    userEmail: any;
    userMobile: any;
    userStatus: any;

    // form variables.
    formDialog = false;
    submitted = false;
    isNew = false;
    partner: any;
    rooms = [];
    trainers = [];
    services = [];
    sessions = [];
    statuses = [];
    
    ratetypes=[{id:1, label:"1v1"},{id:2, label:"2v1"}];

    formHeader = "Edit Form";
    // customer's notifications.
    notifications: any[];
    notifyRows = 0;
    notifyTotalRecords = 0;
    notifyLoading = true;
    notifyNewable: boolean;
    //
    commission_bal: boolean = true;

    // env settings
    requiredTrainer: boolean;
    requiredRoom: boolean;
    qrCode: string;

    //by Jeffrey
    trainerrates=[]; //list
    //trainerrate:[]; //single row
    tr_trainer : any;
    tr_rate_type = 0 ;
    tr_trainer_commission = 0;
    tr_company_income = 0;
    tr_trainer_charge = 0;
    IsUpdate :boolean = false;

    // end by Jeffrey
    private subscription;

    constructor(private route: ActivatedRoute, private api: ApiService, public authService: AuthService, private translateService: TranslateService, private messageService: MessageService, private confirmationService: ConfirmationService, public appointmentService: AppointmentService, public lemonade: Lemonade) {
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
            this.sessions = this.services[0].sessions;
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

        //load trainer rates
       /*  this.api.get('api/trainerrate').subscribe( res => {
            this.trainerrates = res.data;
        });
        console.log("trainerrates=",this.trainerrates); */
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
        if (this.userMobile) {
            params = {...params, ...{mobile_no: this.userMobile}};
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
            this.showQr = res.student_qr;
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
            // console.log('findRoleColor22-', roleId, data.color_name);
            return data.color_name;
        } else {
            // console.log('findRoleColor33-pink-', roleId);
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
                notifications: {}
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
        if (!this.partner.settings.notifications) {
            this.partner.settings = {...this.partner.settings, ...{
                notifications: {}
            }};
        }
        if (this.showQr) {
            this.generateQr();
        }
        this.submitted = false;
        this.formDialog = true;
        this.isNew = false;

        this.trainerrates=[]; 
        this.api.get('api/trainerrates-bystudentid/'+ user.id).subscribe( res => {
            this.trainerrates = res.data;
            
        });
        console.log("edit view trainerrates=",this.trainerrates);
    }

    generateQr() {
        this.api.get('api/student-qr/' + this.partner.id).subscribe( res => {
            // console.log('qr=', res);
            console.log('qr2=', atob(res['data']['content']));
            this.qrCode = atob(res['data']['content']);
        });
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
        if (this.partner.settings) {
            if (this.partner.settings.trainer_charge && this.partner.settings.trainer_commission && this.partner.settings.company_income) {
                if (this.partner.settings.trainer_commission + this.partner.settings.company_income != this.partner.settings.trainer_charge) {
                    this.commission_bal = false;
                    failed = true;
                }
            }
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

    updateCommission(e) {
        console.log('updateCommission e=', e);
        this.partner.settings.company_income = e.value - this.partner.settings.trainer_commission;
        if (!this.partner.settings.no_of_session) {
            this.partner.settings.no_of_session = this.sessions[0].code;
        }
    }

    updateTrainerCommission(e) {
        console.log('updateTrainerCommission e=', e);
        this.partner.settings.company_income = this.partner.settings.trainer_charge - e.value;
    }

    updateCompanyIncome(e) {
        this.partner.settings.trainer_commission = this.partner.settings.trainer_charge - e.value;
    }

    updateTrainerCharge(e) {
        this.tr_company_income = e.value - this.tr_trainer_commission;
    }

    updateTrainerCommission2(e) {        
        this.tr_company_income =  this.tr_trainer_charge - e.value;
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
                if (this.showQr) {
                    this.generateQr();
                }
            } else {
                // error.
                this.lemonade.error(this.messageService, res);
            }
        }, error => {
            this.lemonade.validateError(this.messageService, error);
        });
    }

    loadDataNotifications(event: LazyLoadEvent) {
        this.notifyLoading = true;
        let page = event && event.rows > 0 ? (event.first/event.rows) : 0;
        let params = {
            page: (1+page),
            customer_id: this.partner.id
        };
        this.api.get('api/notifications', params).subscribe( res => {
            this.notifications = res.data;
            this.notifyNewable = res.showCustomer;
            this.notifyLoading = false;
            this.notifyRows = res.per_page;
            this.notifyTotalRecords = res.total;
        });
    }

    doAddTrainerRate(){
        console.log('*doAddTrainerRate*', this.tr_trainer +" ," + this.tr_trainer_commission + " ," + this.tr_company_income  +" ," +  this.tr_trainer_charge  );
        const trainerrate = {
            trainer : this.tr_trainer ,
            rate_type : this.tr_rate_type,
            trainer_commission : this.tr_trainer_commission,
            company_income :this.tr_company_income,
            trainer_charge : this.tr_trainer_charge,
            student_id : this.partner.id
        }
        console.log("trainerrate=", trainerrate);
        let call;
        if (this.partner.id > 0) {
            //call = this.api.update('api/trainerrates/' + this.partner.id, this.partner)
            // add
            call = this.api.post('api/trainerrates', trainerrate);
        } else {
           //call = this.api.post('api/trainerrates', trainerrate);
        }

        call.subscribe( res => {
            console.log('add trainer rate res=', res);
            if (res.success === true) {
               // this.loadData(null);
               // this.hideDialog();
               // this.lemonade.ok(this.messageService);
               
            } else {
                // error.
               // this.lemonade.error(this.messageService, res);
            }
        }, error => {
            //this.lemonade.validateError(this.messageService, error);
        });
    }

    /* doEditTrainerRate(trainerrate)
    {
        trainerrate.IsUpdate = true;
    }

    doUpdateTrainerRate(trainerrate){
        trainerrate.IsUpdate = false;
    } */

    doDelTrainerRate(trainerrate)
    {
        console.log("del=", trainerrate);
        let call;
        if (trainerrate.id > 0) {
            // del
            call = this.api.delete('api/trainerrates/' +  trainerrate.id );
        }
        call.subscribe( res => {
            console.log('Del trainer rate res=', res);
            if (res.success === true) {
               // this.loadData(null);
               // this.hideDialog();
               // this.lemonade.ok(this.messageService);
               
            } else {
                // error.
               // this.lemonade.error(this.messageService, res);
            }
        }, error => {
            //this.lemonade.validateError(this.messageService, error);
        });
        
    }

    onRowEditInit(trainerrate ){
        console.log("RoweditInit");
    }

    onRowEditSave(trainerrate){
        console.log("RoweditSave");
        let call;
        if (trainerrate.id > 0) {
            // del
            call = this.api.update('api/trainerrates/'+ trainerrate.id, trainerrate );
        }
        call.subscribe( res => {
            console.log('Del trainer rate res=', res);
            if (res.success === true) {
               // this.loadData(null);
               // this.hideDialog();
               // this.lemonade.ok(this.messageService);
               
            } else {
                // error.
               // this.lemonade.error(this.messageService, res);
            }
        }, error => {
            //this.lemonade.validateError(this.messageService, error);
        });
    }

    onRowEditCancel(trainerrate, index: number){
        console.log("RoweditCancel");
    }


}
