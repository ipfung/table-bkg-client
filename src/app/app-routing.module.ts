import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FormLayoutComponent } from './components/formlayout/formlayout.component';
import { PanelsComponent } from './components/panels/panels.component';
import { OverlaysComponent } from './components/overlays/overlays.component';
import { MediaComponent } from './components/media/media.component';
import { MessagesComponent } from './components/messages/messages.component';
import { MiscComponent } from './components/misc/misc.component';
import { EmptyComponent } from './components/empty/empty.component';
import { ChartsComponent } from './components/charts/charts.component';
import { FileComponent } from './components/file/file.component';
import { DocumentationComponent } from './components/documentation/documentation.component';
import { AppMainComponent } from './app.main.component';
import { InputComponent } from './components/input/input.component';
import { ButtonComponent } from './components/button/button.component';
import { TableComponent } from './components/table/table.component';
import { ListComponent } from './components/list/list.component';
import { TreeComponent } from './components/tree/tree.component';
import { CrudComponent } from './components/crud/crud.component';
import { BlocksComponent } from './components/blocks/blocks.component';
import { FloatLabelComponent } from './components/floatlabel/floatlabel.component';
import { InvalidStateComponent } from './components/invalidstate/invalidstate.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { IconsComponent } from './components/icons/icons.component';
import { LandingComponent } from './components/landing/landing.component';
import { LoginComponent } from './components/login/login.component';
import { ErrorComponent } from './components/error/error.component';
import { NotfoundComponent } from './components/notfound/notfound.component';
import { AccessComponent } from './components/access/access.component';
import {BookingFormComponent} from "./components/booking-form/booking-form.component";
import {PaymentFormComponent} from "./components/payment-form/payment-form.component";
import {BookingConfirmationComponent} from "./components/booking-confirmation/booking-confirmation.component";
import {AppointmentStepsComponent} from "./components/appointment-steps/appointment-steps.component";
import {BookingTimeRangeComponent} from "./components/booking-time-range/booking-time-range.component";
import {AuthGuardService} from "./service/auth.service";
import {AppointmentStepsGuardService} from "./service/appointmentservice";
import {AppointmentListComponent} from "./components/appointment-list/appointment-list.component";
import {RescheduleComponent} from "./components/reschedule/reschedule.component";
import {ReschedulePackageComponent} from "./components/reschedule-package/reschedule-package.component";
import {UserProfileComponent} from "./components/user-profile/user-profile.component";
import {UserListComponent} from "./components/user-list/user-list.component";
import {TrainerStudentListComponent} from "./components/trainer-student-list/trainer-student-list.component";
import {FinanceStatusComponent} from "./components/finance-status/finance-status.component";
import {NotificationsListComponent} from "./components/notifications-list/notifications-list.component";
import {RoomListComponent} from "./components/room-list/room-list.component";
import {TimeslotListComponent} from "./components/timeslot-list/timeslot-list.component";
import {AppointmentCalendarComponent} from "./components/appointment-calendar/appointment-calendar.component";
import {ServiceSelectionComponent} from "./components/service-selection/service-selection.component";
import {TrainerCommissionComponent} from "./components/trainer-commission/trainer-commission.component";
import {PackageListComponent} from "./components/package-list/package-list.component";
import {PaymentSuccessfulComponent} from "./components/payment-successful/payment-successful.component";
import {PaymentFailComponent} from "./components/payment-fail/payment-fail.component";
import {ClassCheckinComponent} from "./components/class-checkin/class-checkin.component";
import {ServiceListComponent} from "./components/service-list/service-list.component";
import {WhatsappTemplatesComponent} from "./components/whatsapp-templates/whatsapp-templates.component";
import {NotificationTemplatesComponent} from "./components/notification-templates/notification-templates.component";
import { ReportSalesComponent } from './components/report-sales/report-sales.component';
import { ReportTrainerCommissionsComponent } from './components/report-trainer-commissions/report-trainer-commissions.component';
import {AppointmentBlocksComponent} from './components/appointment-blocks/appointment-blocks.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppMainComponent,
                children: [
                    {path: '', component: DashboardComponent, canActivate: [ AuthGuardService ]},
                    {path: 'user-profile', component: UserProfileComponent, canActivate: [ AuthGuardService ]},
                    {path: 'partner-list/:role', component: UserListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'calendar', component: AppointmentCalendarComponent, canActivate: [ AuthGuardService ]},
                    {path: 'appointment', component: AppointmentStepsComponent, children:[
                        {path:'', redirectTo: 'service-selection', pathMatch: 'full'},
                        {path: 'service-selection', component: ServiceSelectionComponent, canActivate: [ AuthGuardService, AppointmentStepsGuardService ]},
                        {path: 'time-range', component: BookingTimeRangeComponent, canActivate: [ AuthGuardService ]},
                        {path: 'datetime', component: BookingFormComponent, canActivate: [ AuthGuardService, AppointmentStepsGuardService ]},
                        {path: 'payment', component: PaymentFormComponent, canActivate: [ AuthGuardService, AppointmentStepsGuardService ]},
                        {path: 'confirmation', component: BookingConfirmationComponent, canActivate: [ AuthGuardService, AppointmentStepsGuardService ]}
                    ]},
                    {path: 'payment-successful/:id', component: PaymentSuccessfulComponent, canActivate: [ AuthGuardService ]},
                    {path: 'payment-fail/:id', component: PaymentFailComponent, canActivate: [ AuthGuardService ]},
                    {path: 'trainer-student-list', component: TrainerStudentListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'finance', component: FinanceStatusComponent, canActivate: [ AuthGuardService ]},
                    {path: 'trainer-commission', component: TrainerCommissionComponent, canActivate: [ AuthGuardService ]},
                    {path: 'notifications', component: NotificationsListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'settings/table-list', component: RoomListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'settings/package-list', component: PackageListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'settings/service-list', component: ServiceListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'settings/working-hours-list', component: TimeslotListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'settings/notification-templates', component: NotificationTemplatesComponent, canActivate: [ AuthGuardService ]},
                    {path: 'settings/whatsapp-templates', component: WhatsappTemplatesComponent, canActivate: [ AuthGuardService ]},
                    // {path: 'uikit/formlayout', component: FormLayoutComponent},
                    // {path: 'uikit/input', component: InputComponent},
                    // {path: 'uikit/floatlabel', component: FloatLabelComponent},
                    // {path: 'uikit/invalidstate', component: InvalidStateComponent},
                    // {path: 'uikit/button', component: ButtonComponent},
                    // {path: 'uikit/table', component: TableComponent},
                    // {path: 'uikit/list', component: ListComponent},
                    // {path: 'uikit/tree', component: TreeComponent},
                    // {path: 'uikit/panel', component: PanelsComponent},
                    // {path: 'uikit/overlay', component: OverlaysComponent},
                    // {path: 'uikit/media', component: MediaComponent},
                    // {path: 'uikit/menu', loadChildren: () => import('./components/menus/menus.module').then(m => m.MenusModule)},
                    // {path: 'uikit/message', component: MessagesComponent},
                    // {path: 'uikit/misc', component: MiscComponent},
                    // {path: 'uikit/charts', component: ChartsComponent},
                    // {path: 'uikit/file', component: FileComponent},
                    // {path: 'pages/crud', component: CrudComponent},
                    // {path: 'pages/timeline', component: TimelineComponent},
                    // {path: 'pages/empty', component: EmptyComponent},
                    // {path: 'icons', component: IconsComponent},
                    // {path: 'blocks', component: BlocksComponent},
                    // {path: 'documentation', component: DocumentationComponent}
                    {path:'reschedule/:id', component: RescheduleComponent, canActivate: [ AuthGuardService ]},
                    {path:'reschedule-package/:id', component: ReschedulePackageComponent, canActivate: [ AuthGuardService ]},
                    {path:'appointment-list', component: AppointmentListComponent, canActivate: [ AuthGuardService ]},
                    {path:'checkin/:id', component: ClassCheckinComponent, canActivate: [ AuthGuardService ]},

                    {path:'appointment-blocks', component: AppointmentBlocksComponent, canActivate: [ AuthGuardService ]},
                    //report
                    {path: 'report-sales', component: ReportSalesComponent, canActivate: [ AuthGuardService ]},
                    {path: 'report-trainer-commissions', component: ReportTrainerCommissionsComponent, canActivate: [ AuthGuardService ]},
                ],
            },
            {path:'index', component: LandingComponent},
            {path:'login', component: LoginComponent},
            {path:'pages/error', component: ErrorComponent},
            {path:'pages/notfound', component: NotfoundComponent},
            {path:'pages/access', component: AccessComponent},
            {path: '**', redirectTo: 'pages/notfound'},
        ], {scrollPositionRestoration: 'enabled', anchorScrolling:'enabled'})
    ],
    providers: [AuthGuardService, AppointmentStepsGuardService],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
