import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PublicRoutingModule } from './public-routing.module';

import { PublicLayoutComponent } from './components/public-layout/public-layout.component';
import { PublicHeaderComponent } from './components/public-header/public-header.component';
import { PublicFooterComponent } from './components/public-footer/public-footer.component';
import { VoucherListComponent } from './vouchers/voucher-list/voucher-list.component';
import { VoucherDetailsComponent } from './vouchers/voucher-details/voucher-details.component';
import { PublicCartComponent } from './vouchers/cart/cart.component';
import { PublicCheckoutComponent } from './vouchers/checkout/checkout.component';
import { OrderSuccessComponent } from './vouchers/success/success.component';
import { PublicProfileComponent } from './vouchers/profile/profile.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';

@NgModule({
  declarations: [
    PublicLayoutComponent,
    PublicHeaderComponent,
    PublicFooterComponent,
    VoucherListComponent,
    VoucherDetailsComponent,
    PublicCartComponent,
    PublicCheckoutComponent,
    OrderSuccessComponent,
    PublicProfileComponent,
    LoginModalComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    PublicRoutingModule,
  ]
})
export class PublicModule {}
