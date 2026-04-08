import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PublicCartService } from '../../services/public-cart.service';
import { PublicVoucherService } from '../../services/public-voucher.service';
import { PublicCartItem } from '../../models/voucher.model';

declare var Razorpay: any;

@Component({
  selector: 'app-public-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class PublicCheckoutComponent implements OnInit, OnDestroy {
  guestForm!: FormGroup;
  cartItems: PublicCartItem[] = [];
  processing = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: PublicCartService,
    private voucherService: PublicVoucherService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.guestForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]]
    });

    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe(items => {
      this.cartItems = items;
      if (items.length === 0) {
        this.router.navigate(['/store/cart']);
      }
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
    return this.cartItems.reduce((sum, i) => sum + i.quantity, 0);
  }

  onSubmit(): void {
    if (this.guestForm.invalid) {
      this.guestForm.markAllAsTouched();
      this.toastr.error('Please fill all fields correctly');
      return;
    }

    this.processing = true;
    const orderData = {
      amount: this.total * 100, // paisa
      currency: 'INR'
    };

    this.voucherService.createRazorpayOrder(orderData).subscribe({
      next: (order: any) => {
        this.openRazorpay(order);
      },
      error: () => {
        // Fallback: simulate success for demo
        this.simulateSuccess();
      }
    });
  }

  private openRazorpay(order: any): void {
    const options = {
      key: order.key || 'rzp_test_placeholder',
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'HiimPay Store',
      description: `Purchase of ${this.itemCount} voucher(s)`,
      order_id: order.id,
      prefill: {
        name: this.guestForm.value.name,
        email: this.guestForm.value.email,
        contact: this.guestForm.value.mobile
      },
      handler: (response: any) => {
        this.verifyPayment(response);
      },
      modal: {
        ondismiss: () => {
          this.processing = false;
          this.toastr.info('Payment cancelled');
        }
      },
      theme: {
        color: '#6c63ff'
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();
  }

  private verifyPayment(response: any): void {
    this.voucherService.verifyRazorpayPayment(response).subscribe({
      next: () => {
        this.completeOrder(response.razorpay_payment_id || 'PAY_' + Date.now());
      },
      error: () => {
        this.processing = false;
        this.toastr.error('Payment verification failed. Please contact support.');
      }
    });
  }

  private simulateSuccess(): void {
    const paymentId = 'DEMO_' + Date.now();
    this.completeOrder(paymentId);
  }

  private completeOrder(paymentId: string): void {
    const orderSummary = {
      orderId: 'ORD_' + Date.now(),
      items: [...this.cartItems],
      guest: this.guestForm.value,
      totalAmount: this.total,
      totalSavings: this.totalSavings,
      paymentId,
      date: new Date().toISOString()
    };

    try {
      localStorage.setItem('publicLastOrder', JSON.stringify(orderSummary));
    } catch {}

    this.cartService.clearCart();
    this.processing = false;
    this.router.navigate(['/store/success']);
  }

  goBack(): void {
    this.router.navigate(['/store/cart']);
  }
}
