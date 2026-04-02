import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';
import { RatingModule } from 'ngx-bootstrap/rating';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { BaseChartDirective } from 'ng2-charts';
//Material
import {MatBadgeModule} from '@angular/material/badge';
import {MatTabsModule} from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import {MatListModule} from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { AddQuestionComponent } from './Components/add-question/add-question.component';
import { ProjectAdminComponent } from './Components/project-admin/project-admin.component';
import { CreateclientComponent } from '../createclient/createclient.component';
import { AssignQuestionToSurveyComponent } from '../pages/supsurvey/assign-question-to-survey/assign-question-to-survey.component';
import { CreateSurveyComponent } from '../pages/supsurvey/sup-surveylist/create-survey/create-survey.component';
import { SurveyComponent } from './Components/survey/survey.component';
import { SurveyListByClientComponent } from './Components/survey-list-by-client/survey-list-by-client.component';
import { SurveyFlagPopupComponent } from './Components/survey-list-by-client/survey-flag-popup/survey-flag-popup.component'; 
import { TaskdashboardComponent } from './Components/taskdashboard/taskdashboard.component';
import { QuestionpopupComponent } from './Components/add-question/questionpopup/questionpopup.component';
import { MatDialogModule } from '@angular/material/dialog';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {provideNativeDateAdapter} from '@angular/material/core';
import { MeetingsComponent } from './Components/meetings/meetings.component';
import { InterviewComponent } from './Components/meetings/interview/interview.component';
import { FocusgroupComponent } from './Components/meetings/focusgroup/focusgroup.component';
import { RecentComponent } from './Components/dashboard/recent/recent.component';
import { PinnedComponent } from './Components/dashboard/pinned/pinned.component';
import { PeopleComponent } from './Components/people/people.component';
import { QuestionListComponent } from './Components/question-list/question-list.component';
import { StagelistComponent } from './Components/survey/stagelist/stagelist.component';
import { SubphaselistComponent } from './Components/survey/subphaselist/subphaselist.component';
import { SurveyListComponent } from './Components/survey/survey-list/survey-list.component';
import { MatMenuModule } from '@angular/material/menu';
import { CreateComponent } from './Components/survey/create/create.component';
import { SurveyCreateComponent } from './Components/survey/survey-list/survey-create/survey-create.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { PhaseoneComponent } from './Components/dashboard/phaseone/phaseone.component';
import { PhasetwoComponent } from './Components/dashboard/phasetwo/phasetwo.component';
import { CreateUserComponent } from './Components/project-admin/create-user/create-user.component';
import { CreateGroupComponent } from './Components/meetings/create-group/create-group.component';
import { PeopleMatrixComponent } from './Components/people-matrix/people-matrix.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CreateMatricsComponent } from './Components/people-matrix/create-matrics/create-matrics.component';
import { ScheduleComponent } from './Components/meetings/schedule/schedule.component';
import { SurveyDetailsComponent } from './Components/dashboard/survey-details/survey-details.component';
import { SurveyInfoComponent } from './Components/survey-info/survey-info.component';
import { FocusgroupEditComponent } from './Components/meetings/focusgroup-edit/focusgroup-edit.component';
import { InfoMatrixComponent } from './Components/people-matrix/info-matrix/info-matrix.component';
import { TouchpointComponent } from './Components/touchpoint/touchpoint.component';
import { EmployeeTouchpointComponent } from './Components/touchpoint/employee-touchpoint/employee-touchpoint.component';
import { TouchpointEfficienciesComponent } from './Components/touchpoint/touchpoint-efficiencies/touchpoint-efficiencies.component';
import { TouchpointStakeholdersComponent } from './Components/touchpoint/touchpoint-stakeholders/touchpoint-stakeholders.component';
import { StarttouchpointComponent } from './Components/touchpoint/employee-touchpoint/starttouchpoint/starttouchpoint.component';
import { StartefficiencyComponent } from './Components/touchpoint/touchpoint-efficiencies/startefficiency/startefficiency.component';
import { StartstekholderComponent } from './Components/touchpoint/touchpoint-stakeholders/startstekholder/startstekholder.component';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {MatInputModule} from '@angular/material/input';
import {MatStepperModule} from '@angular/material/stepper';
import { InfochartComponent } from './Components/touchpoint/infochart/infochart.component';
import { JourneyMapComponent } from './Components/journey-map/journey-map.component';
import { CommunicationExComponent } from './Components/communication-ex/communication-ex.component';
import { NgxPrintModule } from 'ngx-print';
import { FaqComponent } from './Components/faq/faq.component';
import { JourneyRoadmapComponent } from './Components/journey-roadmap/journey-roadmap.component';
import { SurveyInfoquestionComponent } from './Components/survey-info/survey-infoquestion/survey-infoquestion.component';
import { FocusGroupComponent } from './Components/focus-group/focus-group.component';
import { AssignrealitytouchpointComponent } from './Components/touchpoint/assignrealitytouchpoint/assignrealitytouchpoint.component';
import { ReportComponent } from './Components/report/report.component';
import { ChartComponent } from './Components/report/chart/chart.component';
import { OptionDetailComponent } from './Components/report/option-detail/option-detail.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgApexchartsModule } from "ng-apexcharts";
import { ManagereffectComponent } from './Components/report/managereffect/managereffect.component';
import { AnalysecreateComponent } from './Components/journey-map/analysecreate/analysecreate.component';
import { InfographicComponent } from './infographic/infographic.component';
import { DemographicChartsComponent } from './Components/demographic-charts/demographic-charts.component';
import { ProjectdashComponent } from './Components/projectdash/projectdash.component';
import { CpocSurveyComponent } from './Components/cpoc-survey/cpoc-survey.component';
import { DemographicComponent } from './Components/demographic/demographic.component';
import { CpocSurveyRespComponent } from './Components/cpoc-survey-resp/cpoc-survey-resp.component';
import {MatRadioModule} from '@angular/material/radio';
import { FeedbackComponent } from './Components/feedback/feedback.component';
import { ProfileCpocComponent } from './Components/profile-cpoc/profile-cpoc.component';
import { SurveyresponsesComponent } from './Components/survey-info/surveyresponses/surveyresponses.component';
import { WhoassignedComponent } from './Components/survey-info/whoassigned/whoassigned.component';
import { SurveyIdInfoComponent } from './Components/projectdash/survey-id-info/survey-id-info.component';
import { EXDiagnosticDetailsComponent } from './Components/projectdash/exdiagnostic-details/exdiagnostic-details.component';
import { ClientBrandListComponent } from './Components/client-brand/client-brand-list.component';
import { ClientBrandDialogComponent } from './Components/client-brand/client-brand-dialog.component';
import { ClientBrandCategoryCouponsDialogComponent } from './Components/client-brand/client-brand-category-coupons-dialog.component';
import { ClientCouponListComponent } from './Components/client-coupon/client-coupon-list.component';
import { ClientCouponDialogComponent } from './Components/client-coupon/client-coupon-dialog.component';
import { BrandCouponAssignmentComponent } from './Components/client-assignment/brand-coupon-assignment.component';
import { AssignedBrandListComponent } from './Components/client-assignment/assigned-brand-list.component';
import { AssignedBrandDetailComponent } from './Components/client-assignment/assigned-brand-detail.component';
import { WallwtCpocComponent } from './Components/wallwt-cpoc/wallwt-cpoc.component';
import { VouchersComponent } from './Components/vouchers/vouchers.component';
import { VoucherDetailComponent } from './Components/vouchers/voucher-detail/voucher-detail.component';
import { CpocCartComponent } from './Components/cpoc-cart/cpoc-cart.component';
import { PurchasedVouchersComponent } from './Components/purchased-vouchers/purchased-vouchers.component';

@NgModule({
  declarations: [
    ProjectComponent,
    DashboardComponent,
    AddQuestionComponent,
    CreateclientComponent,
    AssignQuestionToSurveyComponent,
    CreateSurveyComponent,
    SurveyComponent,
    SurveyListByClientComponent,
    SurveyFlagPopupComponent,
    TaskdashboardComponent,
    QuestionpopupComponent,
    MeetingsComponent,
    ProjectAdminComponent,
    InterviewComponent,
    FocusgroupComponent,
    RecentComponent,
    PinnedComponent,
    PeopleComponent,
    QuestionListComponent,
    StagelistComponent,
    SubphaselistComponent,
    SurveyListComponent,
    CreateComponent,
    SurveyCreateComponent,
    PhaseoneComponent,
    PhasetwoComponent,
    CreateUserComponent,
    CreateGroupComponent,
    PeopleMatrixComponent,
    CreateMatricsComponent,
    ScheduleComponent,
    SurveyDetailsComponent,
    SurveyInfoComponent,
    FocusgroupEditComponent,
    InfoMatrixComponent,
    TouchpointComponent,
    EmployeeTouchpointComponent,
    TouchpointEfficienciesComponent,
    TouchpointStakeholdersComponent,
    StarttouchpointComponent,
    StartefficiencyComponent,
    StartstekholderComponent,
    InfochartComponent,
    JourneyMapComponent,
    CommunicationExComponent,
    FaqComponent,
    JourneyRoadmapComponent,
    SurveyInfoquestionComponent,
    FocusGroupComponent,
    AssignrealitytouchpointComponent,
    ReportComponent,
    ChartComponent,
    OptionDetailComponent,
    ManagereffectComponent,
    AnalysecreateComponent,
    InfographicComponent,
    DemographicChartsComponent,
    ProjectdashComponent,
    CpocSurveyComponent,
    DemographicComponent,
    CpocSurveyRespComponent,
    FeedbackComponent,
    ProfileCpocComponent,
    SurveyresponsesComponent,
    WhoassignedComponent,
    SurveyIdInfoComponent,
    EXDiagnosticDetailsComponent,
    ClientBrandListComponent,
    ClientBrandDialogComponent,
    ClientBrandCategoryCouponsDialogComponent,
    ClientCouponListComponent,
    ClientCouponDialogComponent,
    BrandCouponAssignmentComponent,
    AssignedBrandListComponent,
    AssignedBrandDetailComponent,
    WallwtCpocComponent,
    VouchersComponent,
    VoucherDetailComponent,
    CpocCartComponent,
    PurchasedVouchersComponent,
  ],
  imports: [
    CommonModule,
    NgxPaginationModule,
    NgMultiSelectDropDownModule.forRoot(),
    ProjectRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTabsModule,
    MatDialogModule,
    MatSelectModule,
    MatCardModule,
    MatBadgeModule,
    NgApexchartsModule,
    MatTabsModule,
    MatMenuModule,
    MatRadioModule,
    MatInputModule,
    MatStepperModule,
    NgxPrintModule,
    MatSlideToggleModule,
    BaseChartDirective,
    MatDatepickerModule,
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
    DragDropModule,
    RatingModule.forRoot(),
  ],
  providers: [provideNativeDateAdapter(),  provideCharts(withDefaultRegisterables())],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ProjectModule { }
