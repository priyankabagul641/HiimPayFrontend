import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environment/enviorment.prod';

export interface CpocCartItem {
  id: string;            // unique entry key = brandId + denomination
  cartItemId?: number;   // backend cart item ID (for delete/update)
  brandId: number;
  brandName: string;
  brandImage: string;
  productName?: string;
  description?: string;
  denomination: number;  // chosen face value
  discountPercent: number;
  quantity: number;
  faceValue: number;     // denomination * quantity
  amountToPay: number;   // faceValue * (1 - discount/100)
  savings: number;       // faceValue - amountToPay
}

export interface CpocPurchasedVoucherResponse {
  data: Array<{
    stock: any;
  }>;
  message: string;
  success: boolean;
}

@Injectable({ providedIn: 'root' })
export class CpocCartService {
    baseUrl = environment.baseUrl;
  baseUrl2 = environment.baseUrl2;
   private directHttp: HttpClient;
  private readonly storageKey = 'cpocCartItems';

  // excelFormatDownloadUrl = environment.excelFormatFileUrl;
  excelFormatDownloadUrlForPeopleMatrix = environment.excelFileFormatUrlForPeopleMatrix;
  constructor(private http: HttpClient, private httpBackend: HttpBackend) {
    this.directHttp = new HttpClient(httpBackend);
  }

  private readonly _items = new BehaviorSubject<CpocCartItem[]>(this.loadFromStorage());

  getCart(): Observable<CpocCartItem[]> {
    return this._items.asObservable();
  }

  getSnapshot(): CpocCartItem[] {
    return this._items.getValue();
  }

  addItem(brand: any, denomination: number, cartItemId?: number): void {
    const items = [...this._items.getValue()];
    const id = `${brand.id}-${denomination}`;
    const existing = items.find(i => i.id === id);

    if (existing) {
      existing.quantity += 1;
      if (cartItemId) existing.cartItemId = cartItemId;
      this._recompute(existing);
    } else {
      const disc = Number(brand.epayDiscount ?? 0);
      const faceValue = denomination * 1;
      const amountToPay = Math.round(faceValue * (1 - disc / 100) * 100) / 100;
      items.push({
        id,
        cartItemId,
        brandId: brand.id,
        brandName: brand.brandName || brand.productName || '',
        brandImage: brand.brandImage || brand.imageUrl || '',
        productName: brand.productName || brand.brandName || '',
        description: brand.description || '',
        denomination,
        discountPercent: disc,
        quantity: 1,
        faceValue,
        amountToPay,
        savings: faceValue - amountToPay
      });
    }
    this.commit(items);
  }

  setCartItemId(id: string, cartItemId: number): void {
    const items = this._items.getValue().map(i => {
      if (i.id !== id) return i;
      return { ...i, cartItemId };
    });
    this.commit(items);
  }

  updateQuantity(id: string, qty: number): void {
    const items = this._items.getValue().map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, quantity: qty };
      this._recompute(updated);
      return updated;
    });
    this.commit(items);
  }

  removeItem(id: string): void {
    this.commit(this._items.getValue().filter(i => i.id !== id));
  }

  clearCart(): void {
    this.commit([]);
  }

  setItems(items: CpocCartItem[]): void {
    this.commit(items);
  }

  private _recompute(item: CpocCartItem): void {
    item.faceValue = item.denomination * item.quantity;
    const payPer = item.denomination * (1 - item.discountPercent / 100);
    item.amountToPay = Math.round(payPer * item.quantity * 100) / 100;
    item.savings = Math.round((item.faceValue - item.amountToPay) * 100) / 100;
  }

  private commit(items: CpocCartItem[]): void {
    this._items.next(items);
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch {}
  }

  private loadFromStorage(): CpocCartItem[] {
    try {
      const raw = sessionStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

addtoCartItems (data:any,id:number):Observable<any>{
    return this.http.post<any>(this.baseUrl+`cpoc-coupons/cart/items`, data);
// object is like this 
// {
//   "cpocUserId": 0,
//   "voucherId": 0,
//   "amount": 0,
//   "quantity": 0
// }

   }
updateQuantityy(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `cpoc-coupons/stock/update`, obj);
    //obj should be like this
// {
//   "cpocUserId": 0,
//   "voucherId": 0,
//   "addQuantity": 0,
//   "amount": 0,
//   "referenceNo": "string",
//   "notes": "string"
// }
  }

deleteVouchersById(voucherid:any): Observable<any> {
    return this.http.delete<any>(this.baseUrl + `cpoc-coupons/cart/items/${voucherid}`);
  }
getCartItemsByUserId(cpocUserId:any): Observable<any> {
    return this.http.get<any>(this.baseUrl + `cpoc-coupons/cart/user/${cpocUserId}`);
  }
checkoutCart(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `cpoc-coupons/cart/checkout`, obj);
    //obj should be like this
// {
//   "cpocUserId": 0,
//   "referenceNo": "string",
//   "notes": "string"
// }
  }
getPurchasedVouchers(cpocUserId: number): Observable<CpocPurchasedVoucherResponse> {
    return this.http.get<CpocPurchasedVoucherResponse>(this.baseUrl + `cpoc-coupons/stock/user/${cpocUserId}`);
  }

cpocPuchasedVouchers(cpocUserId:any): Observable<CpocPurchasedVoucherResponse> {
    return this.getPurchasedVouchers(Number(cpocUserId));
//   getting repomce like this
//   {
//   "data": [
//     {
//       "stock": {
//         "id": 3,
//         "cpocUserId": 98,
//         "companyId": 31,
//         "voucherId": 38,
//         "brand": {
//           "id": 11,
//           "brandName": "Tesco UK",
//           "brandProductCode": "TSCO-UK-2026-001",
//           "brandSku": "TSCO-UK-SKU-01",
//           "sku": "TSCO-UK-001",
//           "brandType": "RETAIL",
//           "onboardingType": "API",
//           "redemptionType": "ONLINE_AND_OFFLINE",
//           "onlineRedemptionUrl": "https://www.tesco.ie/?srsltid=AfmBOooP0CtggQlNb6h9_QuUv8KGSZG_f3-SX9GHCTNZPNeOqNp5KefV",
//           "brandImage": "https://thumbs.dreamstime.com/z/tesco-logo-editorial-illustrative-white-background-logo-icon-vector-logos-icons-set-social-media-flat-banner-vectors-svg-eps-210443709.jpg",
//           "epayMinValue": 5,
//           "epayMaxValue": 500,
//           "epayDiscount": 4,
//           "serviceType": "GIFT_CARD",
//           "stockAvailable": true,
//           "description": "Tesco UK gift cards valid across Tesco supermarkets and online grocery store in the United Kingdom.",
//           "tnc": "Valid for 24 months from last transaction. Cannot be redeemed for cash. Subject to Tesco UK terms.",
//           "importantInstruction": "Use the gift card code at checkout online or present barcode in-store.",
//           "createdAt": "2026-03-02T12:30:00",
//           "updatedAt": "2026-03-02T17:54:30.824",
//           "isDeleted": false,
//           "deletedAt": null
//         },
//         "purchasedQuantity": 5,
//         "availableQuantity": 5,
//         "createdAt": "2026-04-02T18:42:40.133",
//         "updatedAt": "2026-04-02T18:42:40.159"
//       }
//     }
//   ],
//   "message": "CPOC coupon stock fetched successfully",
//   "success": true
// }
  }

assignVouchers(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `cpoc-coupons/assign`, obj);
    //obj should be like this
// {
//   "cpocUserId": 123,
//   "voucherId": 456,
//   "quantity": 1,
//   "userIds": [1001, 1002, 1003],
//   "referenceNo": "ASSIGN-APR-1",
//   "notes": "Monthly gifts"
// }
  }


}
