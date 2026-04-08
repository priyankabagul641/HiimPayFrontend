import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/environment';
import { Voucher } from '../models/voucher.model';

@Injectable({
  providedIn: 'root'
})
export class PublicVoucherService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getVouchers(params?: {
    page?: number;
    size?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Observable<any> {
    let httpParams = new HttpParams();
    if (params?.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params?.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.minPrice !== undefined) httpParams = httpParams.set('minPrice', params.minPrice.toString());
    if (params?.maxPrice !== undefined) httpParams = httpParams.set('maxPrice', params.maxPrice.toString());

    return this.http.get(`${this.baseUrl}public/vouchers`, { params: httpParams });
  }

  getVoucherById(id: number): Observable<Voucher> {
    return this.http.get<Voucher>(`${this.baseUrl}public/vouchers/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}public/vouchers/categories`);
  }

  getBrands(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}public/vouchers/brands`);
  }

  guestCheckout(data: {
    items: any[];
    guest: { name: string; email: string; mobile: string };
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}public/checkout`, data);
  }

  createRazorpayOrder(data: { amount: number; currency: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}payments/razorpay/order`, data);
  }

  verifyRazorpayPayment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}payments/razorpay/verify`, data);
  }
}
