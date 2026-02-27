import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environment/enviorment.prod';


@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  baseUrl = environment.baseUrl;
  baseUrl2 = environment.baseUrl2;
  private directHttp: HttpClient;

  // excelFormatDownloadUrl = environment.excelFormatFileUrl;
  excelFormatDownloadUrlForPeopleMatrix = environment.excelFileFormatUrlForPeopleMatrix;
  constructor(private http: HttpClient, private httpBackend: HttpBackend) {
    this.directHttp = new HttpClient(httpBackend);
  }

  clientByCompanyID(id: any) {
    return this.http.get<any>(this.baseUrl + `users/active-by-company?companyId=${id}`);
//     getting responce like this
//     {
//   "data": [
//     {
//       "id": 19,
//       "fullName": "Aditya",
//       "email": "adia@gmail.com",
//       "mobile": "9876543299",
//       "passwordHash": "string",
//       "userType": "ADMIN",
//       "status": "ACTIVE",
//       "companyId": 3,
//       "otp": null,
//       "lastLoginAt": "2026-02-26T23:21:53.743",
//       "createdAt": "2026-02-25T10:38:35.396",
//       "updatedAt": "2026-02-26T23:21:53.744"
//     },
//     {
//       "id": 22,
//       "fullName": "Michael Anderson",
//       "email": "michael.anderson@brightwavecorp.com",
//       "mobile": "4157283945",
//       "passwordHash": "Michael@2026!",
//       "userType": "MANAGER",
//       "status": "ACTIVE",
//       "companyId": 3,
//       "otp": null,
//       "lastLoginAt": null,
//       "createdAt": "2026-02-25T11:19:39.961",
//       "updatedAt": "2026-02-25T11:19:39.961"
//     },

//   ],
//   "message": "Active users fetched successfully",
//   "success": true
// }
  }

  createUser(obj: any) {
    return this.http.post<any>(this.baseUrl + `users`, obj)
//     passing obj like this 
//     {
//   "id": 0,
//   "fullName": "string",
//   "email": "string",
//   "mobile": "string",
//   "passwordHash": "string",
//   "userType": "string",
//   "status": "string",
//   "companyId": 0,
//   "otp": 0,
//   "lastLoginAt": "2026-02-27T05:05:51.544Z",
//   "createdAt": "2026-02-27T05:05:51.544Z",
//   "updatedAt": "2026-02-27T05:05:51.544Z"
// }
  }

  updateUser(id: any, obj: any) {
    return this.http.put<any>(this.baseUrl + `users/${id}`, obj);
  }

  getUserById(id: any) {
    return this.http.get<any>(this.baseUrl + `users/${id}`);
  }


  getExcelFileUrl(): Observable<{ message: string, url: string }> {
    return this.http.get<{ message: string, url: string }>(this.baseUrl + 'userUploadTemplate');
  }

  downloadExcelFile(url: string): Observable<Blob> {
    return this.directHttp.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders()
    });
  }

   clientBrandByCompanyID(id: any) {
    return this.http.get<any>(this.baseUrl + `assignments/brand-coupon/FilterBrandsByComponyId?companyId=${id}`);
//     getting responce like this

  }

  BrandByID(id: any) {
    return this.http.get<any>(this.baseUrl + `brands/${id}`);
//     getting responce like this

  }

 CompanyDATA(id: any) {
    return this.http.get<any>(this.baseUrl + `companies/${id}`);
//     getting responce like this
// {
//   "data": {
//     "id": 5,
//     "companyName": "testing data",
//     "industry": "it",
//     "contactName": "tester",
//     "contactEmail": "tester@yopmail.com",
//     "contactEmail2": "string",
//     "contactMobile": "8745963210",
//     "contactMobile2": "string",
//     "status": "true",
//     "updatedAt": "2026-02-26T14:58:54.483"
//   },
//   "message": "Company fetched successfully",
//   "success": true
// }
  }

  brandsByCompanyID(id: any) {
    return this.http.get<any>(this.baseUrl + `companies/${id}/brands`);
//     getting responce like this
// {
//   "data": [
//     {
//       "id": 2,
//       "brandName": "UrbanStyle Fashion",
//       "brandProductCode": "USF-GIFT-2026",
//       "brandSku": "USF-SKU-450",
//       "sku": "USF-450-IND",
//       "brandType": "Retail",
//       "onboardingType": "ONLINE",
//       "redemptionType": "ONLINE",
//       "onlineRedemptionUrl": "https://urbanstyle.com/redeem",
//       "brandImage": "https://example.com/images/urbanstyle-logo.png",
//       "epayMinValue": 100,
//       "epayMaxValue": 5000,
//       "epayDiscount": 20,
//       "serviceType": "Gift Voucher",
//       "stockAvailable": true,
//       "description": "UrbanStyle Fashion gift vouchers valid on all online purchases.",
//       "tnc": "Valid for one-time use only. Cannot be combined with other promotional codes.",
//       "importantInstruction": "Apply voucher code at checkout before making payment.",
//       "createdAt": "2026-02-01T10:00:00",
//       "updatedAt": "2026-02-24T18:55:26.847"
//     },
//     {
//       "id": 3,
//       "brandName": "Amazon",
//       "brandProductCode": "AMZ-2026-001",
//       "brandSku": "AMA002",
//       "sku": "AMZSKU001",
//       "brandType": "E-COMMERCE",
//       "onboardingType": "API",
//       "redemptionType": "ONLINE",
//       "onlineRedemptionUrl": "https://www.amazon.in/redeem",
//       "brandImage": "https://example.com/images/brands/amazon.png",
//       "epayMinValue": 100,
//       "epayMaxValue": 10000,
//       "epayDiscount": 5,
//       "serviceType": "GIFT_CARD",
//       "stockAvailable": true,
//       "description": "Amazon gift cards usable across all categories.",
//       "tnc": "Valid for 12 months from date of issue. Cannot be redeemed for cash.",
//       "importantInstruction": "Use the code at checkout to apply balance.",
//       "createdAt": "2026-02-25T12:00:00",
//       "updatedAt": "2026-02-25T10:50:25.991"
//     }
//   ],
//   "message": "Brands fetched successfully",
//   "success": true
// }
  }

   CoupounDataByBrandID(id: any) {
    return this.http.get<any>(this.baseUrl + `brands/${id}/coupons`);
//     getting responce like this
// {
//   "data": [
//     {
//       "id": 3,
//       "sku": "WMT-SKU-NEW02",
//       "productCode": "WMT-2026-NEW02",
//       "serialNo": 10001,
//       "externalProductId": "EXT-WMT-NEW02",
//       "providerName": "Walmart API",
//       "productName": "Walmart $500 Voucher",
//       "brand": {
//         "id": 2,
//         "brandName": "UrbanStyle Fashion",
//         "brandProductCode": "USF-GIFT-2026",
//         "brandSku": "USF-SKU-450",
//         "sku": "USF-450-IND",
//         "brandType": "Retail",
//         "onboardingType": "ONLINE",
//         "redemptionType": "ONLINE",
//         "onlineRedemptionUrl": "https://urbanstyle.com/redeem",
//         "brandImage": "https://example.com/images/urbanstyle-logo.png",
//         "epayMinValue": 100,
//         "epayMaxValue": 5000,
//         "epayDiscount": 20,
//         "serviceType": "Gift Voucher",
//         "stockAvailable": true,
//         "description": "UrbanStyle Fashion gift vouchers valid on all online purchases.",
//         "tnc": "Valid for one-time use only. Cannot be combined with other promotional codes.",
//         "importantInstruction": "Apply voucher code at checkout before making payment.",
//         "createdAt": "2026-02-01T10:00:00",
//         "updatedAt": "2026-02-24T18:55:26.847",
//         "isDeleted": null,
//         "deletedAt": null
//       },
//       "brandName": null,
//       "description": "Walmart digital voucher",
//       "category": null,
//       "categoryName": null,
//       "imageUrl": "https://example.com/walmart.png",
//       "redemptionType": "ONLINE",
//       "denominations": "50,100,200,500",
//       "minValue": 50,
//       "maxValue": 5000,
//       "discountPercent": 10,
//       "currencyCode": "USD",
//       "countryCode": "US",
//       "expiryDate": "2027-02-27",
//       "createdAt": "2026-02-27T09:29:22.412",
//       "updatedAt": "2026-02-27T09:29:22.412",
//       "isDeleted": null,
//       "deletedAt": null,
//       "active": true
//     },
//     {
//       "id": 4,
//       "sku": "WMT-SKU-NEW03",
//       "productCode": "WMT-2026-NEW05",
//       "serialNo": 10002,
//       "externalProductId": "EXT-WMT-NEW02",
//       "providerName": "Walmart API",
//       "productName": "Walmart $500 Voucher",
//       "brand": {
//         "id": 2,
//         "brandName": "UrbanStyle Fashion",
//         "brandProductCode": "USF-GIFT-2026",
//         "brandSku": "USF-SKU-450",
//         "sku": "USF-450-IND",
//         "brandType": "Retail",
//         "onboardingType": "ONLINE",
//         "redemptionType": "ONLINE",
//         "onlineRedemptionUrl": "https://urbanstyle.com/redeem",
//         "brandImage": "https://example.com/images/urbanstyle-logo.png",
//         "epayMinValue": 100,
//         "epayMaxValue": 5000,
//         "epayDiscount": 20,
//         "serviceType": "Gift Voucher",
//         "stockAvailable": true,
//         "description": "UrbanStyle Fashion gift vouchers valid on all online purchases.",
//         "tnc": "Valid for one-time use only. Cannot be combined with other promotional codes.",
//         "importantInstruction": "Apply voucher code at checkout before making payment.",
//         "createdAt": "2026-02-01T10:00:00",
//         "updatedAt": "2026-02-24T18:55:26.847",
//         "isDeleted": null,
//         "deletedAt": null
//       },
//       "brandName": null,
//       "description": "Walmart digital voucher",
//       "category": null,
//       "categoryName": null,
//       "imageUrl": "https://example.com/walmart.png",
//       "redemptionType": "ONLINE",
//       "denominations": "50,100,200,500",
//       "minValue": 50,
//       "maxValue": 5000,
//       "discountPercent": 10,
//       "currencyCode": "USD",
//       "countryCode": "US",
//       "expiryDate": "2027-02-27",
//       "createdAt": "2026-02-27T09:29:50.346",
//       "updatedAt": "2026-02-27T09:29:50.346",
//       "isDeleted": null,
//       "deletedAt": null,
//       "active": true
//     }
//   ],
//   "message": "Brand vouchers fetched successfully",
//   "success": true
// }
  }

  
}