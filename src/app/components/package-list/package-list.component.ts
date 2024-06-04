import { Component, OnInit } from '@angular/core';
import {ApiService} from "../../service/api.service";
import {Lemonade} from "../../service/lemonade.service";
import {AppointmentService} from "../../service/appointmentservice";
import {ConfirmationService, LazyLoadEvent, MenuItem, MessageService} from "primeng/api";
import {TranslateService} from "@ngx-translate/core";
import {ActivatedRoute} from "@angular/router";
import  { MultiSelectModule } from 'primeng/multiselect';

@Component({
    selector: 'app-package-list',
    providers: [MessageService, ConfirmationService],
    templateUrl: './package-list.component.html',
    styleUrls: ['./package-list.component.scss']
})
export class PackageListComponent implements OnInit {

    loading = true;
    //paginator
    rows = 0;
    totalRecords = 0;

    // search fields
    rangeDates: Date[];
    nameSrhObj: any;
    trainerObj = null;
    roomObj = null;
    pkgStatus: any = '';
    idSrh: number = 0;
    openForm: boolean;
    disableLoadMore: boolean;

    newActions: MenuItem[];

    packages = [];
    editable = false;

    // form variables.
    formDialog = false;
    formGroupEventDialog = false;
    submitted = false;
    pkg: any;
    recurring_types = [];
    lessons: any[] = [];
    holidays: any[];
    sessions = [];
    services = [];
    rooms = [];
    trainers = [];
    day_of_weeks = [];
    times: any[] = [];
    statuses = [];
    locations = [];
    formHeader = "Edit Form";
    sessionInterval: any;
    lesson: any;
    lessonDateDialog: boolean;
    lessonDateFormHeader: string;
    lessonDateSubmitted: boolean;

    selectedRoom_id : [];
    selectedTrainer_id : [];

    constructor(private api: ApiService, public appointmentService: AppointmentService, public lemonade: Lemonade, private translateService: TranslateService, private messageService: MessageService, private confirmationService: ConfirmationService, private route: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.statuses = [
            {
                name: 'active',
                code: '1001'
            }, {
                name: 'suspended',
                code: '1002'
            }
        ];
        this.day_of_weeks = this.lemonade.weeks;
        this.translateService.get(['Packages','Monthly Packages', 'Group Event']).subscribe( msg => {
            this.newActions = [{
                label: msg['Packages'],
                icon: 'pi pi-plus',
                command: () => {
                    this.openNew();
                }
                // }, {
                //     separator: true
            },{
                label: msg['Monthly Packages'],
                icon: 'pi pi-plus',
                command: () => {
                    this.openNew();
                }
                // }, {
                //     separator: true
            }, {
                label: msg['Group Event'],
                icon: 'pi pi-plus',
                command: () => {
                    this.openNewGroupEvent();
                }
                // label: 'Tokens', icon: 'pi pi-cog', routerLink: ['/setup']
            }];
        });
        this.recurring_types = [
            {
                description: 'Renew every month',
                name: 'Package per month',
                code: 'monthly'
            }, {
                description: 'Renew every month',
                name: 'Package per week',
                code: 'weekly'
            }
        ];

        // support paymentStatus params.
        if (this.route.snapshot.paramMap.get('id')) {
            this.idSrh = parseInt(this.route.snapshot.paramMap.get('id'));
        }
        if (this.route.snapshot.paramMap.get('openForm')) {
            this.openForm = this.route.snapshot.paramMap.get('openForm') == 'yes';
        }

        // load data for form.
        this.api.get('api/services', {
            status: 1001
        }).subscribe( res => {
            this.services = res.data;
            this.sessions = this.services[0].sessions;
        });

        this.api.get('api/rooms', {
            status: 1001
        }).subscribe( res => {
            this.rooms = res.data;
        });

        this.api.get('api/trainers', {
            status: 'active',
            role: 'Trainer'
        }).subscribe( res => {
            this.trainers = res.data;
        });

    }

    loadData(event?: LazyLoadEvent) {
        this.loading = true;
        let page = event ? (event.first/event.rows) : 0;
        let params = {
            page: (1 + page),
        };
        if (this.idSrh > 0) {
            params = {...params, ...{id: this.idSrh}};
        }
        if (this.nameSrhObj) {
            params = {...params, ...{name: this.nameSrhObj}};
        }
        if (this.trainerObj > 0) {
            params = {...params, ...{trainerId: this.trainerObj}};
        }
        if (this.roomObj > 0) {
            params = {...params, ...{roomId: this.roomObj}};
        }
        if (this.pkgStatus) {
            params = {...params, ...{status: this.pkgStatus}};
        }
        this.api.get('api/packages', params).subscribe( res => {
            this.packages = res.data;
            this.loading = false;
            this.editable = res.editable;
            this.rows = res.per_page;
            this.totalRecords = res.total;
            if (this.openForm && this.idSrh > 0) {
                setTimeout(() => {
                    this.edit(this.packages[0]);
                    this.openForm = false;   // reset the state.
                });
            }
        });
        // this.api.get('api/renew-orders').subscribe( res => {
        //    console.log('orders=', res);
        // });
    }

    loadTime() {
        if (this.pkg.service_id > 0 && this.pkg.no_of_session > 0 && this.pkg.start_date) {
            this.appointmentService.getPackageTimeslot(this.pkg.service_id, this.pkg.no_of_session, this.pkg.start_date).subscribe(res => {
                this.times = res.data;
                this.sessionInterval = res.sessionInterval;
            });
        }
    }

    openNew() {
        this.formHeader = "Create Form";
        this.pkg = {
            quantity: 4,
            free_of_charge: false,
            status: this.statuses[0].code,
            total_space: 1,
            recurring: {
                cycle: 'weekly',
                repeat: [],
                free: {}
            }
        };
        if (this.services.length > 0) {
            this.pkg.service_id = this.services[0].id;
            this.pkg.noOfSession = this.services[0].sessions[0].code;
        }
        this.submitted = false;
        this.formDialog = true;
    }

    openNewGroupEvent() {
        this.formHeader = "Create Form";
        this.pkg = {
            quantity: 4,
            free_of_charge: false,
            status: this.statuses[0].code,
            total_space: 10,
            recurring: {
                cycle: 'group_event',
                repeat: []
            }
        };
        if (this.services.length > 0) {
            this.pkg.service_id = this.services[0].id;
            this.pkg.noOfSession = this.services[0].sessions[0].code;
        }
        this.submitted = false;
        this.formGroupEventDialog = true;
    }

    /**
     * generate more lesson dates in background where will save into DB as well.
     * append to lesson dates and reload package list data.
     */
    generateLessonDates() {
        this.appointmentService.generateLessonDates(this.pkg.id).subscribe(res => {
            if (res.success === false) {
                this.lemonade.error(this.messageService, res);
                this.disableLoadMore = true;
                return;
            }
            if (res.data.length > 0) {
                this.lessons = [...this.lessons, ...res.data];
                this.loadData(null);
                this.lemonade.ok(this.messageService);
                if (res.data.length < this.pkg.quantity) {
                    this.disableLoadMore = true;
                }
            }
            if (res.holidays.length > 0)
                this.holidays = [ ...this.holidays, ...res.holidays];
        });
    }

    loadLessonDates() {
        this.appointmentService.getPackageDates({
            start_date: this.lemonade.formatPostDate(this.pkg.start_date),
            dow: this.pkg.recurring.repeat,
            quantity: this.pkg.quantity
        }).subscribe(res => {
            if (res.data.length > 0)
                this.lessons = res.data;
            if (res.holidays.length > 0)
                this.holidays = res.holidays;
        });
    }

    deactivateLessonDate() {
        console.log('delete lesson date.');
        this.translateService.get(['Are you sure to delete the lesson date?']).subscribe( msg => {
            this.confirmationService.confirm({
                message: msg['Are you sure to delete the lesson date?'],
                accept: () => {
                    this.api.delete('api/package-lesson-date/' + this.pkg.id, {
                        params: {
                            old_date: this.lemonade.formatPostDate(this.lesson.date)
                        }
                    }).subscribe(res => {
                        if (res.success == true) {
                            this.lessonDateSubmitted = false;
                            // this.lessons.splice(this.lesson.idx, 1);
                            this.lessons[this.lesson.idx].action = 'delete';
                            this.hideLessonDateDialog();
                            this.lemonade.ok(this.messageService, 'The lesson date is deleted successfully.');
                        } else {
                            this.lemonade.error(this.messageService, res);
                        }
                    });
                }
            });
        });
    }

    activateLessonDate(lesson, idx) {
        delete lesson.action;
    }

    addCustomDate() {
        this.lessonDateFormHeader = "Create Form";
        this.lesson = {
            package_id: this.pkg.id,
            idx: -1
        };
        this.lessonDateSubmitted = false;
        this.lessonDateDialog = true;
    }

    isEditingLessonDate(lesson) {
        return this.lesson && this.lemonade.formatPostDate(this.lesson.date) == lesson.date;
    }

    editLessonDate(lesson, idx) {
        this.lessonDateFormHeader = "Edit Form";
        this.lesson = {...lesson};
        this.lesson.package_id = this.pkg.id;
        this.lesson.idx = idx;
        this.lesson.date = new Date(lesson.date);
        this.lessonDateSubmitted = false;
        this.lessonDateDialog = true;
    }

    hideLessonDateDialog() {
        this.lessonDateDialog = false;
    }

    saveLessonDate() {
        this.lessonDateSubmitted = true;
        if (!this.lesson.new_date) {
            return;
        }
        if (!this.sessionInterval) {
            this.loadTime();
        }
        //TODO save to server and update into table.
        if (this.lesson.date) {   // update
            this.api.update('api/package-lesson-date/' + this.pkg.id, {
                sessionInterval: this.sessionInterval,
                new_date: this.lemonade.formatPostDate(new Date(this.lesson.new_date)),
                old_date: this.lemonade.formatPostDate(this.lesson.date)
            }).subscribe(res => {
                console.log('package update res=',res);
                if (res.success) {
                    this.lemonade.ok(this.messageService, {
                        message: 'Date has been updated successfully'
                    });
                    this.lessons[this.lesson.idx].date = this.lesson.new_date;
                    this.lesson.date = false;
                    this.hideLessonDateDialog();
                } else {
                    // error.
                    this.lemonade.error(this.messageService, res);
                }
            });
        } else {   // create
            const d = this.lemonade.formatPostDate(new Date(this.lesson.new_date));
            console.log('this.lesson.new_date-', this.lesson.new_date);
            this.api.post('api/package-lesson-date/' + this.pkg.id, {
                sessionInterval: this.sessionInterval,
                new_date: d
            }).subscribe(res => {
                console.log('package res=',res);
                if (res.success) {
                    this.lemonade.ok(this.messageService, {
                        message: 'Date has been stored successfully'
                    });
                    this.lessons.push({
                        date: d
                    });
                    this.hideLessonDateDialog();
                } else {
                    // error.
                    this.lemonade.error(this.messageService, res);
                }
            });
        }
    }

    edit(pkg) {
        this.formHeader = "Edit Form";
        // fix pkg.recurring.repeat if it's crashed.
        const recurring = JSON.parse(pkg.recurring);
        if (recurring.cycle == 'weekly') {
            // only allow 1-7(monday to sunday)
            const filteredArray = recurring.repeat.filter(e => ([1,2,3,4,5,6,7].includes(e)));
            recurring.repeat = filteredArray;
        }
        if (!recurring.free) {
            recurring.free = {};
        }

        this.pkg = {...pkg, ...{
                recurring: recurring,
                start_date: pkg.start_date ? new Date(pkg.start_date) : undefined,
                end_date: pkg.end_date ? new Date(pkg.end_date) : undefined,
                free_of_charge: !pkg.price
            }
        };
        this.loadTime();
        // load old lesson dates from appointments.
        this.lessons = [];
        for (const obj in pkg.appointments) {
            const apt = pkg.appointments[obj];
            this.lessons.push({
                date: apt.start_time.substr(0, 10),
                total_booked: apt.customer_bookings ? apt.customer_bookings.length : 0
            });
        }
        if (recurring.cycle == 'group_event')
            this.formGroupEventDialog = true;
        else this.formDialog = true;
    }

    freeOfCharge(evt) {
        if (evt.checked) {
            // free
            this.pkg.old_price = this.pkg.price;
            this.pkg.price = 0;
        } else {
            if (this.pkg.old_price)
                this.pkg.price = this.pkg.old_price;
        }
    }

    canAmend(pkg) {
        // FIXME only manager could edit.
        return this.editable;
    }

    hideDialog() {
        this.formDialog = false;
        this.formGroupEventDialog = false;
    }

    save() {
        let call;
        this.submitted = true;
        if (this.pkg.name == undefined)
            return;
        if (this.pkg.description == undefined)
            return;
        if (!this.pkg.service_id)
            return;
        if (this.pkg.quantity == undefined)
            return;
        if (!this.pkg.free_of_charge && (!this.pkg.price || this.pkg.price <= 0))
            return;
        if (this.isWeekly(this.pkg)) {
           /*  if (!this.pkg.room_id || !this.pkg.trainer_id)
                return; */
            if (!this.pkg.start_date || !this.pkg.start_time)
                return;
            if (this.pkg.recurring.repeat == undefined || this.pkg.recurring.repeat.length == 0)
                return;
        }

        const lessonDates = this.lessons.map(function (obj) {
            return obj.date;
        });
        const recurring = {...{quantity: this.pkg.quantity, repeat: this.pkg.recurring.repeat.sort()}, ...this.pkg.recurring};
        let data = {...this.pkg, ...{
                recurring: recurring,
                start_date: this.lemonade.formatPostDate(this.pkg.start_date),
                sessionInterval: this.sessionInterval,
                lesson_dates: lessonDates,
            }
        };
        if (this.pkg.end_date) {
            data = {...data, ...{
                    end_date: this.lemonade.formatPostDate(this.pkg.end_date)
                }
            }
        }
        if (this.pkg.id > 0) {
            call = this.api.update('api/packages/' + this.pkg.id, data)
        } else {
            call = this.api.post('api/packages', data);
        }
        call.subscribe( res => {
            console.log('save package res=', res);
            if (res.success == true) {
                this.submitted = false;
                this.loadData(null);
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
        console.log('delete packages.');
        this.translateService.get(['Are you sure to delete?']).subscribe( msg => {
            this.confirmationService.confirm({
                message: msg['Are you sure to delete?'],
                accept: () => {
                    this.api.delete('api/packages/' + this.pkg.id).subscribe(res => {
                        if (res.success == true) {
                            this.submitted = false;
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

    isWeekly(pkg: any) {
        return (pkg.recurring.cycle === 'weekly');
    }
}
