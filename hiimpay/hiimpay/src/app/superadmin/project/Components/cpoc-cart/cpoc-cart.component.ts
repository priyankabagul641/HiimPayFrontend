import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CpocCartItem, CpocCartService } from '../../services/cpoc-cart.service';
import { ProjectService } from '../../services/companyService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cpoc-cart',
  templateUrl: './cpoc-cart.component.html',
  styleUrls: ['./cpoc-cart.component.css']
})
export class CpocCartComponent implements OnInit, OnDestroy {
  cartItems: CpocCartItem[] = [];
  private sub?: Subscription;
  isCheckingOut = false;
  cartLoading = false;
  showConfirmModal = false;

  // Wallet
  walletBalance = 0;
  walletLoading = false;
  insufficientFunds = false;

  private cpocUserId: number | null = null;
  private companyId = 0;

  constructor(
    private cpocCart: CpocCartService,
    private projectService: ProjectService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cpocUserId = this.getSessionUserId();
    const parentId =
      this.route.snapshot.parent?.params['id'] ||
      this.route.snapshot.parent?.parent?.params['id'];
    if (parentId) {
      this.companyId = Number(parentId);
    } else {
      const stored = sessionStorage.getItem('ClientId');
      this.companyId = stored ? Number(stored) : 0;
    }
    this.sub = this.cpocCart.getCart().subscribe(items => {
      this.cartItems = items;
      this.checkFunds();
    });
    if (this.cpocUserId) {
      this.loadCartFromServer();
      this.loadWalletBalance();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadCartFromServer(): void {
    this.cartLoading = true;
    const localSnapshot = this.cpocCart.getSnapshot();

    const cart$ = this.cpocCart.getCartItemsByUserId(this.cpocUserId).pipe(
      catchError(() => of({ data: [] }))
    );
    const catalog$ = this.companyId
      ? this.projectService.getCpocCouponById(this.companyId).pipe(catchError(() => of({ data: [] })))
      : of({ data: [] });

    forkJoin([cart$, catalog$]).subscribe(([cartRes, catalogRes]) => {
      const serverItems: any[] = Array.isArray(cartRes?.data) ? cartRes.data : [];
      const catalogList: any[] = Array.isArray(catalogRes?.data) ? catalogRes.data : [];

      // Build catalog lookup by voucher id
      const catalogMap = new Map<number, any>();
      catalogList.forEach(c => catalogMap.set(Number(c.id), c));

      const usedLocalIds = new Set<string>();

      const mappedItems: CpocCartItem[] = serverItems.map((si: any) => {
        const rawVoucherId = Number(si.voucherId || 0);
        const serverDenom = Number(si.amount || 0);

        // Match local snapshot: by cartItemId first, then by composite key, then by brandId
        let localItem = localSnapshot.find(l => l.cartItemId === si.id && !usedLocalIds.has(l.id));
        if (!localItem && rawVoucherId && serverDenom) {
          localItem = localSnapshot.find(l => l.id === `${rawVoucherId}-${serverDenom}` && !usedLocalIds.has(l.id));
        }
        if (!localItem && rawVoucherId) {
          localItem = localSnapshot.find(l => l.brandId === rawVoucherId && !usedLocalIds.has(l.id));
        }
        if (localItem) usedLocalIds.add(localItem.id);

        // Match catalog for full metadata
        const catItem = catalogMap.get(rawVoucherId);
        const catBrand = catItem?.brand || {};

        const denom = serverDenom || localItem?.denomination || 0;
        const qty = Math.max(1, Number(si.quantity || localItem?.quantity || 1));
        const disc = Number(
          localItem?.discountPercent ||
          catItem?.discountPercent || catBrand.epayDiscount ||
          si.discountPercent || 0
        );

        const voucherId = rawVoucherId || localItem?.brandId || 0;
        const faceValue = Math.round(denom * qty * 100) / 100;
        const payPer = denom * (1 - disc / 100);
        const amountToPay = Math.round(payPer * qty * 100) / 100;

        return {
          id: `${voucherId}-${denom}`,
          cartItemId: si.id,
          brandId: voucherId,
          brandName: localItem?.brandName || catBrand.brandName || catItem?.productName || si.brandName || `Voucher #${voucherId}`,
          brandImage: localItem?.brandImage || catItem?.imageUrl || catBrand.brandImage || si.brandImage || '',
          productName: localItem?.productName || catItem?.productName || si.productName || '',
          description: localItem?.description || catItem?.description || catBrand.description || si.description || '',
          denomination: denom,
          discountPercent: disc,
          quantity: qty,
          faceValue,
          amountToPay,
          savings: Math.round((faceValue - amountToPay) * 100) / 100
        };
      });

      this.cpocCart.setItems(mappedItems.length > 0 ? mappedItems : localSnapshot);
      this.cartLoading = false;
    });
  }

  loadWalletBalance(): void {
    this.walletLoading = true;
    this.projectService.getUserWalletById(this.cpocUserId).subscribe({
      next: (res: any) => {
        const items = Array.isArray(res?.data) ? res.data : [];
        this.walletBalance = Number(items[0]?.wallet?.balance ?? 0);
        this.walletLoading = false;
        this.checkFunds();
      },
      error: () => {
        this.walletBalance = 0;
        this.walletLoading = false;
      }
    });
  }

  checkFunds(): void {
    this.insufficientFunds =
      this.cartItems.length > 0 && this.totalAmountToPay > this.walletBalance;
  }

  get totalFaceValue(): number {
    return this.cartItems.reduce((s, i) => s + i.faceValue, 0);
  }

  get totalVoucherAmount(): number {
    return this.totalFaceValue;
  }

  get totalSavings(): number {
    return this.cartItems.reduce((s, i) => s + i.savings, 0);
  }

  get totalAmountToPay(): number {
    return this.cartItems.reduce((s, i) => s + i.amountToPay, 0);
  }

  get totalItems(): number {
    return this.cartItems.reduce((s, i) => s + i.quantity, 0);
  }

  get shortfall(): number {
    return Math.max(0, this.totalAmountToPay - this.walletBalance);
  }

  editItem(item: CpocCartItem): void {
    this.router.navigate(['voucher-detail', item.brandId], { relativeTo: this.route.parent });
  }

  increment(item: CpocCartItem): void {
    const newQty = item.quantity + 1;
    this.cpocCart.updateQuantity(item.id, newQty);
    const payload = {
      cpocUserId: this.cpocUserId,
      voucherId: item.brandId,
      addQuantity: 1,
      amount: item.denomination,
      referenceNo: `REF-${Date.now()}`,
      notes: 'Quantity increased'
    };
    this.cpocCart.updateQuantityy(payload).subscribe({
      error: () => console.error('Failed to sync quantity to server')
    });
  }

  decrement(item: CpocCartItem): void {
    const newQty = item.quantity - 1;
    if (newQty <= 0) {
      this.removeItem(item);
      return;
    }
    this.cpocCart.updateQuantity(item.id, newQty);
    const payload = {
      cpocUserId: this.cpocUserId,
      voucherId: item.brandId,
      addQuantity: -1,
      amount: item.denomination,
      referenceNo: `REF-${Date.now()}`,
      notes: 'Quantity decreased'
    };
    this.cpocCart.updateQuantityy(payload).subscribe({
      error: () => console.error('Failed to sync quantity to server')
    });
  }

  removeItem(item: CpocCartItem): void {
    if (item.cartItemId) {
      this.cpocCart.deleteVouchersById(item.cartItemId).subscribe({
        error: () => console.error('Failed to delete cart item from server')
      });
    }
    this.cpocCart.removeItem(item.id);
    this.toastr.info(`${item.brandName} removed from cart`);
  }

  clearAll(): void {
    this.cartItems.forEach(item => {
      if (item.cartItemId) {
        this.cpocCart.deleteVouchersById(item.cartItemId).subscribe({
          error: () => console.error('Failed to delete item from server')
        });
      }
    });
    this.cpocCart.clearCart();
    this.toastr.info('Cart cleared');
  }

  checkout(): void {
    if (this.cartItems.length === 0) return;

    if (this.insufficientFunds) {
      this.toastr.warning(
        `Insufficient wallet balance (₹${this.walletBalance.toFixed(2)}). Please recharge your wallet first.`,
        'Low Balance', { timeOut: 5000 }
      );
      return;
    }

    if (!this.cpocUserId) {
      this.toastr.error('User not found. Please login again.');
      return;
    }

    this.showConfirmModal = true;
  }

  confirmCheckout(): void {
    if (this.isCheckingOut) return;
    this.isCheckingOut = true;
    const payload = {
      cpocUserId: this.cpocUserId,
      referenceNo: `CART-${Date.now()}`,
      notes: `Purchase: ${this.cartItems.map(i => `${i.brandName} x${i.quantity}`).join(', ')}`
    };

    this.cpocCart.checkoutCart(payload).subscribe({
      next: () => {
        this.showConfirmModal = false;
        this.toastr.success('Vouchers purchased successfully! 🎉');
        this.cpocCart.clearCart();
        this.isCheckingOut = false;
        this.router.navigate(['vouchers'], { relativeTo: this.route.parent });
      },
      error: () => {
        this.isCheckingOut = false;
        this.toastr.error('Checkout failed. Please try again.');
      }
    });
  }

  cancelCheckout(): void {
    this.showConfirmModal = false;
  }

  goBack(): void {
    this.location.back();
  }

  goToVouchers(): void {
    this.router.navigate(['vouchers'], { relativeTo: this.route.parent });
  }

  private getSessionUserId(): number | null {
    try {
      const raw = sessionStorage.getItem('currentLoggedInUserData');
      const user = raw ? JSON.parse(raw) : null;
      return user?.id ?? user?.userId ?? null;
    } catch {
      return null;
    }
  }
}
