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

  get sortedOwnedCoupons(): any[] {
    return [...this.shell.filteredOwnedCoupons].sort((a, b) => {
      const aDays = this.getCouponDaysLeft(a);
      const bDays = this.getCouponDaysLeft(b);

      // Place invalid/missing expiry at bottom.
      if (aDays === Number.MAX_SAFE_INTEGER && bDays === Number.MAX_SAFE_INTEGER) return 0;
      if (aDays === Number.MAX_SAFE_INTEGER) return 1;
      if (bDays === Number.MAX_SAFE_INTEGER) return -1;

      return aDays - bDays;
    });
  }

  getCouponDaysLeft(coupon: any): number {
    const expiresOn = coupon?.expiresOn;
    if (!expiresOn) return Number.MAX_SAFE_INTEGER;
    const days = this.shell.getDaysLeft(expiresOn);
    return Number.isFinite(days) ? days : Number.MAX_SAFE_INTEGER;
  }

  getCouponCode(coupon: any): string {
    const raw = coupon?.code ?? coupon?.voucherId ?? '';
    return raw === null || raw === undefined ? '' : String(raw);
  }

  private getCouponImageKey(coupon: any): string {
    return String(coupon?.id ?? coupon?.voucherId ?? coupon?.code ?? coupon?.brand ?? 'unknown-owned-coupon');
  }
}
