import { Injectable } from '@angular/core';
import {Capacitor} from "@capacitor/core";
import {ActionPerformed, PushNotifications, PushNotificationSchema, Token} from "@capacitor/push-notifications";
import { Device } from '@capacitor/device';

import {ApiService} from "./api.service";
import {Router} from "@angular/router";
import {AuthService} from "./auth.service";
import {DashboardService} from "./dashboard.service";

@Injectable()
export class PushService {
    private isPushNotificationsAvailable = Capacitor.isPluginAvailable('PushNotifications');

    constructor(private api: ApiService, private dashboardService: DashboardService, private router: Router) {
    }

    init() {
        console.log('Initializing HomePage=', this.isPushNotificationsAvailable);

        if (this.isPushNotificationsAvailable) {
            // Request permission to use push notifications
            // iOS will prompt user and return if they granted permission or not
            // Android will just grant without prompting
            PushNotifications.requestPermissions().then(result => {
                if (result.receive === 'granted') {
                    // Register with Apple / Google to receive push via APNS/FCM
                    PushNotifications.register();
                } else {
                    // Show some error
                }
            });

            // On success, we should be able to receive notifications
            PushNotifications.addListener('registration',
                (token: Token) => {
                    this.register(token.value);
                }
            );

            // Some issue with our setup and push will not work
            PushNotifications.addListener('registrationError',
                (error: any) => {
                    // alert('Error on registration: ' + JSON.stringify(error));
                }
            );

            // Show us the notification payload if the app is open on our device
            PushNotifications.addListener('pushNotificationReceived',
                (notification: PushNotificationSchema) => {
                    console.log('noti=', notification);
                    this.dashboardService.receiveNotify(notification);
                }
            );

            // Method called when tapping on a notification
            PushNotifications.addListener('pushNotificationActionPerformed',
                (notification: ActionPerformed) => {
                    alert('Push action performed: ' + JSON.stringify(notification));
                }
            );
        }
    }

    logout() {
        if (this.isPushNotificationsAvailable) {
            PushNotifications.removeAllListeners().then( res => {
                localStorage.removeItem(AuthService.PID);
            });
        }
    }

    async register(token) {
        const info = await Device.getInfo();
        const uuid = await Device.getId();
        this.api.post('api/register-push', {
            platform: JSON.stringify({
                platform: info.platform,
                manufacturer: info.manufacturer,
                model: info.model,
                name: info.name,
                osVersion: info.osVersion,
                webViewVersion: info.webViewVersion
            }),
            uuid: uuid.identifier,
            reg_id: token
        }).subscribe(res => {
            if (res.success == true) {
                localStorage.setItem(AuthService.PID, "" + res.id);
                // alert(token);
            }
        });
    }
}
