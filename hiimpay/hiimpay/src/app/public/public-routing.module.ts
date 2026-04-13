import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { VoucherListComponent } from './vouchers/voucher-list/voucher-list.component';
import { HomeComponent } from './home/home.component';
import { CategoryComponent } from './category/category.component';
import { VoucherDetailsComponent } from './vouchers/voucher-details/voucher-details.component';
import { PublicCartComponent } from './vouchers/cart/cart.component';
import { PublicCheckoutComponent } from './vouchers/checkout/checkout.component';
import { OrderSuccessComponent } from './vouchers/success/success.component';
import { PublicProfileComponent } from './vouchers/profile/profile.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'category/:type', component: CategoryComponent },
      { path: 'vouchers', component: VoucherListComponent },
      { path: 'vouchers/:id', component: VoucherDetailsComponent },
      { path: 'cart', component: PublicCartComponent },
      { path: 'checkout', component: PublicCheckoutComponent },
      { path: 'success', component: OrderSuccessComponent },
      { path: 'profile', component: PublicProfileComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule {}
