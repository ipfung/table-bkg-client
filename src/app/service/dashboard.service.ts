import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DashboardService {

    private notifications = new Subject<any>();

    notifications$ = this.notifications.asObservable();

    constructor() {}

    updateNotificationsCount(counter) {
        this.notifications.next(counter);
    }
}
