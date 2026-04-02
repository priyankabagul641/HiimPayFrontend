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

  downloadOnboardUsertemplate(): Observable<any> {
    return this.http.get(this.baseUrl + 'users/upload/employee-template' );
//     getting responce like this
// {
//   "data": "https://tkd-images.s3.ap-south-1.amazonaws.com/1772088325032-employee_upload_template.xlsx",
//   "message": "Employee template fetched successfully",
//   "success": true
// }
  }

    addEmployeeWithExcel(formData: FormData, companyId: any) {
    return this.http.post<any>(this.baseUrl + `users/upload?companyId=${companyId}`, formData);

  }

    getDownloadFileUrl(): Observable<{ message: string, url: string }> {
    return this.http.get<{ message: string, url: string }>(this.baseUrl + 'user-reward-wallets/assign/template');
  }

  updateUser(id: any, obj: any) {
    return this.http.put<any>(this.baseUrl + `users/${id}`, obj);
  }

  getUserById(id: any) {
    return this.http.get<any>(this.baseUrl + `users/${id}`);
  }

  deleteUserByID(id: number, payload: any = {}): Observable<any> {
    return this.http.put<any>(this.baseUrl + `users/${id}/soft-delete`, payload);
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



 getWalletById(id: any) {
    return this.http.get<any>(this.baseUrl + `cpoc-wallets/transactions/user/${id}`);
//   {
//   "data": [
//     {
//       "id": 4,
//       "wallet": {
//         "id": 3,
//         "cpocUserId": 29,
//         "companyId": 5,
//         "balance": 1000,
//         "createdAt": "2026-03-23T14:07:26.57",
//         "updatedAt": "2026-03-23T14:07:26.58"
//       },
//       "cpocUserId": 29,
//       "companyId": 5,
//       "employeeUserId": null,
//       "transactionType": "CREDIT",
//       "amount": 1000,
//       "balanceAfter": 1000,
//       "referenceNo": "string",
//       "notes": "api check",
//       "createdAt": "2026-03-23T14:07:26.578"
//     }
//   ],
//   "message": "CPOC wallet transactions fetched successfully",
//   "success": true
// }
  
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

  ASsignBrandToCompany(obj: any) {    
    return this.http.post<any>(this.baseUrl + `user-reward-wallets/assign`, obj)
//     here is the obj format
//     {
//   "userIds": [
//     0   user is pass
//   ],
//   "amount": 0,
//   "referenceNo": "string", 
//   "notes": "string",
//   "companyId": 0, get comapny id from session storage
//   "assignedByUserId": 0, get currentLoggedInUserData id from session storage
//   "mode": "Manual", always manual
//   "fileUrl": "string"
// }
  }
  
   assignRewardsByCompanyID(id: any) {
    return this.http.get<any>(this.baseUrl + `assignments/reward-amount?companyId=${id}`);
//     getting responce like this

//   "data": [
//   {
//             "assignment": {
//                 "id": 11,
//                 "company": {
//                     "id": 5,
//                     "companyName": "testing data",
//                     "industry": "it",
//                     "contactName": "tester",
//                     "contactEmail": "tester@yopmail.com",
//                     "contactEmail2": "string",
//                     "contactMobile": "8745963210",
//                     "contactMobile2": "string",
//                     "status": "true",
//                     "updatedAt": "2026-02-26T14:58:54.483",
//                     "isDeleted": null,
//                     "deletedAt": null
//                 },
//                 "assignedBy": {
//                     "id": 37,
//                     "fullName": "Rohan gku",
//                     "email": "rohansf@examplemail.com",
//                     "mobile": "9878989211",
//                     "passwordHash": "$2a$10$XyZExampleHashedPassword987654321",
//                     "userType": "COPC",
//                     "status": "ACTIVE",
//                     "companyId": 5,
//                     "otp": 458921,
//                     "lastLoginAt": "2026-02-26T18:30:15",
//                     "createdAt": "2026-02-20T10:15:00",
//                     "updatedAt": "2026-02-27T11:21:26.171",
//                     "isDeleted": null,
//                     "deletedAt": null
//                 },
//                 "assignedDate": "2026-02-27T12:19:43.991",
//                 "mode": "MANUAL",
//                 "amount": 1000,
//                 "notes": "Monthly performance reward",
//                 "fileUrl": null,
//                 "createdAt": "2026-02-27T12:19:43.991"
//             },
//             "employeeCount": 2
//         },

//   ],
//   "message": "Assignments fetched successfully",
//   "success": true

  }

  assignExcelDowloadByCompanyID(id: any) {
    return this.http.get(this.baseUrl + `assignments/reward-amount/${id}/download`, { responseType: 'blob' });
  }

  addDataWithExcel(obj: any) {
    return this.http.post<any>(this.baseUrl + 'user-reward-wallets/assign/excel', obj);
  }

  excelTemplate (){
    return this.http.get(this.baseUrl + 'user-reward-wallets/assign/template', { responseType: 'blob' });
  }

     createWallet(obj:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`payments/razorpay/wallet/order`, obj);
// object is like this 
// {
//   "userId": 0,
//   "amount": 0,
//   "walletType": "string",
//   "receipt": "string",
//   "notes": "string"
// }
   }

   razorPayWalletRes(data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`cpoc-wallets/credit`, data);
// object is like this 
// {
//   "cpocUserId": 0,
//   "amount": 0,
//   "referenceNo": "string",
//   "notes": "string",
//   "razorpayOrderId": "string",
//   "razorpayPaymentId": "string",
//   "razorpaySignature": "string"
// }
  }

  getUserWalletById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`cpoc-wallets/transactions/user/${id}`);
//     getting responce like this{
// {
//   "data": [
//     {
//       "id": 19,
//       "wallet": {
//         "id": 3,
//         "cpocUserId": 29,
//         "companyId": 5,
//         "balance": 13090,
//         "createdAt": "2026-03-23T14:07:26.57",
//         "updatedAt": "2026-03-31T16:50:48.994"
//       },
//       "cpocUserId": 29,
//       "companyId": 5,
//       "employeeUserId": null,
//       "transactionType": "CREDIT",
//       "amount": 280,
//       "balanceAfter": 13090,
//       "referenceNo": "pay_SXoXWj4iGzyprr",
//       "transactionId": "pay_SXoXWj4iGzyprr",
//       "paidVia": "CPOC_WALLET",
//       "status": "SUCCESS",
//       "notes": "TESTTER",
//       "invoiceUrl": null,
//       "createdAt": "2026-03-31T16:50:48.991"
//     }]}


  }

  clientBrandByCompanyID(id: any) {
    return this.http.get<any>(this.baseUrl + `assignments/brand-coupon/FilterBrandsByComponyId?companyId=${id}`);
//     getting responce like this

  }

  BrandByID(id: any) {
    return this.http.get<any>(this.baseUrl + `brands/${id}`);
//     getting responce like this

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

//   ],
//   "message": "Brands fetched successfully",
//   "success": true
// }
  }

purchaseCoupounsByCpoc(obj:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`payments/razorpay/wallet/order`, obj);
// Request body:

// {
//   "cpocUserId": 123,
//   "voucherId": 456,
//   "quantity": 10,
//   "amount": 250,
//   "referenceNo": "REF-001",
//   "notes": "April stock"
// }
// Success response (sample):

// {
//   "success": true,
//   "message": "Coupons purchased successfully",
//   "data": {
//     "stock": {
//       "cpocUserId": 123,
//       "voucherId": 456,
//       "purchasedQuantity": 10,
//       "availableQuantity": 10
//     },
//     "walletBalance": 5000,
//     "transactionId": 999
//   }
// }
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

   getCpocCouponById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`companies/${id}/coupons`);
// {
//     "data": [
//         {
//             "id": 25,
//             "sku": "BR5-SKU-001",
//             "productCode": "BR5-2026-001",
//             "serialNo": 20001,
//             "externalProductId": "EXT-BR5-001",
//             "providerName": "Brand5 API",
//             "productName": "Brand5 $250 Voucher",
//             "brand": {
//                 "id": 5,
//                 "brandName": "Amazon",
//                 "brandProductCode": "AMZ1001",
//                 "brandSku": "AMA004",
//                 "sku": null,
//                 "brandType": "GIFT_CARD",
//                 "onboardingType": "API",
//                 "redemptionType": "ONLINE",
//                 "onlineRedemptionUrl": "https://amazon.in/redeem",
//                 "brandImage": "https://example.com/amazon.png",
//                 "epayMinValue": 100.0,
//                 "epayMaxValue": 10000.0,
//                 "epayDiscount": 5.0,
//                 "serviceType": "E-VOUCHER",
//                 "stockAvailable": true,
//                 "description": "Amazon Gift Voucher usable for shopping.",   
//                 "tnc": "Valid for 12 months from issue date.",
//                 "importantInstruction": "Do not share voucher code with anyone.",
//                 "createdAt": "2026-02-25T14:46:24.71",
//                 "updatedAt": "2026-02-25T14:46:24.71",
//                 "isDeleted": null,
//                 "deletedAt": null
//             },
//             "brandName": null,
//             "description": "Brand5 digital voucher - Category 1",
//             "category": {
//                 "id": 1,
//                 "categoryName": "UNCATEGORIZED",
//                 "categoryCode": "001",
//                 "displayOrder": 1,
//                 "isDeleted": null,
//                 "deletedAt": null,
//                 "active": true
//             },
//             "categoryName": null,
//             "imageUrl": "https://example.com/brand5-250.png",
//             "redemptionType": "ONLINE",
//             "denominations": "100,250,500",
//             "minValue": 100.00,
//             "maxValue": 2500.00,
//             "discountPercent": 8.00,
//             "currencyCode": "USD",
//             "countryCode": "US",
//             "expiryDate": "2027-12-31",
//             "onboardingType": null,
//             "apiType": null,
//             "createdAt": "2026-02-27T17:33:15.346",
//             "updatedAt": "2026-02-27T17:33:15.346",
//             "isDeleted": false,
//             "deletedAt": null,
//             "active": true
//         },
  // ]
// }
  }

  

}