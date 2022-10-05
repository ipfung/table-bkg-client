import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../service/app.config.service';
import { AppConfig } from '../../api/appconfig';
import {ApiService} from "../../service/api.service";
import {TranslateService} from "@ngx-translate/core";
import {Lemonade} from "../../service/lemonade.service";
import {DashboardService} from "../../service/dashboard.service";

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {

    items: MenuItem[];

    appointments: [];

    rooms = [];

    data = {
        showBookingCount: false,
        totalBooking: 0,
        totalFutureBooking: 0,
        showCustomerCount: false,
        totalSales: 0,
        totalUnpaid: 0,
        showSalesChart: false,
        percentLoad: 0,
        showUnknown: false,
        showUpcomingAppointments: false,
        showNotifications: false,
        isTrainerUser: false
    };

    chartData: any;

    chartOptions: any;

    subscription: Subscription;

    config: AppConfig;

    notifications = [];
    noOfNotifications = 5;

    constructor(public configService: ConfigService, private api: ApiService, private lemonade: Lemonade, private dashboardService: DashboardService, private translateService: TranslateService) {}

    ngOnInit() {
        this.config = this.configService.config;
        this.subscription = this.configService.configUpdate$.subscribe(config => {
            this.config = config;
            this.updateChartOptions();
        });

        this.items = [
            {label: 'Add New', icon: 'pi pi-fw pi-plus'},
            {label: 'Remove', icon: 'pi pi-fw pi-minus'}
        ];

        //lemonade.
        this.api.get('api/notifications', {
            limit: this.noOfNotifications
        }).subscribe( res => {
            this.notifications = res.data;
        });
        this.api.get('api/dashboard').subscribe( res => {
            this.data = res;

            this.dashboardService.updateNotificationsCount(res.noOfNewNotifications);
            if (res.showUpcomingAppointments) {
                this.appointments = res.appointments;
            }
            if (res.showSalesChart) {
                this.translateService.get(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'This Week', 'Last Week']).subscribe( str => {
                    this.chartData = {
                        labels: [str['Mon'], str['Tue'], str['Wed'], str['Thu'], str['Fri'], str['Sat'], str['Sun']],
                        datasets: [
                            {
                                label: str['Last Week'],
                                data: res.lastWeekSales,
                                fill: false,
                                backgroundColor: '#2f4860',
                                borderColor: '#2f4860',
                                tension: .4
                            },
                            {
                                label: str['This Week'],
                                data: res.currentWeekSales,
                                fill: false,
                                backgroundColor: '#00bb7e',
                                borderColor: '#00bb7e',
                                tension: .4
                            }
                        ]
                    };
                });
            }
        });
        this.api.get('api/rooms').subscribe( res => {
            this.rooms = res.data;
        });
    }

    ngOnDestroy(): void {
        if(this.subscription){
            this.subscription.unsubscribe();
        }
    }

    updateChartOptions() {
        if (this.config.dark)
            this.applyDarkTheme();
        else
            this.applyLightTheme();

    }

    applyDarkTheme() {
        this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#ebedef'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color:  'rgba(160, 167, 181, .3)',
                    }
                },
                y: {
                    ticks: {
                        color: '#ebedef'
                    },
                    grid: {
                        color:  'rgba(160, 167, 181, .3)',
                    }
                },
            }
        };
    }

    applyLightTheme() {
            this.chartOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: '#495057'
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color:  '#ebedef',
                    }
                },
                y: {
                    ticks: {
                        color: '#495057'
                    },
                    grid: {
                        color:  '#ebedef',
                    }
                },
            }
        };
    }
}
