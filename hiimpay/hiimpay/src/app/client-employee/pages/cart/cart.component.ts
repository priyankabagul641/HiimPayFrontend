import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem, CartService } from '../../Services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isBuying = false;
  private sub?: Subscription;

  constructor(
    private cartService: CartService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.sub = this.cartService.getCart().subscribe((items) => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get totalVouchers(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  get voucherAmount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.total, 0);
  }

  get totalSavings(): number {
    return this.cartItems.reduce((sum, item) => sum + item.savings, 0);
  }

  get amountToPay(): number {
    return this.voucherAmount - this.totalSavings;
  }

  editItem(item: CartItem): void {
    const couponId = item.couponId || Number((item.id || '').split('-')[0]) || 0;
    if (!couponId) return;
    this.router.navigate(['/clientEmployee/coupon-details', couponId]);
  }

  // Calls deleteVouchersById API then removes from local state
  removeItem(item: CartItem): void {
    this.cartService.deleteVouchersById(item.couponId).subscribe({
      next: () => {
        this.cartService.removeItem(item.id);
      },
      error: (err: any) => {
        console.error('Delete cart item API error:', err);
        // Remove locally even if API fails so UX stays responsive
        this.cartService.removeItem(item.id);
      }
    });
  }

  // Optimistic local update + sync quantity change via API
  increment(item: CartItem): void {
    const newQty = item.quantity + 1;
    this.cartService.updateQuantity(item.id, newQty);
    this.cartService.updateQuantityById({ quantity: newQty }, item.couponId).subscribe({
      error: (err: any) => console.error('Update quantity API error:', err)
    });
  }

  decrement(item: CartItem): void {
    const newQty = item.quantity - 1;
    if (newQty <= 0) {
      this.removeItem(item);
      return;
    }
    this.cartService.updateQuantity(item.id, newQty);
    this.cartService.updateQuantityById({ quantity: newQty }, item.couponId).subscribe({
      error: (err: any) => console.error('Update quantity API error:', err)
    });
  }

  // Creates Razorpay order for cart payment
  buyNow(): void {
    if (this.isBuying || this.cartItems.length === 0) return;

    const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}');
    const userId = userData?.id || 0;

    if (!userId) {
      this.toastr.error('User not found. Please login again.');
      return;
    }

    this.isBuying = true;
    const razorPayload = {
      userId,
      receipt: `RECEIPT-${Date.now()}`,
      notes: 'Cart checkout payment order'
    };

    this.cartService.razorPay(razorPayload).subscribe({
      next: () => {
        this.isBuying = false;
        this.toastr.success('Razorpay order created successfully.');
      },
      error: (err: any) => {
        this.isBuying = false;
        console.error('razorPay API error:', err);
        this.toastr.error('Razorpay order failed. Please try again.');
      }
    });
  }
}
