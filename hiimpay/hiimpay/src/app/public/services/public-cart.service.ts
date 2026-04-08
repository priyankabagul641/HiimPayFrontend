import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PublicCartItem } from '../models/voucher.model';

@Injectable({
  providedIn: 'root'
})
export class PublicCartService {
  private readonly STORAGE_KEY = 'publicGuestCart';
  private cartSubject = new BehaviorSubject<PublicCartItem[]>(this.loadCart());

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

  getItems(): PublicCartItem[] {
    return this.cartSubject.getValue();
  }

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

    this.updateCart(items);
  }

  removeItem(voucherId: number, denomination: number): void {
    const items = this.getItems().filter(
      i => !(i.voucherId === voucherId && i.denomination === denomination)
    );
    this.updateCart(items);
  }

  updateQuantity(voucherId: number, denomination: number, quantity: number): void {
    const items = this.getItems();
    const item = items.find(
      i => i.voucherId === voucherId && i.denomination === denomination
    );
    if (item) {
      if (quantity <= 0) {
        this.removeItem(voucherId, denomination);
        return;
      }
      item.quantity = quantity;
      this.updateCart(items);
    }
  }

  clearCart(): void {
    this.updateCart([]);
  }

  getTotal(): number {
    return this.getItems().reduce(
      (sum, item) => sum + item.discountedPrice * item.quantity,
      0
    );
  }

  getTotalSavings(): number {
    return this.getItems().reduce(
      (sum, item) => sum + (item.price - item.discountedPrice) * item.quantity,
      0
    );
  }

  private updateCart(items: PublicCartItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save cart to localStorage', e);
    }
    this.cartSubject.next(items);
  }

  private loadCart(): PublicCartItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }
}
