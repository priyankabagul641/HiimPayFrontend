import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientEmployeeComponent } from '../../client-employee.component';
import { CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-browse-coupons-page',
  templateUrl: './browse-coupons.component.html',
  styleUrls: ['./browse-coupons.component.css']
})
export class BrowseCouponsComponent implements OnInit {
  private readonly imageLoadErrors = new Set<string>();

  hoveredId: number | null = null;
  amountMap: Record<number, number> = {};

  constructor(
    public shell: ClientEmployeeComponent,
    private router: Router,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const categoryId = Number(params['categoryId'] || 0);
      this.shell.loadBrowseCoupons();
    });
  }

  get coupons(): any[] {
    return this.shell.filteredOffers.map((coupon: any) => ({
      ...coupon,
      brandName: coupon.brand,
      discount: coupon.discountPercent > 0 ? `${coupon.discountPercent}%` : 'Offer'
    }));
  }

  get isLoading(): boolean {
    return this.shell.browseCouponsLoading;
  }

  trackById(_index: number, coupon: any): number {
    return coupon.id;
  }

  hasCouponImage(coupon: any): boolean {
    return Boolean(coupon?.image) && !this.imageLoadErrors.has(this.getCouponImageKey(coupon));
  }

  onCouponImageError(coupon: any): void {
    this.imageLoadErrors.add(this.getCouponImageKey(coupon));
  }

  openCouponDetails(couponId: number) {
    this.router.navigate(['/clientEmployee/coupon-details', couponId]);
  }

  addtoCartItems(coupon: any, event: Event): void {
    event.stopPropagation();

    if (!this.shell.isLoggedIn) {
      this.shell.openLoginModal();
      return;
    }

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

  private getCouponImageKey(coupon: any): string {
    return String(coupon?.id ?? coupon?.brandName ?? coupon?.title ?? 'unknown-coupon');
  }

  isVariable(coupon: any): boolean {
    const min = Number(coupon?.minValue ?? 0);
    const max = Number(coupon?.maxValue ?? 0);
    return max > 0 && max !== min;
  }

  onAddToCart(coupon: any, event: Event): void {
    event.stopPropagation();

    if (!this.shell.isLoggedIn) {
      this.shell.openLoginModal();
      return;
    }

    const couponId = Number(coupon?.id ?? 0);
    if (!couponId) return;

    let price: number;
    if (this.isVariable(coupon)) {
      price = Number(this.amountMap[coupon.id] ?? 0);
      const min = Number(coupon.minValue ?? 0);
      const max = Number(coupon.maxValue ?? 0);
      if (!price || price < min || price > max) {
        this.openCouponDetails(couponId);
        return;
      }
    } else {
      price = Number(coupon?.minValue ?? 0);
      if (!price) { this.openCouponDetails(couponId); return; }
    }

    const discount = Number(coupon?.discountPercent ?? 0);
    const savings  = (price * discount) / 100;
    const item = {
      id: `${couponId}-${price}`,
      couponId,
      brand:    coupon?.brand || coupon?.brandName || '-',
      title:    coupon?.title || coupon?.brand || coupon?.brandName || '-',
      image:    coupon?.image || '',
      price, discount, quantity: 1, total: price, savings
    };

    this.cartService.addToCart(item);
    this.cartService.addtoCartItems([item], this.shell.userId).subscribe({
      error: (err: any) => console.error('Add to cart error:', err)
    });
  }
}
