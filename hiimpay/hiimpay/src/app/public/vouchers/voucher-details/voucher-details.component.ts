import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PublicVoucherService } from '../../services/public-voucher.service';
import { PublicCartService } from '../../services/public-cart.service';
import { Voucher, PublicCartItem } from '../../models/voucher.model';

@Component({
  selector: 'app-voucher-details',
  templateUrl: './voucher-details.component.html',
  styleUrls: ['./voucher-details.component.css']
})
export class VoucherDetailsComponent implements OnInit, OnDestroy {
  voucher: Voucher | null = null;
  loading = true;
  selectedDenomination = 0;
  quantity = 1;
  activeTab: 'terms' | 'redeem' | '' = '';
  couponCode = '';
  selectedPayment = 'upi';
  cartItems: PublicCartItem[] = [];
  showLoginModal = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private voucherService: PublicVoucherService,
    private cartService: PublicCartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/store/vouchers']);
      return;
    }
    this.loadVoucher(id);
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVoucher(id: number): void {
    this.loading = true;
    this.voucherService.getVoucherById(id).subscribe({
      next: (voucher) => {
        this.voucher = voucher;
        this.selectedDenomination = voucher.denomination?.[0] || voucher.price;
        this.loading = false;
      },
      error: () => {
        this.voucher = this.getMockVoucher(id);
        this.selectedDenomination = this.voucher.denomination?.[0] || this.voucher.price;
        this.loading = false;
      }
    });
  }

  selectDenomination(value: number): void {
    this.selectedDenomination = value;
  }

  incrementQty(): void {
    if (this.quantity < 10) this.quantity++;
  }

  decrementQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  get effectivePrice(): number {
    if (!this.voucher) return 0;
    return Math.round(this.selectedDenomination * (1 - this.voucher.discountPercent / 100));
  }

  get totalPrice(): number {
    return this.effectivePrice * this.quantity;
  }

  get totalSavings(): number {
    return (this.selectedDenomination - this.effectivePrice) * this.quantity;
  }

  addToCart(): void {
    if (!this.voucher) return;
    this.cartService.addItem({
      voucherId: this.voucher.id,
      name: this.voucher.name,
      brand: this.voucher.brand,
      brandLogo: this.voucher.brandLogo,
      image: this.voucher.image,
      price: this.selectedDenomination,
      discountPercent: this.voucher.discountPercent,
      discountedPrice: this.effectivePrice,
      quantity: this.quantity,
      denomination: this.selectedDenomination
    });
    this.toastr.success(`${this.voucher.name} added to cart`, 'Added!');
  }

  addDenominationToCart(denom: number): void {
    if (!this.voucher) return;
    const effectivePrice = this.getEffectivePrice(denom);
    this.cartService.addItem({
      voucherId: this.voucher.id,
      name: this.voucher.name,
      brand: this.voucher.brand,
      brandLogo: this.voucher.brandLogo,
      image: this.voucher.image,
      price: denom,
      discountPercent: this.voucher.discountPercent,
      discountedPrice: effectivePrice,
      quantity: 1,
      denomination: denom
    });
    this.selectedDenomination = denom;
    this.toastr.success(`₹${denom} ${this.voucher.brand} added`, 'Added!');
  }

  getEffectivePrice(denom: number): number {
    if (!this.voucher) return denom;
    return Math.round(denom * (1 - this.voucher.discountPercent / 100));
  }

  applyCoupon(): void {
    if (this.couponCode.trim()) {
      this.toastr.info('Coupon applied (demo)', 'Coupon');
    }
  }

  removeCartItem(item: PublicCartItem): void {
    this.cartService.removeItem(item.voucherId, item.denomination);
  }

  incrementCartItem(item: PublicCartItem): void {
    this.cartService.updateQuantity(item.voucherId, item.denomination, item.quantity + 1);
  }

  decrementCartItem(item: PublicCartItem): void {
    this.cartService.updateQuantity(item.voucherId, item.denomination, item.quantity - 1);
  }

  get cartTotalValue(): number {
    return this.cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  }

  get cartTotalSavings(): number {
    return this.cartItems.reduce((s, i) => s + (i.price - i.discountedPrice) * i.quantity, 0);
  }

  get cartTotalPay(): number {
    return this.cartItems.reduce((s, i) => s + i.discountedPrice * i.quantity, 0);
  }

  goToCart(): void {
    this.router.navigate(['/store/cart']);
  }

  onAddToCart(denom: number): void {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (!token) {
      this.showLoginModal = true;
      return;
    }
    this.addDenominationToCart(denom);
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/store/cart']);
  }

  goBack(): void {
    this.router.navigate(['/store/vouchers']);
  }

  private getMockVoucher(id: number): Voucher {
    const brands = ['Amazon', 'Swiggy', 'Flipkart', 'MakeMyTrip', 'Myntra', 'Zomato', 'BookMyShow', 'Croma', 'Cleartrip', 'Nykaa', 'Uber', 'BigBasket'];
    const categories = ['Shopping', 'Food & Dining', 'Shopping', 'Travel', 'Shopping', 'Food & Dining', 'Entertainment', 'Electronics', 'Travel', 'Health & Wellness', 'Travel', 'Food & Dining'];
    const idx = (id - 1) % brands.length;
    const brand = brands[idx];
    const price = [500, 1000, 1500, 2000, 2500, 3000][idx % 6];
    const discount = [5, 8, 10, 12, 7, 15][idx % 6];

    return {
      id,
      name: `${brand} Gift Voucher`,
      brand,
      brandLogo: `https://via.placeholder.com/200x120?text=${brand}`,
      image: `https://via.placeholder.com/200x120?text=${brand}`,
      description: `Enjoy a seamless shopping experience with the ${brand} Gift Voucher. Use it across all ${brand} platforms and stores. Perfect for gifting or self-use.`,
      shortDescription: `${brand} digital gift voucher`,
      category: categories[idx],
      price,
      discountPercent: discount,
      discountedPrice: Math.round(price * (1 - discount / 100)),
      denomination: [500, 1000, 2000, 5000],
      termsAndConditions: '• Valid for 12 months from date of purchase\n• Cannot be exchanged for cash\n• Not reloadable or refundable\n• Can be used for partial payments\n• One voucher per transaction',
      howToRedeem: `1. Visit ${brand} website or app\n2. Add items to your cart\n3. Enter voucher code at checkout\n4. The voucher amount will be applied to your order`,
      validity: '12 months',
      type: 'E-VOUCHER',
      redemptionType: 'ONLINE',
      status: 'ACTIVE'
    };
  }
}
