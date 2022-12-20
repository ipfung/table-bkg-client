import {Component, OnInit} from '@angular/core';
import {AuthService} from "../../service/auth.service";
import {Lemonade} from "../../service/lemonade.service";
import {ApiService} from "../../service/api.service";
import {MessageService} from "primeng/api";
import * as FileSaver from 'file-saver';
import {environment} from "../../../environments/environment";

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

    //ref: https://www.pinterest.co.uk/pin/201184308333695574/
    constructor(private api: ApiService, public authService: AuthService, private messageService: MessageService, public lemonade: Lemonade) {
    }

    async ngOnInit() {
        this.obj = {
            role_color_name: ''
        };
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

    exportData(module, list) {
        if (module == 'appointment') {
            return list.map(row => ({
                customer_name: row.customer_name,
                price: row.price,
                start_time: row.start_time,
                end_time: row.end_time,
                room: row.name,
                check_in: row.checkin,
                check_out: row.checkout,
                trainer_name: row.trainer_id != row.customer_id ? row.user_name : '',
                package_name: row.package_name,
                appointment_status: row.status,
                payment_status: row.payment_status,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
        } else if (module == 'student') {
            return list.map(row => ({
                name: row.name,
                chinese_name: row.second_name,
                email: row.email,
                mobile: row.mobile_no,
                status: row.status,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
        }
    }

    exportExcel(module) {
        import('xlsx').then((xlsx) => {
            let api = '', params = {};
            if (module == 'appointment') {
                api = 'booking';
                params = {
                    from_date: '2022-01-01',
                    to_date: '2099-12-31'
                };
            } else if (module == 'student') {
                api = 'users';
                params = {
                    role: 'Student',
                };
            }
            this.api.get('api/' + api, params).subscribe(res => {
                const data = this.exportData(module, res.data);
                const worksheet = xlsx.utils.json_to_sheet(data);
                const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };  // change 'data' to 'Appointments' will fail to export
                const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
                this.saveAsExcelFile(excelBuffer, environment.name + '_' + module);
            });
        });
    }

    saveAsExcelFile(buffer: any, fileName: string): void {
        let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        let EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], {
            type: EXCEL_TYPE
        });
        FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
    }
}
