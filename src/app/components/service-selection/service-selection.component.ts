import {Component, OnInit} from '@angular/core';
import {AppointmentService} from "../../service/appointmentservice";
import {Router} from "@angular/router";

@Component({
    selector: 'app-service-selection',
    templateUrl: './service-selection.component.html',
    styleUrls: ['./service-selection.component.scss']
})
export class ServiceSelectionComponent implements OnInit {
    timeInformation: any;

    services: any[];

    constructor(public appointmentService: AppointmentService, private router: Router) {
    }

    ngOnInit(): void {
        const appointmentInformation = this.appointmentService.getAppointmentInformation();
        this.timeInformation = appointmentInformation.timeInformation;
        this.appointmentService.getServices().subscribe(res => {
            this.services = res.data;
        });
    }

    selectedDescription() {
        if (this.timeInformation.serviceId && this.services) {
            let service = this.services.find(el => el.id == this.timeInformation.serviceId);
            this.appointmentService.tableSessions = service.sessions;
            this.timeInformation.serviceName = service.name;
            return service.name;
        }
        return '';
    }

    nextPage() {
        if (this.timeInformation.serviceId > 0) {
            this.appointmentService.getAppointmentInformation().timeInformation = this.timeInformation;
            this.appointmentService.updateUserSelection();
            this.router.navigate(['appointment/time-range']);

            return;
        }
    }

}
