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
import {PaymentConfirmationComponent} from "./components/payment-confirmation/payment-confirmation.component";
import {AppointmentStepsComponent} from "./components/appointment-steps/appointment-steps.component";
import {BookingTimeRangeComponent} from "./components/booking-time-range/booking-time-range.component";
import {AuthGuardService} from "./service/auth.service";
import {AppointmentStepsGuardService} from "./service/appointmentservice";
import {AppointmentListComponent} from "./components/appointment-list/appointment-list.component";
import {RescheduleComponent} from "./components/reschedule/reschedule.component";
import {UserListComponent} from "./components/user-list/user-list.component";
import {TrainerStudentListComponent} from "./components/trainer-student-list/trainer-student-list.component";
import {TrainerStudentFormComponent} from "./components/trainer-student-form/trainer-student-form.component";
@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppMainComponent,
                children: [
                    {path: 'user-list', component: UserListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'appointment', component: AppointmentStepsComponent, children:[
                        {path:'', redirectTo: 'time-range', pathMatch: 'full'},
                        {path: 'time-range', component: BookingTimeRangeComponent, canActivate: [ AuthGuardService ]},
                        {path: 'datetime', component: BookingFormComponent, canActivate: [ AuthGuardService, AppointmentStepsGuardService ]},
                        {path: 'payment', component: PaymentFormComponent, canActivate: [ AuthGuardService, AppointmentStepsGuardService ]},
                        {path: 'confirmation', component: PaymentConfirmationComponent, canActivate: [ AuthGuardService, AppointmentStepsGuardService ]}
                    ]},
                    {path: 'trainer-student-list', component: TrainerStudentListComponent, canActivate: [ AuthGuardService ]},
                    {path: 'trainer-student-form/:id', component: TrainerStudentFormComponent, canActivate: [ AuthGuardService ]},
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
                    {path:'appointment-list', component: AppointmentListComponent, canActivate: [ AuthGuardService ]},
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
