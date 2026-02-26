import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientEmployeeRoutingModule } from './client-employee-routing.module';
import { ClientEmployeeComponent } from './client-employee.component';
import {MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';

import {MatBadgeModule} from '@angular/material/badge';
import { CdkDrag, CdkDropList, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { SurveyResponseComponent } from './pages/survey-response/survey-response.component';
import { ReminderComponent } from './pages/reminder/reminder.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './pages/profile/profile.component';
import { FaquserComponent } from './pages/faquser/faquser.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { GenericDialogComponent } from './pages/generic-dialog/generic-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatRadioModule} from '@angular/material/radio';
import { ProfileUpdateDialogComponent } from './pages/profile-update-dialog/profile-update-dialog.component';

@NgModule({
  declarations: [
    ClientEmployeeComponent,
    LoginComponent,
    DashboardComponent,
    SurveyResponseComponent,
    ReminderComponent,
    ProfileComponent,
    FaquserComponent,
    GenericDialogComponent,
    ProfileUpdateDialogComponent
  ],
  imports: [
    CommonModule,
    ClientEmployeeRoutingModule,
    MatTabsModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatDatepickerModule,
    NgxPaginationModule,
    MatDialogModule,
    MatRadioModule,
    MatBadgeModule,
    NgCircleProgressModule.forRoot({
      "radius": 60,
      "space": -10,
      "outerStrokeGradient": true,
      "outerStrokeWidth": 10,
      "outerStrokeColor": "#103a7f",
      "outerStrokeGradientStopColor": "#103a7f",
      "innerStrokeColor": "#069DE0",
      "innerStrokeWidth": 10,
      "animateTitle": false,
      "animationDuration": 1000,
      "showUnits": false,
      "showBackground": false,
      "clockwise": false,
      "startFromZero": false,
      "lazy": true}),
    DragDropModule
  ]
})
export class ClientEmployeeModule { }
