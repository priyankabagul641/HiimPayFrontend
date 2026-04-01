import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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

  private extractFileNameFromUrl(url: string): string | null {
    try {
      const parts = url.split('/');
      const last = parts.pop();
      if (!last) return null;
      return last.split('?')[0] || null;
    } catch {
      return null;
    }
  }

  private downloadInvoice(url: string): void {
    const filename = this.extractFileNameFromUrl(url) || 'invoice.pdf';
    // Try to fetch as blob first (may fail due to CORS). If it fails, fall back to anchor/open.
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        try {
          const objectUrl = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = objectUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          a.remove();
          // Dispatch event so UI can optionally display the downloaded blob (e.g., preview modal)
          try {
            window.dispatchEvent(new CustomEvent('invoice-downloaded', { detail: { filename, objectUrl } }));
          } catch {}
          // revoke after short delay to allow UI if it wants to use objectUrl
          setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
          console.warn('Invoice downloaded via blob:', filename);
        } catch (e) {
          console.warn('Blob download failed, reporting failure to UI', e);
          try { window.dispatchEvent(new CustomEvent('invoice-download-failed', { detail: { url, filename, reason: String(e) } })); } catch {}
        }
      },
      error: (err) => {
        console.warn('Failed to fetch invoice blob, attempting direct anchor fallback', err);
        try {
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          a.remove();
          // Do not open a new tab. Notify UI of fallback attempt so it can show the URL or instructions.
          try { window.dispatchEvent(new CustomEvent('invoice-download-failed', { detail: { url, filename, reason: String(err) } })); } catch {}
        } catch (e2) {
          console.warn('Direct anchor fallback failed, reporting failure to UI', e2);
          try { window.dispatchEvent(new CustomEvent('invoice-download-failed', { detail: { url, filename, reason: String(e2) } })); } catch {}
        }
      }
    });
  }

  // Public wrapper so components can request a download without opening new tabs
  downloadUrl(url: string): void {
    if (!url) return;
    this.downloadInvoice(url);
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
updateQuantityById(obj: any,voucherid:any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `user-wallets/cart/items/${voucherid}`, obj);
    //obj should be like this
// {
//   "quantity": 0
// }
  }

deleteVouchersById(voucherid:any): Observable<any> {
    return this.http.delete<any>(this.baseUrl + `user-wallets/cart/items/${voucherid}`);
  }

 BuyNow (data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`user-wallets/cart/checkout`, data);
// object is like this 
// {
//   "userId": 0,
//   "referenceNo": "string",
//   "notes": "string",
//   "allocationSource": "string",
//   "status": "string",
//   "redemptionChannel": "string",
//   "razorpayOrderId": "string",
//   "razorpayPaymentId": "string",
//   "razorpaySignature": "string"
// }

   }
   razorPay (data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`payments/razorpay/order`, data);
// object is like this 
// {
//   "userId": 30,
//   "receipt": "string",
//   "notes": "string"
// "amount":number
// }

   }
    razorPayVerify (data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`payments/razorpay/verify`, data)
      .pipe(
        tap(response => {
          console.warn('razorPayVerify response', response);
          const invoiceUrl =
            response?.invoiceUrl ||
            response?.data?.invoiceUrl ||
            response?.checkout?.data?.invoiceUrl ||
            response?.data?.checkout?.data?.invoiceUrl;

          if (invoiceUrl) {
            // small delay to let calling component finish work (optional)
            setTimeout(() => this.downloadInvoice(invoiceUrl), 150);
          }
        })
      );
// object is like this 
// {
//   "userId": 0,
//   "razorpayOrderId": "string",
//   "razorpayPaymentId": "string",
//   "razorpaySignature": "string",
//   "notes": "string"
// }

// getting res like this 
// {
//     "orderId": "order_SYAfSsprQvzc3U",
//     "paymentId": "pay_SYAfaESSHuKtiX",
//     "status": "PAID",
//     "invoiceUrl": "https://tkd-images.s3.ap-south-1.amazonaws.com/invoices/razorpay/order-order_SYAfSsprQvzc3U-1775033982303.pdf",
//     "checkout": {
//         "data": {
//             "totalVoucherValue": 20000,
//             "totalPayable": 4600,
//             "purchaseCount": 2,
//             "purchases": [
//                 {
//                     "walletItem": {
//                         "id": 138,
//                         "userId": 58,
//                         "voucherId": 390,
//                         "brand": {
//                             "id": 10,
//                             "brandName": "Zara Spain",
//                             "brandProductCode": "ZARA-ES-2026-009",
//                             "brandSku": "ZARA-ES-SKU-09",
//                             "sku": "ZARA-ES-009",
//                             "brandType": "FASHION",
//                             "onboardingType": "MANUAL",
//                             "redemptionType": "ONLINE",
//                             "onlineRedemptionUrl": "https://www.zara.com/es/en/help-center/GiftCard",
//                             "brandImage": "https://static.vecteezy.com/system/resources/previews/024/131/482/non_2x/zara-brand-logo-symbol-clothes-white-design-icon-abstract-illustration-with-black-background-free-vector.jpg",
//                             "epayMinValue": 25,
//                             "epayMaxValue": 1000,
//                             "epayDiscount": 7,
//                             "serviceType": "GIFT_CARD",
//                             "stockAvailable": true,
//                             "description": "Zara Spain digital gift cards usable across Zara stores and online platform in Spain.",
//                             "tnc": "Valid for 24 months from activation date. Cannot be redeemed for cash. Partial redemption allowed.",
//                             "importantInstruction": "Apply the gift card code during checkout or scan the barcode at physical Zara stores.",
//                             "createdAt": "2026-02-28T10:15:00",
//                             "updatedAt": "2026-02-28T15:00:10.125",
//                             "isDeleted": false,
//                             "deletedAt": null
//                         },
//                         "allocationSource": "PURCHASE",
//                         "allocatedAt": "2026-04-01T14:29:42.385",
//                         "expiresAt": "2026-04-25T23:59:59",
//                         "status": "ACTIVE",
//                         "redeemedAt": null,
//                         "isExpired": false,
//                         "isRedeemed": false,
//                         "isDeleted": false,
//                         "deletedAt": null
//                     },
//                     "redemptionLogId": 136,
//                     "monthlyReportId": 9
//                 },
               
//             ],
//             "rewardTransactionId": null,
//             "rewardWalletBalance": 5650,
//             "walletTransactionId": 49
//         },
//         "message": "Cart checkout completed successfully",
//         "success": true
//     }
// }

   }

       debitWallet (data:any,userId:number):Observable<any>{
    return this.http.post<any>(this.baseUrl+`user-reward-wallets/user/${userId}/debit`, data);
// object is like this 
// {
//   "amount": 0,
//   "referenceNo": "string",
//   "notes": "string",
//   "razorpayOrderId": "string",
//   "razorpayPaymentId": "string",
//   "razorpaySignature": "string"
// }

   }



}