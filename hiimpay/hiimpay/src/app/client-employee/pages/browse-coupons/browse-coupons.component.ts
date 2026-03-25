import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClientEmployeeComponent } from '../../client-employee.component';

@Component({
  selector: 'app-browse-coupons-page',
  templateUrl: './browse-coupons.component.html',
  styleUrls: ['./browse-coupons.component.css']
})
export class BrowseCouponsComponent {
  constructor(public shell: ClientEmployeeComponent, private router: Router) {}

  get coupons() {
    return this.shell.filteredOffers.map((coupon: any) => ({
      ...coupon,
      brandName: coupon.brand,
      discount: coupon.discountPercent > 0 ? `${coupon.discountPercent}%` : 'Offer'
    }));
  }

  openCouponDetails(couponId: number) {
    this.router.navigate(['/clientEmployee/coupon-details', couponId]);
  }
}
