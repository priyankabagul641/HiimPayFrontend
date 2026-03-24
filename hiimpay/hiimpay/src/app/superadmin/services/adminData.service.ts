import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/enviorment.prod';


@Injectable({
  providedIn: 'root'
})
export class AdminDataService {

  baseUrl = environment.baseUrl;
  // baseUrl2 = environment.baseUrl2;
  constructor(private http: HttpClient) { }
//   COMPANY DASHBOARD
  getAllCompanies(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `companies`);
//     getting responce like this
//     {
//   "data": [
//     {
//       "id": 2,
//       "companyName": "NextGen Corporate Solutions Pvt Ltd",
//       "industry": "Corporate Benefits & Rewards",
//       "contactName": "Vikram Desai",
//       "contactEmail": "support@nextgencorp.com",
//       "contactMobile": "9898012345",
//       "status": "ACTIVE",
//       "consultingPhase": "IMPLEMENTATION",
//       "isSharedJourneyMap": true,
//       "isSharedFeedback": false,
//       "createdAt": "2026-02-01T09:00:00",
//       "updatedAt": "2026-02-24T18:50:42.093"
//     },
//     {
//       "id": 3,
//       "companyName": "TechNova Solutions",
//       "industry": "Information Technology",
//       "contactName": "Aditya Kotsthane",
//       "contactEmail": "contact@technova.com",
//       "contactMobile": "9876543210",
//       "status": "ACTIVE",
//       "consultingPhase": "ONBOARDING",
//       "isSharedJourneyMap": true,
//       "isSharedFeedback": false,
//       "createdAt": "2026-02-25T05:02:10.883",
//       "updatedAt": "2026-02-25T10:33:04.833"
//     },
//     {
//       "id": 4,
//       "companyName": "NextGen Corporate Solutions Pvt Ltd",
//       "industry": "Corporate Benefits & Rewards",
//       "contactName": "Vikram Desai",
//       "contactEmail": "support@nextgencorp.com",
//       "contactMobile": "9898012345",
//       "status": "ACTIVE",
//       "consultingPhase": "IMPLEMENTATION",
//       "isSharedJourneyMap": true,
//       "isSharedFeedback": false,
//       "createdAt": "2026-02-01T09:00:00",
//       "updatedAt": "2026-02-25T13:12:20.074"
//     }
//   ],
//   "message": "Companies fetched successfully",
//   "success": true
// }
  }
 getAllTransactions(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `cpoc-wallets/transactions`);
//     getting responce like this
// {
//   "data": [
//     {
//       "transaction": {
//         "id": 1,
//         "wallet": {
//           "id": 1,
//           "cpocUserId": 60,
//           "companyId": 7,
//           "balance": 13333,
//           "createdAt": "2026-03-23T13:49:27.288",
//           "updatedAt": "2026-03-23T13:49:41.319"
//         },
//         "cpocUserId": 60,
//         "companyId": 7,
//         "employeeUserId": null,
//         "transactionType": "CREDIT",
//         "amount": 10000,
//         "balanceAfter": 10000,
//         "referenceNo": "A001",
//         "transactionId": null,
//         "paidVia": null,
//         "status": null,
//         "notes": "gift",
//         "createdAt": "2026-03-23T13:49:27.305"
//       },
//       "companyName": "FinEdge Solutions Pvt Ltd"
//     },
//     {
//       "transaction": {
//         "id": 2,
//         "wallet": {
//           "id": 1,
//           "cpocUserId": 60,
//           "companyId": 7,
//           "balance": 13333,
//           "createdAt": "2026-03-23T13:49:27.288",
//           "updatedAt": "2026-03-23T13:49:41.319"
//         },
//         "cpocUserId": 60,
//         "companyId": 7,
//         "employeeUserId": null,
//         "transactionType": "CREDIT",
//         "amount": 3333,
//         "balanceAfter": 13333,
//         "referenceNo": "A002",
//         "transactionId": null,
//         "paidVia": null,
//         "status": null,
//         "notes": "gift",
//         "createdAt": "2026-03-23T13:49:41.317"
//       },
//       "companyName": "FinEdge Solutions Pvt Ltd"
//     },
//     {
//       "transaction": {
//         "id": 3,
//         "wallet": {
//           "id": 2,
//           "cpocUserId": 77,
//           "companyId": 28,
//           "balance": 5000,
//           "createdAt": "2026-03-23T13:50:42.769",
//           "updatedAt": "2026-03-23T13:50:42.773"
//         },
//         "cpocUserId": 77,
//         "companyId": 28,
//         "employeeUserId": null,
//         "transactionType": "CREDIT",
//         "amount": 5000,
//         "balanceAfter": 5000,
//         "referenceNo": "A0023",
//         "transactionId": null,
//         "paidVia": null,
//         "status": null,
//         "notes": "gift one",
//         "createdAt": "2026-03-23T13:50:42.771"
//       },
//       "companyName": "Tablabs Technologies"
//     },
//     {
//       "transaction": {
//         "id": 4,
//         "wallet": {
//           "id": 3,
//           "cpocUserId": 29,
//           "companyId": 5,
//           "balance": 1000,
//           "createdAt": "2026-03-23T14:07:26.57",
//           "updatedAt": "2026-03-23T14:07:26.58"
//         },
//         "cpocUserId": 29,
//         "companyId": 5,
//         "employeeUserId": null,
//         "transactionType": "CREDIT",
//         "amount": 1000,
//         "balanceAfter": 1000,
//         "referenceNo": "string",
//         "transactionId": null,
//         "paidVia": null,
//         "status": null,
//         "notes": "api check",
//         "createdAt": "2026-03-23T14:07:26.578"
//       },
//       "companyName": "testing data"
//     }
//   ],
//   "message": "CPOC wallet transactions fetched successfully",
//   "success": true
// }
  }
  getAdminTotalbalance(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `cpoc-wallets/total-balance`);
//     getting res like this {
//   "data": {
//     "totalBalance": 19333
//   },
//   "message": "Total CPOC wallet balance fetched successfully",
//   "success": true
// }
  }

  
 updateComponany(id: number, obj: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `companies/${id}`, obj);
  }

   updateBulkUsers(companyId: number, formData: FormData): Observable<any> {
    // Sends an Excel file to the backend to perform bulk user updates for the given company.
    // Backend endpoint expected: POST users/bulk-update?companyId={id}
    return this.http.post<any>(this.baseUrl + `users/bulk-update?companyId=${companyId}`, formData);
  }

 createCompany(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `companies`, obj);
  }

// COUPOUN DASHBOARD ENDPOINTS
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
  getAllCoupouns(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `coupons`);
//     getting responce like this
// {
//     "data": [
//         {
//             "id": 5,
//             "sku": "UNK007-001-0D31-01",
//             "productCode": "0D31",
//             "serialNo": 1,
//             "externalProductId": "0d31d97b-43b0-4804-8810-7533d7c8fdb6",
//             "providerName": "MYHUMBLE",
//             "productName": "0d31d97b-43b0-4804-8810-7533d7c8fdb6",
//             "brand": {
//                 "id": 8,
//                 "brandName": "UNKNOWN BRAND",
//                 "brandProductCode": null,
//                 "brandSku": "UNK007",
//                 "sku": null,
//                 "brandType": null,
//                 "onboardingType": null,
//                 "redemptionType": null,
//                 "onlineRedemptionUrl": null,
//                 "brandImage": null,
//                 "epayMinValue": null,
//                 "epayMaxValue": null,
//                 "epayDiscount": null,
//                 "serviceType": null,
//                 "stockAvailable": null,
//                 "description": null,
//                 "tnc": null,
//                 "importantInstruction": null,
//                 "createdAt": "2026-02-27T16:27:36.028",
//                 "updatedAt": "2026-02-27T16:27:36.028",
//                 "isDeleted": false,
//                 "deletedAt": null
//             },
//             "brandName": "UNKNOWN BRAND",
//             "description": null,
//             "category": {
//                 "id": 1,
//                 "categoryName": "UNCATEGORIZED",
//                 "categoryCode": "001",
//                 "displayOrder": 1,
//                 "isDeleted": null,
//                 "deletedAt": null,
//                 "active": true
//             },
//             "categoryName": "UNCATEGORIZED",
//             "imageUrl": null,
//             "redemptionType": null,
//             "denominations": null,
//             "minValue": null,
//             "maxValue": null,
//             "discountPercent": null,
//             "currencyCode": null,
//             "countryCode": null,
//             "expiryDate": null,
//             "onboardingType": null,
//             "apiType": null,
//             "createdAt": "2026-02-27T16:27:36.062",
//             "updatedAt": "2026-02-27T16:27:36.062",
//             "isDeleted": false,
//             "deletedAt": null,
//             "active": true
//         },
//         {
//             "id": 9,
//             "sku": "WMT-SKU-NEW04",
//             "productCode": "WMT-2026-NEW77",
//             "serialNo": 10088,
//             "externalProductId": "EXT-WMT-NEW02",
//             "providerName": "Walmart API",
//             "productName": "Walmart $500 Voucher",
//             "brand": {
//                 "id": 2,
//                 "brandName": "UrbanStyle Fashion",
//                 "brandProductCode": "USF-GIFT-2026",
//                 "brandSku": "USF-SKU-450",
//                 "sku": "USF-450-IND",
//                 "brandType": "Retail",
//                 "onboardingType": "ONLINE",
//                 "redemptionType": "ONLINE",
//                 "onlineRedemptionUrl": "https://urbanstyle.com/redeem",
//                 "brandImage": "https://example.com/images/urbanstyle-logo.png",
//                 "epayMinValue": 100.0,
//                 "epayMaxValue": 5000.0,
//                 "epayDiscount": 20.0,
//                 "serviceType": "Gift Voucher",
//                 "stockAvailable": true,
//                 "description": "UrbanStyle Fashion gift vouchers valid on all online purchases.",
//                 "tnc": "Valid for one-time use only. Cannot be combined with other promotional codes.",
//                 "importantInstruction": "Apply voucher code at checkout before making payment.",
//                 "createdAt": "2026-02-01T10:00:00",
//                 "updatedAt": "2026-02-24T18:55:26.847",
//                 "isDeleted": null,
//                 "deletedAt": null
//             },
//             "brandName": null,
//             "description": "Walmart digital voucher",
//             "category": null,
//             "categoryName": null,
//             "imageUrl": "https://example.com/walmart.png",
//             "redemptionType": "ONLINE",
//             "denominations": "50,100,200,500",
//             "minValue": 50.00,
//             "maxValue": 5000.00,
//             "discountPercent": 10.00,
//             "currencyCode": "USD",
//             "countryCode": "US",
//             "expiryDate": "2027-02-27",
//             "onboardingType": null,
//             "apiType": null,
//             "createdAt": "2026-02-27T17:17:58.116",
//             "updatedAt": "2026-02-27T17:17:58.116",
//             "isDeleted": false,
//             "deletedAt": null,
//             "active": true
//         },]}



  }
  getCoupounById(Id: number) {
    return this.http.get<any>(this.baseUrl + `coupons/${Id}`);
  }
   getwalletById(Id: number) {
    return this.http.get<any>(this.baseUrl + `cpoc-wallets/user/${Id}`);
  }

   getCategoryByCoupounId(Id: number) {
    return this.http.get<any>(this.baseUrl + `brands/${Id}/vouchers-by-category`);
//     getting responce like this
//     {
//   "data": {
//     "Fashion": [
//       {
//         "id": 35,
//         "sku": "ZARA-ES-GC-100",
//         "productName": "Zara Spain Gift Card €100",
//         "providerName": "MANUAL_UPLOAD",
//         "minValue": 25,
//         "maxValue": 1000,
//         "discountPercent": 7,
//         "status": "Active",
//         "categoryId": 2,
//         "categoryName": "Fashion"
//       }
//     ],
//     "Uncategorized": [
//       {
//         "id": 36,
//         "sku": "ZARA-ES-GC-101",
//         "productName": "Zara Spain Gift Card €100",
//         "providerName": "MANUAL_UPLOAD",
//         "minValue": 25,
//         "maxValue": 1000,
//         "discountPercent": 7,
//         "status": "Active",
//         "categoryId": 2,
//         "categoryName": null
//       }
//     ],
//     "Groceries": [
//       {
//         "id": 37,
//         "sku": "ZARA-ES-GC-1004",
//         "productName": "Zara Spain Gift Card €100",
//         "providerName": "MANUAL_UPLOAD",
//         "minValue": 25,
//         "maxValue": 1000,
//         "discountPercent": 7,
//         "status": "Active",
//         "categoryId": 5,
//         "categoryName": "Groceries"
//       }
//     ]
//   },
//   "message": "Brand vouchers grouped by category fetched successfully",
//   "success": true
// }
  }

 updateCoupoun(id: number, obj: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `coupons/${id}`, obj);
  }

  updateManageAdminAcess(id: number, obj: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `admin-access/${id}`, obj);
    // obj should like this
//     {
//   "permissionKeys": [
//     "string"
//   ]
// }
  }

  getManageAdminAcess(id: number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `admin-access/${id}`);
// Response body
// {
//   "data": [
//     "dashboard",
//     "brands",
//     "coupons"
//   ],
//   "message": "Admin access fetched successfully",
//   "success": true
// }
  }

 createCoupoun(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `coupons`, obj);
    // obj is like this
// {
//   "productCode": "BR5-2026-004",
//   "sku": "BR5-SKU-004",
//   "serialNo": 20003,
//   "externalProductId": "EXT-BR5-004",
//   "providerName": "Brand5 API",
//   "productName": "Brand5 $750 Voucher",
//   "brand": {
//     "id": 5
//   },
//   "category": {
//     "id": 3
//   },
//   "description": "Brand5 digital voucher - Category 3",
//   "imageUrl": "https://example.com/brand5-750.png",
//   "discountPercent": 12,
//   "minValue": 300,
//   "maxValue": 7500,
//   "redemptionType": "ONLINE",
//   "denominations": "300,750,1500",
//   "currencyCode": "USD",
//   "countryCode": "US",
//   "expiryDate": "2027-12-31T23:59:59",
//   "active": true
// }
  }

 deleteCoupoun(id: any) {
    return this.http.put<any>(this.baseUrl + `coupon-products/${id}/soft-delete`,{});
  }

  // BRANDS

 createBrand(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `brands`, obj);
  }


  getAllBrands(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `brands`);
    // expected response shape:
    // { data: [ { id: 5, brandName: 'Amazon', brandSku: 'AMA004', onlineRedemptionUrl: 'https://amazon.in', brandImage: 'https://...', stockAvailable: true, categories: ['Lifestyle','Electronics'], description: '...' } ], message: '', success: true }
  }

  getBrandById(id: string | number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `brands/${id}`);
    // expected response shape: { data: { id:5, brandName: 'Amazon', ... }, message:'', success:true }
  }

   //Client BRANDS
  getAllClientBrands(page: number = 0, size: number = 10, orderBy: string = 'asc', sortBy: string = 'id'): Observable<any> {
    const params = `orderBy=${orderBy}&page=${page}&size=${size}&sortBy=${sortBy}`;
    return this.http.get<any>(this.baseUrl + `clients/pagention?` + params);
    // response :
// {
//   "data": {
//     "content": [
//       {
//         "id": 2,
//         "companyName": "technical stack",
//         "industry": "IT",
//         "contactName": "Tech solu",
//         "contactEmail": "test@yopmail.com",
//         "contactEmail2": null,
//         "contactMobile": "9874563412",
//         "contactMobile2": null,
//         "status": "active",
//         "consultingPhase": "string",
//         "isSharedJourneyMap": true,
//         "isSharedFeedback": true,
//         "createdAt": null,
//         "updatedAt": "2026-02-25T15:09:58.036"
//       },
//       {
//         "id": 3,
//         "companyName": "TechNova Solution",
//         "industry": "Information Technology",
//         "contactName": "Aditya Kotsthane",
//         "contactEmail": "contact@technova.com",
//         "contactEmail2": null,
//         "contactMobile": "9876543210",
//         "contactMobile2": null,
//         "status": "ACTIVE",
//         "consultingPhase": "ONBOARDING",
//         "isSharedJourneyMap": true,
//         "isSharedFeedback": true,
//         "createdAt": null,
//         "updatedAt": "2026-02-25T15:14:58.285"
//       },
//       {
//         "id": 4,
//         "companyName": "NextGen Corporate Solutions Pvt Ltd",
//         "industry": "Corporate Benefits & Rewards",
//         "contactName": "Vikram Desai",
//         "contactEmail": "support@nextgencorp.com",
//         "contactEmail2": null,
//         "contactMobile": "9898012345",
//         "contactMobile2": null,
//         "status": "ACTIVE",
//         "consultingPhase": "IMPLEMENTATION",
//         "isSharedJourneyMap": true,
//         "isSharedFeedback": false,
//         "createdAt": "2026-02-01T09:00:00",
//         "updatedAt": "2026-02-25T13:12:20.074"
//       }
//     ],
//     "pageable": {
//       "sort": {
//         "sorted": true,
//         "unsorted": false,
//         "empty": false
//       },
//       "pageNumber": 0,
//       "pageSize": 10,
//       "offset": 0,
//       "paged": true,
//       "unpaged": false
//     },
//     "last": true,
//     "totalPages": 1,
//     "totalElements": 3,
//     "numberOfElements": 3,
//     "first": true,
//     "sort": {
//       "sorted": true,
//       "unsorted": false,
//       "empty": false
//     },
//     "size": 10,
//     "number": 0,
//     "empty": false
//   },
//   "message": "Clients fetched successfully",
//   "success": true
// }
  }

  getClientBrandById(id: string | number): Observable<any> {
    return this.http.get<any>(this.baseUrl + `brands/${id}`);
    // expected response shape:
    //  {
//     "data": {
//         "id": 10,
//         "brandName": "Zara Spain",
//         "brandProductCode": "ZARA-ES-2026-009",
//         "brandSku": "ZARA-ES-SKU-09",
//         "sku": "ZARA-ES-009",
//         "brandType": "FASHION",
//         "onboardingType": "MANUAL",
//         "redemptionType": "ONLINE",
//         "onlineRedemptionUrl": "https://www.zara.com/es/en/help-center/GiftCard",
//         "brandImage": "https://example.com/images/brands/zara-spain.png",
//         "epayMinValue": 25.0,
//         "epayMaxValue": 1000.0,
//         "epayDiscount": 7.0,
//         "serviceType": "GIFT_CARD",
//         "stockAvailable": true,
//         "description": "Zara Spain digital gift cards usable across Zara stores and online platform in Spain.",
//         "tnc": "Valid for 24 months from activation date. Cannot be redeemed for cash. Partial redemption allowed.",
//         "importantInstruction": "Apply the gift card code during checkout or scan the barcode at physical Zara stores.",
//         "createdAt": "2026-02-28T10:15:00",
//         "updatedAt": "2026-02-28T14:18:46.251",
//         "isDeleted": false,
//         "deletedAt": null
//     },
//     "message": "Brand fetched successfully",
//     "success": true
// }
  }

    getapi(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `api-integrations`);
    // expected response  api-integrations
// {
//   "data": [
//     {
//       "endpoints": [
//         {
//           "id": 1,
//           "integration": {
//             "id": 1,
//             "providerName": "Xoxoday",
//             "profileName": "Xoxoday Production Profile",
//             "description": "Integration profile for Xoxoday voucher APIs used for voucher issuance and balance check.",
//             "createdAt": "2026-02-27T16:13:43.073",
//             "updatedAt": "2026-02-27T16:13:43.073"
//           },
//           "endpointType": "ISSUE_VOUCHER",
//           "endpointName": "Issue Voucher API",
//           "method": "POST",
//           "url": "https://api.xoxoday.com/v1/vouchers/issue",
//           "apiKey": "XOXO_PROD_API_KEY_12345",
//           "requestSecret": "XOXO_PROD_SECRET_67890",
//           "sampleRequest": "{ \"sku\": \"WMT-SKU-1001\", \"amount\": 500, \"recipient\": { \"name\": \"John Doe\", \"email\": \"john@example.com\" } }",
//           "createdAt": "2026-02-27T16:13:43.097",
//           "updatedAt": "2026-02-27T16:13:43.097"
//         },
//         {
//           "id": 2,
//           "integration": {
//             "id": 1,
//             "providerName": "Xoxoday",
//             "profileName": "Xoxoday Production Profile",
//             "description": "Integration profile for Xoxoday voucher APIs used for voucher issuance and balance check.",
//             "createdAt": "2026-02-27T16:13:43.073",
//             "updatedAt": "2026-02-27T16:13:43.073"
//           },
//           "endpointType": "CHECK_BALANCE",
//           "endpointName": "Check Voucher Balance API",
//           "method": "GET",
//           "url": "https://api.xoxoday.com/v1/vouchers/balance/{voucherCode}",
//           "apiKey": "XOXO_PROD_API_KEY_12345",
//           "requestSecret": "XOXO_PROD_SECRET_67890",
//           "sampleRequest": "{ \"voucherCode\": \"ABC123XYZ\" }",
//           "createdAt": "2026-02-27T16:13:43.1",
//           "updatedAt": "2026-02-27T16:13:43.1"
//         },]}
  }

   createData(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `api-integrations`, obj);
//     OBJ SHOULD BE LOOK LIKE THIS 
//     {
//   "providerName": "string",
//   "profileName": "string",
//   "description": "string",
//   "endpoints": [
//     {
//       "endpointType": "string",
//       "endpointName": "string",
//       "method": "string",
//       "url": "string",
//       "apiKey": "string",
//       "requestSecret": "string",
//       "sampleRequest": "string"
//     }
//   ]
// }
  }

   createxoxoday(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `vouchers/sync/gyftr`, {});
  }

   createmyhumble(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `vouchers/sync/myhumble`, {});

  }

   creategyftr(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `vouchers/gyftr/full`, {});
  }

   createsiripay(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `vouchers/pull/SiriPay`, {});
  }

  getAllBrand(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `brands`);
//     getting Response:
// {
//   "data": [
//     {
//       "id": 7,
//       "brandName": "string",
//       "brandProductCode": "string",
//       "brandSku": "string",
//       "sku": "string",
//       "brandType": "string",
//       "onboardingType": "string",
//       "redemptionType": "string",
//       "onlineRedemptionUrl": "string",
//       "brandImage": "string",
//       "epayMinValue": 0,
//       "epayMaxValue": 0,
//       "epayDiscount": 0,
//       "serviceType": "string",
//       "stockAvailable": true,
//       "description": "string",
//       "tnc": "string",
//       "importantInstruction": "string",
//       "createdAt": "2026-02-27T07:03:23.718",
//       "updatedAt": "2026-02-27T12:33:25.25",
//       "isDeleted": false,
//       "deletedAt": null
//     },]}

  }

  getAllCategory(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `brand-categories`);
// {
//   "data": [
//     {
//       "id": 2,
//       "categoryName": "Electronics",
//       "categoryCode": "ELEC01",
//       "displayOrder": 1,
//       "isDeleted": false,
//       "deletedAt": null,
//       "active": true
//     },

//   ],
//   "message": "Categories fetched successfully",
//   "success": true
// }

  }

  getAllAdmin(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `users/filter?userType=ADMIN&status=active`);
    // expected response shape:
//   {
//   "data": [
//     {
//       "id": 40,
//       "fullName": "System Administrator",
//       "email": "admin@admin.com",
//       "mobile": null,
//       "passwordHash": "$2a$10$AdminHashedPasswordExample123456",
//       "userType": "ADMIN",
//       "status": "ACTIVE",
//       "companyId": null,
//       "otp": null,
//       "lastLoginAt": null,
//       "createdAt": "2026-02-27T18:32:59.803",
//       "updatedAt": "2026-02-27T18:32:59.803",
//       "isDeleted": false,
//       "deletedAt": null
//     }
//   ],
//   "message": "Users fetched successfully",
//   "success": true
// }
  }

     createAdmin(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `/users/createAdmin`, obj);
    //obj should be like this
//     {
//   "fullName": "System Administrator",
//   "email": "admin@admin.com",
//   "passwordHash": "$2a$10$AdminHashedPasswordExample123456",
//   "userType": "ADMIN",
//   "status": "ACTIVE"
// }
  }

       updateAdmin(obj: any,id:any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `users/admin`, obj);
    //obj should be like this
//     {
//   "fullName": "System Administrator",
//   "email": "admin@admin.com",
//   "passwordHash": "$2a$10$AdminHashedPasswordExample123456",
//   "userType": "ADMIN",
//   "status": "ACTIVE"
// }
  }


assignbrnadsToCompany(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `companies/multiAssign-BrandsCompanies`, obj);
  }

uploadImg(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `files/upload`, obj);
//   getting reslike this :
//   {
//   "data": "https://tkd-images.s3.ap-south-1.amazonaws.com/1773748704247-AccuWeather.ico",
//   "message": "File uploaded successfully",
//   "success": true
// }
  
  }


}
