import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PublicCartItem } from '../models/voucher.model';
import { environment } from '../../../environment/enviorment.prod';

export interface CartItem {
  id: string;
  brand: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  total: number;
  savings: number;
  couponId?: number;
  title?: string;
}
@Injectable({
  providedIn: 'root'
})
export class PublicCartService {
  private readonly baseUrl = environment.baseUrl;
  private readonly GUEST_STORAGE_KEY = 'publicGuestCart';
  private cartSubject = new BehaviorSubject<PublicCartItem[]>(this.loadGuestCart());

  constructor(private http: HttpClient) {}

  // ─── Observables ──────────────────────────────────────────────

  get cart$(): Observable<PublicCartItem[]> {
    return this.cartSubject.asObservable();
  }

  get cartItemCount$(): Observable<number> {
    return new Observable(observer => {
      this.cartSubject.subscribe(items => {
        observer.next(items.reduce((sum, item) => sum + item.quantity, 0));
      });
    });
  }

  // ─── Auth helpers ─────────────────────────────────────────────

  private getToken(): string | null {
    return sessionStorage.getItem('authToken');
  }

  private getUserId(): number | null {
    try {
      const raw = sessionStorage.getItem('currentLoggedInUserData');
      if (!raw) return null;
      const data = JSON.parse(raw);
      return data?.id ?? data?.data?.id ?? null;
    } catch {
      return null;
    }
  }

  private get isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getUserId();
  }

  // ─── Public cart operations (auto-route to API or localStorage) ───

  getItems(): PublicCartItem[] {
    return this.cartSubject.getValue();
  }

  /** Add item. Syncs to API when logged in, else saves to localStorage. */
  addItem(item: PublicCartItem): void {
    const items = this.getItems();
    const existing = items.find(
      i => i.voucherId === item.voucherId && i.denomination === item.denomination
    );
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      items.push({ ...item });
    }
    this.setLocal(items);
    if (this.isLoggedIn) {
      this.syncCartToApi(items);
    }
  }

  /** Remove item by voucherId + denomination. */
  removeItem(voucherId: number, denomination: number): void {
    const items = this.getItems().filter(
      i => !(i.voucherId === voucherId && i.denomination === denomination)
    );
    this.setLocal(items);
    if (this.isLoggedIn) {
      this.deleteVouchersById(voucherId).subscribe();
    }
  }

  /** Update quantity for a cart item. */
  updateQuantity(voucherId: number, denomination: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(voucherId, denomination);
      return;
    }
    const items = this.getItems();
    const item = items.find(
      i => i.voucherId === voucherId && i.denomination === denomination
    );
    if (item) {
      item.quantity = quantity;
      this.setLocal(items);
      if (this.isLoggedIn) {
        this.updateQuantityById({ quantity }, voucherId).subscribe();
      }
    }
  }

  clearCart(): void {
    this.setLocal([]);
  }

  getTotal(): number {
    return this.getItems().reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity, 0
    );
  }

  getTotalSavings(): number {
    return this.getItems().reduce(
      (sum, item) => sum + (item.price - item.discountedPrice) * item.quantity, 0
    );
  }

  // ─── API: Cart sync ───────────────────────────────────────────

  /** Merge local guest cart into API cart. Call this right after login. */
  syncCartToApi(items: PublicCartItem[]): void {
    const userId = this.getUserId();
    if (!userId) return;
    const payload = items.map(i => ({
      id: String(i.voucherId),
      couponId: i.voucherId,
      brand: i.brand,
      title: i.name,
      image: i.image,
      price: i.price,
      discount: i.discountPercent,
      quantity: i.quantity,
      total: i.discountedPrice * i.quantity,
      savings: (i.price - i.discountedPrice) * i.quantity
    }));
    this.addtoCartItems(payload, userId).pipe(
      catchError(err => {
        console.warn('Cart sync to API failed, keeping local cart', err);
        return of(null);
      })
    ).subscribe();
  }

  /** Fetch server cart and hydrate local state. Call after login. */
  loadCartFromApi(): void {
    const userId = this.getUserId();
    if (!userId) return;
    this.http.get<any>(`${this.baseUrl}user-wallets/cart?userId=${userId}`).pipe(
      catchError(err => {
        console.warn('Failed to fetch cart from API, using local cart', err);
        return of(null);
      })
    ).subscribe(res => {
      if (!res) return;
      const apiItems: CartItem[] = res?.data ?? res?.content ?? res ?? [];
      const mapped: PublicCartItem[] = apiItems.map((i: CartItem) => ({
        voucherId: i.couponId ?? Number(i.id),
        name: i.title ?? i.brand,
        brand: i.brand,
        brandLogo: i.image,
        image: i.image,
        price: i.price,
        discountPercent: i.discount,
        discountedPrice: Math.round(i.price * (1 - i.discount / 100)),
        quantity: i.quantity,
        denomination: i.price
      }));
      this.setLocal(mapped);
    });
  }

  // ─── API: Cart CRUD ───────────────────────────────────────────

  addtoCartItems(data: any, userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}user-wallets/cart/bulk?userId=${userId}`, data);
  }

  updateQuantityById(obj: { quantity: number }, voucherId: number | string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}user-wallets/cart/items/${voucherId}`, obj);
  }

  deleteVouchersById(voucherId: number | string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}user-wallets/cart/items/${voucherId}`);
  }

  // ─── API: Checkout & Payment ──────────────────────────────────

  buyNow(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}user-wallets/cart/checkout`, data);
  }

  razorPay(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}payments/razorpay/order`, data);
  }

  razorPayVerify(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}payments/razorpay/verify`, data).pipe(
      tap(response => {
        const invoiceUrl =
          response?.invoiceUrl ||
          response?.data?.invoiceUrl ||
          response?.checkout?.data?.invoiceUrl ||
          response?.data?.checkout?.data?.invoiceUrl;
        if (invoiceUrl) {
          setTimeout(() => this.downloadInvoice(invoiceUrl), 150);
        }
      })
    );
  }

  debitWallet(data: any, userId: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}user-reward-wallets/user/${userId}/debit`, data);
  }

  // ─── Invoice download ─────────────────────────────────────────

  downloadUrl(url: string): void {
    if (!url) return;
    this.downloadInvoice(url);
  }

  private downloadInvoice(url: string): void {
    const filename = this.extractFileName(url) || 'invoice.pdf';
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: blob => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      },
      error: err => {
        console.warn('Blob download failed, using anchor fallback', err);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    });
  }

  private extractFileName(url: string): string | null {
    try {
      return url.split('/').pop()?.split('?')[0] || null;
    } catch {
      return null;
    }
  }

  // ─── localStorage helpers ─────────────────────────────────────

  private setLocal(items: PublicCartItem[]): void {
    try {
      localStorage.setItem(this.GUEST_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage', e);
    }
    this.cartSubject.next(items);
  }

  private loadGuestCart(): PublicCartItem[] {
    try {
      const data = localStorage.getItem(this.GUEST_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
