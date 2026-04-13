import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientEmployeeComponent } from './client-employee.component';
import { LoginComponent } from './login/login.component';
import { SurveyResponseComponent } from './pages/survey-response/survey-response.component';
import { ReminderComponent } from './pages/reminder/reminder.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { FaquserComponent } from './pages/faquser/faquser.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard.component';
import { BrowseCouponsComponent } from './pages/browse-coupons/browse-coupons.component';
import { MyCouponsComponent } from './pages/my-coupons/my-coupons.component';
import { WalletComponent } from './pages/wallet/wallet.component';
import { CouponDetailsComponent } from './pages/coupon-details/coupon-details.component';
import { CartComponent } from './pages/cart/cart.component';
import { TransactionsComponent } from './pages/transactions/transactions.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: ClientEmployeeComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'browse', component: BrowseCouponsComponent },
      { path: 'coupon-details/:id', component: CouponDetailsComponent },
      { path: 'cart', component: CartComponent },
      { path: 'my-coupons', component: MyCouponsComponent },
      { path: 'wallet', component: WalletComponent },
      { path: 'survey-response/:id', component: SurveyResponseComponent },
      { path: 'reminder', component: ReminderComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'faq', component: FaquserComponent },
       { path: 'transactions', component: TransactionsComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientEmployeeRoutingModule { }
