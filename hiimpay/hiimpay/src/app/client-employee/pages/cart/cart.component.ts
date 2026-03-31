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
  private readonly razorpayKeyId = 'rzp_test_SUgWJosaiMRnFd';

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
      amount: this.amountToPay,
      receipt: `RECEIPT-${Date.now()}`,
      notes: 'Cart checkout payment order'
    };

    this.cartService.razorPay(razorPayload).subscribe({
      next: async (res: any) => {
        const order = res?.data || {};
        const orderId = order?.orderId;
        const amount = Number(order?.amountInPaise ?? order?.amount ?? 0);

        if (!orderId || !amount) {
          this.isBuying = false;
          this.toastr.error('Invalid Razorpay order response.');
          return;
        }

        const loaded = await this.loadRazorpayScript();
        if (!loaded || !(window as any).Razorpay) {
          this.isBuying = false;
          this.toastr.error('Razorpay SDK failed to load.');
          return;
        }

        const options = {
          key: this.razorpayKeyId,
          amount,
          currency: order?.currency || 'INR',
          name: 'HiimPay',
          description: 'Cart Payment',
          order_id: orderId,
          handler: (paymentResponse: any) => {
            const verifyPayload = {
              userId,
              razorpayOrderId: paymentResponse?.razorpay_order_id,
              razorpayPaymentId: paymentResponse?.razorpay_payment_id,
              razorpaySignature: paymentResponse?.razorpay_signature,
              notes: 'Cart checkout payment verification'
            };

            const buyNowPayload = {
              userId,
              referenceNo: paymentResponse?.razorpay_payment_id || `REF-${Date.now()}`,
              notes: 'Checkout from cart',
              allocationSource: 'PURCHASE',
              status: 'PENDING',
              redemptionChannel: 'ONLINE',
              razorpayOrderId: paymentResponse?.razorpay_order_id,
              razorpayPaymentId: paymentResponse?.razorpay_payment_id,
              razorpaySignature: paymentResponse?.razorpay_signature
            };

            this.cartService.razorPayVerify(verifyPayload).subscribe({
              next: (verifyRes: any) => {
                const verifySuccess =
                  verifyRes?.success === true ||
                  (verifyRes?.message || '').toLowerCase().includes('verified') ||
                  (verifyRes?.message || '').toLowerCase().includes('success');

                if (!verifySuccess) {
                  this.isBuying = false;
                  this.toastr.error('Payment verification failed. Checkout not completed.');
                  return;
                }

                this.cartService.BuyNow(buyNowPayload).subscribe({
                  next: (res: any) => {
                    const checkoutSuccess =
                      res?.success === true ||
                      (res?.message || '').toLowerCase().includes('checkout completed successfully');

                    this.isBuying = false;
                    if (!checkoutSuccess) {
                      this.toastr.error('Payment captured, but checkout failed.');
                      return;
                    }

                    [...this.cartItems].forEach((item) => this.cartService.removeItem(item.id));
                    this.toastr.success('Payment completed and cart checkout successful.');
                    this.router.navigate(['/clientEmployee/my-coupons']);
                  },
                  error: (err: any) => {
                    this.isBuying = false;
                    console.error('BuyNow API error:', err);
                    this.toastr.error('Payment verified, but checkout API failed.');
                  }
                });
              },
              error: (err: any) => {
                this.isBuying = false;
                console.error('razorPayVerify API error:', err);
                this.toastr.error('Payment success, but verification failed.');
              }
            });
          },
          modal: {
            ondismiss: () => {
              this.isBuying = false;
              this.toastr.info('Payment popup closed.');
            }
          },
          notes: {
            userId: String(userId)
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      },
      error: (err: any) => {
        this.isBuying = false;
        console.error('razorPay API error:', err);
        this.toastr.error('Razorpay order failed. Please try again.');
      }
    });
  }

  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
}
