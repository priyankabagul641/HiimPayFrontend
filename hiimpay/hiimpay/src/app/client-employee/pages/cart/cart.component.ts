import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartItem, CartService } from '../../Services/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private sub?: Subscription;

  constructor(private cartService: CartService, private router: Router) {}

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

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item.id);
  }

  increment(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity + 1);
  }

  decrement(item: CartItem): void {
    this.cartService.updateQuantity(item.id, item.quantity - 1);
  }
}
