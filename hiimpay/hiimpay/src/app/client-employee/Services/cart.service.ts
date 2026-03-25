import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';

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
export class CartService {

  baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) {}

  private readonly storageKey = 'clientEmployeeCartItems';
  private readonly cartSubject = new BehaviorSubject<CartItem[]>(this.loadFromStorage());


  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  getCartSnapshot(): CartItem[] {
    return this.cartSubject.value;
  }

  addToCart(item: CartItem): void {
    const items = [...this.cartSubject.value];
    const index = items.findIndex((x) => x.id === item.id);

    if (index >= 0) {
      items[index] = { ...item };
    } else {
      items.push({ ...item });
    }

    this.commit(items);
  }

  updateQuantity(id: string, quantity: number): void {
    const items = [...this.cartSubject.value];
    const index = items.findIndex((x) => x.id === id);
    if (index < 0) return;

    if (quantity <= 0) {
      items.splice(index, 1);
      this.commit(items);
      return;
    }

    const item = items[index];
    const savings = ((item.price * item.discount) / 100) * quantity;
    const total = item.price * quantity;

    items[index] = {
      ...item,
      quantity,
      savings,
      total
    };

    this.commit(items);
  }

  removeItem(id: string): void {
    const items = this.cartSubject.value.filter((x) => x.id !== id);
    this.commit(items);
  }

  getItemQuantity(couponId: number, price: number): number {
    const item = this.cartSubject.value.find((x) => Number(x.couponId) === Number(couponId) && Number(x.price) === Number(price));
    return item?.quantity || 0;
  }

  private commit(items: CartItem[]): void {
    this.cartSubject.next(items);
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  private loadFromStorage(): CartItem[] {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

addtoCartItems (data:any,id:number):Observable<any>{
    return this.http.post<any>(this.baseUrl+`user-wallets/cart/bulk?userId=${id}`, data);
// object is like this 
// [
//   {
//     "id": "string",
//     "couponId": 0,
//     "brand": "string",
//     "title": "string",
//     "image": "string",
//     "price": 0,
//     "discount": 0,
//     "quantity": 0,
//     "total": 0,
//     "savings": 0
//   }
// ]

   }


}
