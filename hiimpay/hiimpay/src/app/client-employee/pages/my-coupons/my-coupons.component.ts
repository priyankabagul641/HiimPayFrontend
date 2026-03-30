import { Component } from '@angular/core';
import { ClientEmployeeComponent } from '../../client-employee.component';

@Component({
  selector: 'app-my-coupons-page',
  templateUrl: './my-coupons.component.html',
  styleUrls: ['./my-coupons.component.css']
})
export class MyCouponsComponent {
  private readonly imageLoadErrors = new Set<string>();

  constructor(public shell: ClientEmployeeComponent) {}

  hasCouponImage(coupon: any): boolean {
    return Boolean(coupon?.imageUrl) && !this.imageLoadErrors.has(this.getCouponImageKey(coupon));
  }

  onCouponImageError(coupon: any): void {
    this.imageLoadErrors.add(this.getCouponImageKey(coupon));
  }

  private getCouponImageKey(coupon: any): string {
    return String(coupon?.id ?? coupon?.voucherId ?? coupon?.code ?? coupon?.brand ?? 'unknown-owned-coupon');
  }
}
