import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SuperadminRoutingModule } from './superadmin-routing.module';
import { SuperadminComponent } from './superadmin.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

// CDK
import { DragDropModule } from '@angular/cdk/drag-drop';

// Charts
import { NgxPaginationModule } from 'ngx-pagination';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { BaseChartDirective } from 'ng2-charts';

// Components
import { HomeComponent } from './pages/home/home.component';
import { RecentComponent } from './pages/recent/recent.component';
import { PinnedComponent } from './pages/pinned/pinned.component';
import { OpenComponent } from './pages/open/open.component';
import { InfoComponent } from './pages/info/info.component';
import { Info2Component } from './pages/ex-consultant/info/info2.component';
import { AssignComponent } from './pages/assign/assign.component';
import { SupsurveyComponent } from './pages/supsurvey/supsurvey.component';
import { SupquestionListComponent } from './pages/supquestion-list/supquestion-list.component';
import { SupSurveylistComponent } from './pages/supsurvey/sup-surveylist/sup-surveylist.component';
import { SupSubphaseListComponent } from './pages/supsurvey/sup-subphase-list/sup-subphase-list.component';
import { SupStageListComponent } from './pages/supsurvey/sup-stage-list/sup-stage-list.component';
import { Recent2Component } from './pages/recent2/recent2.component';
import { ExMeetingsComponent } from './pages/ex-meetings/ex-meetings.component';
import { TouchpointComponent } from './pages/touchpoint/touchpoint.component';
import { CreatetouchpointComponent } from './pages/touchpoint/createtouchpoint/createtouchpoint.component';
import { RealityComponent } from './pages/reality/reality.component';
import { ShowalltouchpointComponent } from './pages/touchpoint/showalltouchpoint/showalltouchpoint.component';
import { RealityComponentComponent } from './pages/reality-component/reality-component.component';
import { RealityQualityComponent } from './pages/reality-quality/reality-quality.component';
import { ShowallcomponentsComponent } from './pages/touchpoint/showallcomponents/showallcomponents.component';
import { AssignpopupComponent } from './pages/touchpoint/assignpopup/assignpopup.component';
import { AssignComponentComponent } from './pages/touchpoint/assign-component/assign-component.component';
import { AssignTouchpointComponent } from './pages/touchpoint/assign-touchpoint/assign-touchpoint.component';
import { ChartsComponent } from './pages/charts/charts.component';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';
import { DeleteComponent } from './pages/delete/delete.component';
import { FaqComponent } from './pages/faq/faq.component';
import { SurveyIndetailsComponent } from './pages/survey-indetails/survey-indetails.component';
import { AddmorequestionComponent } from './pages/addmorequestion/addmorequestion.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TouchRealityDetailsComponent } from './pages/touch-reality-details/touch-reality-details.component';
import { AddmoreTouchRealityComponent } from './pages/addmore-touch-reality/addmore-touch-reality.component';
import { ExConsultantComponent } from './pages/ex-consultant/ex-consultant.component';
import { CreateConsultantComponent } from './pages/ex-consultant/create-consultant/create-consultant.component';
import { CreateCouponComponent } from './pages/supsurvey/sup-surveylist/create-coupon/create-coupon.component';
import { VoucherDetailDialogComponent } from './pages/supsurvey/sup-surveylist/voucher-detail-dialog/voucher-detail-dialog.component';
import { OnboardEmployeeComponent } from './pages/onboard-employee/onboard-employee.component';
import { OnboardEmployeeFormComponent } from './pages/onboard-employee/onboard-employee-form/onboard-employee-form.component';
import { CreateBrandComponent } from './pages/create-brand/create-brand.component';

// Voucher / Brand
import { VoucherBrandListComponent } from './pages/voucher-brand-list/voucher-brand-list.component';
import {BrandDetailsComponent} from './pages/voucher-brand-details/voucher-brand-details.component';
import { VoucherDashboardComponent } from './pages/voucher-dashboard/voucher-dashboard.component';
import { VoucherPullComponent } from './pages/voucher-pull/voucher-pull.component';
import { VoucherStockComponent } from './pages/voucher-stock/voucher-stock.component';
import { SidenavLayoutComponent } from './pages/voucher-sidenav/sidenav-layout.component';
import { StoreLocatorComponent } from './pages/store-locator/store-locator.component';
import { ManageAdminComponent } from './pages/manage-admin/manage-admin.component';
import { ClientBrandListPageComponent } from './pages/client-brand-list/client-brand-list.component';
import { RouterModule } from '@angular/router';

// ✅ ADD BRAND DIALOG
import { AddBrandDialogComponent } from './pages/voucher-brand-list/add-brand-dialog/add-brand-dialog.component';
import { UpdateBrandDialogComponent } from './pages/voucher-brand-list/update-brand-dialog/update-brand-dialog.component';
import { BrandCategoryCouponsDialogComponent } from './pages/voucher-brand-list/brand-category-coupons-dialog/brand-category-coupons-dialog.component';
import { ClientInfoDialogComponent } from './pages/voucher-brand-list/client-info-dialog/client-info-dialog.component';

@NgModule({
  declarations: [
    SuperadminComponent,
    HomeComponent,
    ManageAdminComponent,
    RecentComponent,
    PinnedComponent,
    OpenComponent,
    InfoComponent,
    Info2Component,
    AssignComponent,
    SupsurveyComponent,
    SupquestionListComponent,
    SupSurveylistComponent,
    SupSubphaseListComponent,
    SupStageListComponent,
    Recent2Component,
    ExMeetingsComponent,
    TouchpointComponent,
    CreatetouchpointComponent,
    RealityComponent,
    ShowalltouchpointComponent,
    RealityComponentComponent,
    RealityQualityComponent,
    ShowallcomponentsComponent,
    AssignpopupComponent,
    AssignComponentComponent,
    AssignTouchpointComponent,
    ChartsComponent,
    AdminProfileComponent,
    DeleteComponent,
    FaqComponent,
    SurveyIndetailsComponent,
    AddmorequestionComponent,
    ProfileComponent,
    TouchRealityDetailsComponent,
    AddmoreTouchRealityComponent,
    ExConsultantComponent,
    CreateConsultantComponent,
    CreateCouponComponent,
    VoucherDetailDialogComponent,
    OnboardEmployeeComponent,
    OnboardEmployeeFormComponent,
    CreateBrandComponent,
    SidenavLayoutComponent,
    VoucherDashboardComponent,
    VoucherBrandListComponent,
    BrandDetailsComponent,
    VoucherPullComponent,
    VoucherStockComponent,
    StoreLocatorComponent,
    ClientBrandListPageComponent,

    // ✅ REQUIRED FOR POPUP
    AddBrandDialogComponent,
    UpdateBrandDialogComponent,
    BrandCategoryCouponsDialogComponent,
    ClientInfoDialogComponent
  ],
  imports: [
    CommonModule,
    SuperadminRoutingModule,
    FormsModule,
    ReactiveFormsModule,

    // Material
    MatMenuModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatBadgeModule,

    // Charts & utils
    BaseChartDirective,
    NgxPaginationModule,
    DragDropModule,
RouterModule,
    NgCircleProgressModule.forRoot({
      radius: 60,
      space: -10,
      outerStrokeGradient: true,
      outerStrokeWidth: 10,
      outerStrokeColor: '#103a7f',
      outerStrokeGradientStopColor: '#103a7f',
      innerStrokeColor: '#069DE0',
      innerStrokeWidth: 10,
      animateTitle: false,
      animationDuration: 1000,
      showUnits: false,
      showBackground: false,
      clockwise: false,
      startFromZero: false,
      lazy: true
    })
  ],
  providers: [
    provideCharts(withDefaultRegisterables())
  ]
})
export class SuperadminModule {}
