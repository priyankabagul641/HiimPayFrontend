import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../services/companyService';
import { CpocCartService } from '../../../services/cpoc-cart.service';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

type VoucherTab = 'redeem' | 'terms' | 'description';

interface DenominationRow {
  mrp: number;
  quantity: number;
}

interface CustomAmount {
  amount: number;
  quantity: number;
}

@Component({
  selector: 'app-voucher-detail',
  templateUrl: './voucher-detail.component.html',
  styleUrls: ['./voucher-detail.component.css']
})
export class VoucherDetailComponent implements OnInit {
  voucherId = 0;
  voucher: any = null;
  loading = false;
  activeTab: VoucherTab = 'redeem';
  denominations: DenominationRow[] = [];
  customAmounts: CustomAmount[] = [];
  cartItemIds: Record<string, number | undefined> = {};

  private companyId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private cpocCart: CpocCartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.voucherId = Number(this.route.snapshot.params['id'] || 0);

    const parentId =
      this.route.snapshot.parent?.params['id'] ||
      this.route.snapshot.parent?.parent?.params['id'];
    if (parentId) {
      this.companyId = Number(parentId);
    } else {
      const stored = sessionStorage.getItem('ClientId');
      this.companyId = stored ? Number(stored) : 0;
    }

    this.loadVoucher();
  }

  get discountPercent(): number {
    return Number(this.voucher?.epayDiscount ?? 0);
  }

  setTab(tab: VoucherTab): void {
    this.activeTab = tab;
  }

  loadVoucher(): void {
    if (!this.companyId) {
      return;
    }
    this.loading = true;
    this.projectService.getCpocCouponById(this.companyId).subscribe({
      next: (res: any) => {
        const raw: any[] = Array.isArray(res?.data) ? res.data : [];
        const found = raw.find(c => Number(c.id) === this.voucherId);
        if (found) {
          this.voucher = {
            id: found.id,
            brandName: found.brand?.brandName || found.productName || '',
            brandImage: found.imageUrl || found.brand?.brandImage || '',
            epayDiscount: found.discountPercent ?? found.brand?.epayDiscount ?? 0,
            epayMinValue: found.minValue ?? 0,
            epayMaxValue: found.maxValue ?? 99999,
            denominations: found.denominations || '',
            description: found.description || '',
            categoryName: found.categoryName || found.category?.categoryName || '',
            productName: found.productName || '',
            terms: found.terms || found.brand?.tnc || '',
            redeemSteps: Array.isArray(found.redeemSteps) ? found.redeemSteps : [],
          };
          this.initDenominations();
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get effectiveDenominations(): number[] {
    if (!this.voucher) return [];
    const raw = this.voucher.denominations;
    const values = Array.isArray(raw)
      ? raw
      : String(raw || '').split(',');

    return [...new Set(values
      .map((value: any) => Number(String(value).trim()))
      .filter((value: number) => !Number.isNaN(value) && value > 0))]
      .sort((left, right) => left - right);
  }

  private initDenominations(): void {
    const snapshot = this.cpocCart.getSnapshot();
    this.denominations = this.effectiveDenominations.map(mrp => {
      const key = `${this.voucherId}-${mrp}`;
      const existing = snapshot.find(item => item.id === key);
      if (existing?.cartItemId) {
        this.cartItemIds[key] = existing.cartItemId;
      }
      return { mrp, quantity: existing?.quantity || 0 };
    });
  }

  increment(index: number): void {
    const userId = this.getSessionUserId();
    if (!userId) {
      this.toastr.error('Please login to add items to cart.');
      return;
    }
    this.denominations[index].quantity += 1;
    const row = this.denominations[index];
    const key = `${this.voucherId}-${row.mrp}`;

    this.cpocCart.addItem({
      id: this.voucherId,
      brandName: this.voucher.brandName,
      brandImage: this.voucher.brandImage,
      productName: this.voucher.productName,
      description: this.voucher.description,
      epayDiscount: this.discountPercent,
      imageUrl: this.voucher.brandImage
    }, row.mrp, this.cartItemIds[key]);
  }

  decrement(index: number): void {
    const row = this.denominations[index];
    if (row.quantity <= 0) return;
    row.quantity -= 1;
    const key = `${this.voucherId}-${row.mrp}`;

    if (row.quantity === 0) {
      this.cpocCart.removeItem(key);
    } else {
      this.cpocCart.updateQuantity(key, row.quantity);
    }
  }

  addCustomAmount(): void {
    const min = Number(this.voucher?.epayMinValue ?? 0);
    this.customAmounts.push({ amount: min > 0 ? min : 500, quantity: 1 });
  }

  removeCustomAmount(index: number): void {
    this.customAmounts.splice(index, 1);
  }

  customIncrement(index: number): void {
    this.customAmounts[index].quantity += 1;
  }

  customDecrement(index: number): void {
    if (this.customAmounts[index].quantity > 0) {
      this.customAmounts[index].quantity -= 1;
    }
  }

  rowSavings(row: DenominationRow): number {
    return Math.round((row.mrp * this.discountPercent / 100) * row.quantity * 100) / 100;
  }

  rowTotal(row: DenominationRow): number {
    return Math.round((row.mrp * row.quantity - this.rowSavings(row)) * 100) / 100;
  }

  customRowSavings(row: CustomAmount): number {
    return Math.round((row.amount * this.discountPercent / 100) * row.quantity * 100) / 100;
  }

  customRowTotal(row: CustomAmount): number {
    return Math.round((row.amount * row.quantity - this.customRowSavings(row)) * 100) / 100;
  }

  get totalQuantity(): number {
    return this.denominations.reduce((s, r) => s + r.quantity, 0) +
           this.customAmounts.reduce((s, r) => s + r.quantity, 0);
  }

  get totalSavings(): number {
    return Math.round((
      this.denominations.reduce((s, r) => s + this.rowSavings(r), 0) +
      this.customAmounts.reduce((s, r) => s + this.customRowSavings(r), 0)
    ) * 100) / 100;
  }

  get totalGrossAmount(): number {
    return Math.round((
      this.denominations.reduce((s, r) => s + (r.mrp * r.quantity), 0) +
      this.customAmounts.reduce((s, r) => s + (r.amount * r.quantity), 0)
    ) * 100) / 100;
  }

  get totalAmount(): number {
    return Math.round((
      this.denominations.reduce((s, r) => s + this.rowTotal(r), 0) +
      this.customAmounts.reduce((s, r) => s + this.customRowTotal(r), 0)
    ) * 100) / 100;
  }

  proceedToCart(): void {
    if (this.totalQuantity <= 0) {
      this.toastr.warning('Please select at least one denomination.');
      return;
    }
    this.syncCartToServer();
  }

  private syncCartToServer(): void {
    const userId = this.getSessionUserId();
    if (!userId) {
      this.router.navigate(['cpoc-cart'], { relativeTo: this.route.parent });
      return;
    }

    const toDelete: { key: string; cartItemId: number }[] = [];
    const toCreate: { row: DenominationRow; key: string }[] = [];

    this.denominations.forEach(row => {
      const key = `${this.voucherId}-${row.mrp}`;
      const cartItemId = this.cartItemIds[key];
      if (cartItemId) {
        toDelete.push({ key, cartItemId });
      }
      if (row.quantity > 0) {
        toCreate.push({ row, key });
      }
    });

    const deletes$ = toDelete.length > 0
      ? forkJoin(toDelete.map(d =>
          this.cpocCart.deleteVouchersById(d.cartItemId).pipe(catchError(() => of(null)))
        ))
      : of([]);

    deletes$.pipe(
      switchMap(() => {
        toDelete.forEach(d => delete this.cartItemIds[d.key]);
        if (toCreate.length === 0) return of([]);
        return forkJoin(toCreate.map(({ row }) => {
          const payload = {
            cpocUserId: userId,
            voucherId: this.voucherId,
            amount: row.mrp,
            quantity: row.quantity
          };
          return this.cpocCart.addtoCartItems(payload, userId!).pipe(catchError(() => of(null)));
        }));
      })
    ).subscribe({
      next: (results: any[]) => {
        results.forEach((res: any, i: number) => {
          if (!res) return;
          const { key } = toCreate[i];
          const cartItemId = res?.data?.id ?? res?.id;
          this.cartItemIds[key] = cartItemId;
          this.cpocCart.setCartItemId(key, cartItemId);
        });
        this.router.navigate(['cpoc-cart'], { relativeTo: this.route.parent });
      },
      error: () => {
        this.router.navigate(['cpoc-cart'], { relativeTo: this.route.parent });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['vouchers'], { relativeTo: this.route.parent });
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
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
