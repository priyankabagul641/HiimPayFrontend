import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientEmployeeComponent } from '../../client-employee.component';
import { CartService } from '../../Services/cart.service';

type CouponTab = 'redeem' | 'terms' | 'description';

interface DenominationRow {
  mrp: number;
  quantity: number;
}

interface CustomAmount {
  amount: number;
  quantity: number;
}

@Component({
  selector: 'app-coupon-details',
  templateUrl: './coupon-details.component.html',
  styleUrls: ['./coupon-details.component.css']
})
export class CouponDetailsComponent implements OnInit {
  couponId = 0;
  activeTab: CouponTab = 'redeem';
  denominations: DenominationRow[] = [];
  customAmounts: CustomAmount[] = [];

  private denominationKey = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    public shell: ClientEmployeeComponent
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.couponId = Number(params.get('id') || 0);
      this.ensureDenominations();
      this.loadCustomAmounts();
    });

    if (!this.shell.activeOffers.length && this.shell.companyId) {
      this.shell.loadBrowseCoupons();
    }
  }

  get coupon(): any {
    return this.shell.activeOffers.find((item) => Number(item.id) === Number(this.couponId)) || {};
  }

  get discountPercent(): number {
    const val = Number(this.coupon?.discountPercent ?? 0);
    return Number.isFinite(val) ? val : 0;
  }

  setTab(tab: CouponTab) {
    this.activeTab = tab;
  }

  increment(index: number) {
    this.ensureDenominations();
    this.denominations[index].quantity += 1;
    this.syncDenomination(index);
  }

  decrement(index: number) {
    this.ensureDenominations();
    if (this.denominations[index].quantity > 0) {
      this.denominations[index].quantity -= 1;
      this.syncDenomination(index);
    }
  }

  customIncrement(index: number) {
    if (index < this.customAmounts.length) {
      this.customAmounts[index].quantity += 1;
      this.syncCustomAmount(index);
    }
  }

  customDecrement(index: number) {
    if (index < this.customAmounts.length && this.customAmounts[index].quantity > 0) {
      this.customAmounts[index].quantity -= 1;
      this.syncCustomAmount(index);
    }
  }

  addCustomAmount() {
    const minValue = Number(this.coupon?.minValue ?? 0);
    this.customAmounts.push({
      amount: minValue > 0 ? minValue : 500,
      quantity: 1
    });
    if (this.customAmounts.length === 1) {
      this.syncCustomAmount(0);
    }
  }

  removeCustomAmount(index: number) {
    if (index < this.customAmounts.length) {
      const item = this.customAmounts[index];
      this.customAmounts.splice(index, 1);
      const itemId = `${this.coupon.id}-custom-${item.amount}`;
      this.cartService.removeItem(itemId);
    }
  }

  onCustomAmountChange(index: number) {
    if (index < this.customAmounts.length && this.customAmounts[index].quantity > 0) {
      this.syncCustomAmount(index);
    }
  }

  rowSavings(row: DenominationRow): number {
    return ((row.mrp * this.discountPercent) / 100) * row.quantity;
  }

  rowTotal(row: DenominationRow): number {
    return row.mrp * row.quantity - this.rowSavings(row);
  }

  customRowSavings(row: CustomAmount): number {
    return ((row.amount * this.discountPercent) / 100) * row.quantity;
  }

  customRowTotal(row: CustomAmount): number {
    return row.amount * row.quantity - this.customRowSavings(row);
  }

  get totalQuantity(): number {
    this.ensureDenominations();
    const denominationQty = this.denominations.reduce((sum, row) => sum + row.quantity, 0);
    const customQty = this.customAmounts.reduce((sum, row) => sum + row.quantity, 0);
    return denominationQty + customQty;
  }

  get totalSavings(): number {
    this.ensureDenominations();
    const denominationSavings = this.denominations.reduce((sum, row) => sum + this.rowSavings(row), 0);
    const customSavings = this.customAmounts.reduce((sum, row) => sum + this.customRowSavings(row), 0);
    return denominationSavings + customSavings;
  }

  get totalAmount(): number {
    this.ensureDenominations();
    const denominationTotal = this.denominations.reduce((sum, row) => sum + this.rowTotal(row), 0);
    const customTotal = this.customAmounts.reduce((sum, row) => sum + this.customRowTotal(row), 0);
    return denominationTotal + customTotal;
  }

  proceedToCart() {
    if (this.totalQuantity <= 0) {
      return;
    }

    const cartItems = this.cartService.getCartSnapshot();
    const userId = this.shell.userId;

    this.cartService.addtoCartItems(cartItems, userId).subscribe({
      next: () => {
        this.router.navigate(['/clientEmployee/cart']);
      },
      error: (err: any) => {
        console.error('addtoCartItems API error:', err);
        // Navigate anyway so UX is not blocked
        this.router.navigate(['/clientEmployee/cart']);
      }
    });
  }

  private syncDenomination(index: number) {
    const row = this.denominations[index];
    if (!row || !this.coupon?.id) {
      return;
    }

    const itemId = `${this.coupon.id}-${row.mrp}`;
    if (row.quantity <= 0) {
      this.cartService.removeItem(itemId);
      return;
    }

    this.cartService.addToCart({
      id: itemId,
      couponId: Number(this.coupon.id),
      brand: this.coupon.brand || '-',
      title: this.coupon.title || this.coupon.brand || '-',
      image: this.coupon.image || '',
      price: row.mrp,
      discount: this.discountPercent,
      quantity: row.quantity,
      total: row.mrp * row.quantity,
      savings: this.rowSavings(row)
    });
  }

  private ensureDenominations() {
    const minValue = Number(this.coupon?.minValue ?? 0);
    const maxValue = Number(this.coupon?.maxValue ?? 0);
    const key = `${this.coupon?.id || 0}-${minValue}-${maxValue}-${this.discountPercent}`;

    if (this.denominationKey === key && this.denominations.length) {
      return;
    }

    let values: number[] = [];
    if (minValue > 0 && maxValue >= minValue) {
      const step = minValue;
      for (let v = minValue; v <= maxValue && values.length < 5; v += step) {
        values.push(v);
      }
    }

    if (!values.length) {
      values = [500, 1000, 2000, 5000];
    }

    this.denominations = values.map((mrp) => ({
      mrp,
      quantity: this.cartService.getItemQuantity(Number(this.coupon?.id || 0), mrp)
    }));
    this.denominationKey = key;
  }

  private syncCustomAmount(index: number) {
    const row = this.customAmounts[index];
    if (!row || !this.coupon?.id) {
      return;
    }

    const itemId = `${this.coupon.id}-custom-${row.amount}`;
    if (row.quantity <= 0) {
      this.cartService.removeItem(itemId);
      return;
    }

    this.cartService.addToCart({
      id: itemId,
      couponId: Number(this.coupon.id),
      brand: this.coupon.brand || '-',
      title: this.coupon.title || this.coupon.brand || '-',
      image: this.coupon.image || '',
      price: row.amount,
      discount: this.discountPercent,
      quantity: row.quantity,
      total: row.amount * row.quantity,
      savings: this.customRowSavings(row)
    });
  }

  private loadCustomAmounts() {
    // Initialize as empty array - custom amounts are added via "Add Custom Amount" button
    this.customAmounts = [];
  }
}
