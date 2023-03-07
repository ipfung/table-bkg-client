import {Component, OnInit} from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";

@Component({
    selector: 'app-room-list',
    providers: [MessageService, ConfirmationService],
    templateUrl: './room-list.component.html',
    styleUrls: ['./room-list.component.scss']
})
export class RoomListComponent implements OnInit {

    loading = true;

    rooms = [];
    editable = false;

    // form variables.
    formDialog = false;
    submitted = false;
    room: any;
    statuses = [];
    locations = [];
    formHeader = "Edit Form";

    constructor(private api: ApiService, public lemonade: Lemonade, private translateService: TranslateService, private messageService: MessageService, private confirmationService: ConfirmationService) {
    }

    ngOnInit(): void {
        this.loadData();
        this.statuses = [
            {
                name: 'active',
                code: 1001
            }, {
                name: 'suspended',
                code: 1002
            }
        ];
        // load locations.
        this.api.get('api/locations').subscribe( res => {
            this.locations = res.data;
        });
    }

    loadData() {
        this.loading = true;
        this.api.get('api/rooms').subscribe( res => {
            this.rooms = res.data;
            this.loading = false;
            this.editable = res.editable;
        });
    }

    openNew() {
        this.formHeader = "Create Form";
        this.room = {
            location_id: 0,
            status: this.statuses[0].code
        };
        this.submitted = false;
        this.formDialog = true;
    }

    edit(room) {
        this.formHeader = "Edit Form";
        this.room = {...room};
        this.formDialog = true;
    }

    canAmend(room) {
        // FIXME only manager could edit.
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
    }

    save() {
        let call;
        this.submitted = true;
        if (this.room.name == undefined)
            return;
        if (this.room.id > 0) {
            call = this.api.update('api/rooms/' + this.room.id, this.room)
        } else {
            call = this.api.post('api/rooms', this.room);
        }
        call.subscribe( res => {
            console.log('save room res=', res);
            if (res.success == true) {
                this.submitted = false;
                this.loadData();
                this.hideDialog();
                this.lemonade.ok(this.messageService);
            } else {
                // error.
                this.lemonade.error(this.messageService, res);
            }
        }, error => {
            this.lemonade.validateError(this.messageService, error);
        });
    }

    delete() {
        this.translateService.get(['Are you sure to delete?']).subscribe( msg => {
            this.confirmationService.confirm({
                message: msg['Are you sure to delete?'],
                accept: () => {
                    this.api.delete('api/rooms/' + this.room.id).subscribe(res => {
                        if (res.success == true) {
                            this.submitted = false;
                            this.loadData();
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
}
