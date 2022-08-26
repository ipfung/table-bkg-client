import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class DashboardService {

    private notifications = new Subject<any>();

    notifications$ = this.notifications.asObservable();

    private counter;

    constructor() {}

    updateNotificationsCount(counter) {
        this.counter = counter;
        this.notifications.next(counter);
    }

    receiveNotify(message) {
        this.updateNotificationsCount(1 + this.counter);
    }

    markAsRead() {
        this.updateNotificationsCount(this.counter - 1);
    }
}
