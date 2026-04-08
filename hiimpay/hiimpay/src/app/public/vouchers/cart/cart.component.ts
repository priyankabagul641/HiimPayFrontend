import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PublicCartService } from '../../services/public-cart.service';
import { PublicCartItem } from '../../models/voucher.model';

@Component({
  selector: 'app-public-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class PublicCartComponent implements OnInit, OnDestroy {
  cartItems: PublicCartItem[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private cartService: PublicCartService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get total(): number {
    return this.cartService.getTotal();
  }

  get totalSavings(): number {
    return this.cartService.getTotalSavings();
  }

  get itemCount(): number {
    return this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  incrementQty(item: PublicCartItem): void {
    if (item.quantity < 10) {
      this.cartService.updateQuantity(item.voucherId, item.denomination, item.quantity + 1);
    }
  }

  decrementQty(item: PublicCartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.voucherId, item.denomination, item.quantity - 1);
    }
  }

  removeItem(item: PublicCartItem): void {
    this.cartService.removeItem(item.voucherId, item.denomination);
    this.toastr.info(`${item.name} removed from cart`, 'Removed');
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.toastr.info('Cart cleared', '');
  }

  continueShopping(): void {
    this.router.navigate(['/store/vouchers']);
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      this.toastr.warning('Your cart is empty');
      return;
    }
    this.router.navigate(['/store/checkout']);
  }
}
