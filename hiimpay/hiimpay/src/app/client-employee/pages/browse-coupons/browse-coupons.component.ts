import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ClientEmployeeComponent } from '../../client-employee.component';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-browse-coupons-page',
  templateUrl: './browse-coupons.component.html',
  styleUrls: ['./browse-coupons.component.css']
})
export class BrowseCouponsComponent {
  constructor(
    public shell: ClientEmployeeComponent,
    private router: Router,
    private cartService: CartService
  ) {}

  get coupons() {
    return this.shell.filteredOffers.map((coupon: any) => ({
      ...coupon,
      brandName: coupon.brand,
      discount: coupon.discountPercent > 0 ? `${coupon.discountPercent}%` : 'Offer'
    }));
  }

  trackById(_index: number, coupon: any): number {
    return coupon.id;
  }

  openCouponDetails(couponId: number) {
    this.router.navigate(['/clientEmployee/coupon-details', couponId]);
  }

  addtoCartItems(coupon: any, event: Event): void {
    event.stopPropagation();

    const couponId = Number(coupon?.id || 0);
    if (!couponId) return;

    // If no denomination is set, navigate to details so user can pick price
    const price = Number(coupon?.minValue ?? 0);
    if (price <= 0) {
      this.openCouponDetails(couponId);
      return;
    }

    const discount = Number(coupon?.discountPercent ?? 0);
    const quantity = 1;
    const savings = ((price * discount) / 100) * quantity;

    const item = {
      id: `${couponId}-${price}`,
      couponId,
      brand: coupon?.brand || coupon?.brandName || '-',
      title: coupon?.title || coupon?.brand || coupon?.brandName || '-',
      image: coupon?.image || '',
      price,
      discount,
      quantity,
      total: price * quantity,
      savings
    };

    // Update local cart state immediately for instant UI feedback
    this.cartService.addToCart(item);

    // Sync with backend
    this.cartService.addtoCartItems([item], this.shell.userId).subscribe({
      next: () => {},
      error: (err: any) => console.error('Add to cart API error:', err)
    });
  }
}
