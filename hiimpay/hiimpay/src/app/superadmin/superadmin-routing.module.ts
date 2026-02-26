import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SuperadminComponent } from './superadmin.component';
import { HomeComponent } from './pages/home/home.component';
import { RecentComponent } from './pages/recent/recent.component';
import { PinnedComponent } from './pages/pinned/pinned.component';
import { OpenComponent } from './pages/open/open.component';
// import { InfoComponent } from './pages/info/info.component';
import { AssignComponent } from './pages/assign/assign.component';
import { SupquestionListComponent } from './pages/supquestion-list/supquestion-list.component';
import { SupsurveyComponent } from './pages/supsurvey/supsurvey.component';
import { SupSubphaseListComponent } from './pages/supsurvey/sup-subphase-list/sup-subphase-list.component';
import { SupStageListComponent } from './pages/supsurvey/sup-stage-list/sup-stage-list.component';
import { SupSurveylistComponent } from './pages/supsurvey/sup-surveylist/sup-surveylist.component';
import { CreateCouponComponent } from './pages/supsurvey/sup-surveylist/create-coupon/create-coupon.component';
import { OnboardEmployeeComponent } from './pages/onboard-employee/onboard-employee.component';
import { AssignQuestionToSurveyComponent } from './pages/supsurvey/assign-question-to-survey/assign-question-to-survey.component';
import { Recent2Component } from './pages/recent2/recent2.component';
import { ExMeetingsComponent } from './pages/ex-meetings/ex-meetings.component';
import { TouchpointComponent } from './pages/touchpoint/touchpoint.component';
import { RealityComponent } from './pages/reality/reality.component';
import { RealityComponentComponent } from './pages/reality-component/reality-component.component';
import { RealityQualityComponent } from './pages/reality-quality/reality-quality.component';
import { AssignComponentComponent } from './pages/touchpoint/assign-component/assign-component.component';
import { AssignTouchpointComponent } from './pages/touchpoint/assign-touchpoint/assign-touchpoint.component';
import { ChartsComponent } from './pages/charts/charts.component';
import { FaqComponent } from './pages/faq/faq.component';
import { SurveyIndetailsComponent } from './pages/survey-indetails/survey-indetails.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { TouchRealityDetailsComponent } from './pages/touch-reality-details/touch-reality-details.component';
import { ExConsultantComponent } from './pages/ex-consultant/ex-consultant.component';
import { SidenavLayoutComponent } from './pages/voucher-sidenav/sidenav-layout.component';
import { VoucherDashboardComponent } from './pages/voucher-dashboard/voucher-dashboard.component';
import { VoucherBrandListComponent } from './pages/voucher-brand-list/voucher-brand-list.component';
import { BrandDetailsComponent } from './pages/voucher-brand-details/voucher-brand-details.component';
import { VoucherPullComponent } from './pages/voucher-pull/voucher-pull.component';
import { VoucherStockComponent } from './pages/voucher-stock/voucher-stock.component';
import { StoreLocatorComponent } from './pages/store-locator/store-locator.component';
import { ManageAdminComponent } from './pages/manage-admin/manage-admin.component';
import { ClientBrandListPageComponent } from './pages/client-brand-list/client-brand-list.component';

const routes: Routes = [

  {
    path: '',
    redirectTo: 'open',
    pathMatch: 'full',
  },
  {
    path: '', component: SuperadminComponent, children: [
        { path: 'recent', component: Recent2Component },
        { path: 'pinned', component: PinnedComponent },
        { path: 'onboard-employee', component: OnboardEmployeeComponent },
      // { path: 'info', component: InfoComponent },
      { path: 'assign', component: AssignComponent },
      { path: 'consultant', component:ExConsultantComponent},
      { path: 'events', component: ExMeetingsComponent },
      {
        path: 'home', component: HomeComponent, children: [
          { path: 'recent/:status', component: RecentComponent },
          { path: 'pinned', component: PinnedComponent },

        ]
      },
      {
        path: 'qualityReality', component: RealityQualityComponent,
        children: [
          { path: 'reality', component: RealityComponentComponent },
          { path: 'quality', component: PinnedComponent },

        ]
      },
      { path: 'chart', component: ChartsComponent },
      { path: 'open', component: OpenComponent },
      { path: 'faq', component: FaqComponent },
      { path: 'touchpoint', component: TouchpointComponent },
      { path: 'assign-component', component: AssignComponentComponent },
      { path: 'assign-touchpoint', component: AssignTouchpointComponent },
      { path: 'assign-question-to-survey', component: AssignQuestionToSurveyComponent },
      { path: 'sup-question', component: SupquestionListComponent },
      { path: 'details/:id/:status', component: SurveyIndetailsComponent },
      { path: 'touchpoin-reality-details/:id/:name', component: TouchRealityDetailsComponent },
      { path: 'profile-admin', component: ProfileComponent },
            { path: 'manage-admin', component: ManageAdminComponent },

      {
        path: 'sup-survey', component: SupsurveyComponent, children: [
          { path: '', redirectTo: 'sup-surveylist', pathMatch: 'full' },
          { path: 'sup-surveylist', component: SupSurveylistComponent },
          { path: 'create-coupon', component: CreateCouponComponent },
          { path: 'stage', component: SupStageListComponent },
          { path: 'sup-subphase', component: SupSubphaseListComponent }
        ]
      }
        ,
        {
          path: 'voucher', component: SidenavLayoutComponent, children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: VoucherDashboardComponent },
            { path: 'brands', component: VoucherBrandListComponent },
            { path: 'client-brands', component: ClientBrandListPageComponent },
            { path: 'brands/:id', component: BrandDetailsComponent },
            { path: 'pull', component: VoucherPullComponent },
            { path: 'stock', component: VoucherStockComponent },
            { path: 'locator', component: StoreLocatorComponent }
          ]
        }
    ]
  },

  {
    path: 'project/:id',
    loadChildren: () =>
      import('./project/project.module').then((m) => m.ProjectModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SuperadminRoutingModule { }
