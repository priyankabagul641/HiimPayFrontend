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
 updateComponany(id: number, obj: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `companies/${id}`, obj);
  }
 createCompany(obj: any): Observable<any> {
    return this.http.post<any>(this.baseUrl + `companies`, obj);
  }

// COUPOUN DASHBOARD ENDPOINTS

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

 updateCoupoun(id: number, obj: any): Observable<any> {
    return this.http.put<any>(this.baseUrl + `coupons/${id}`, obj);
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
  getAllClientBrands(): Observable<any> {
    return this.http.get<any>(this.baseUrl + `clients/pagention?orderBy=asc&page=0&size=10&sortBy=id`);
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
    return this.http.get<any>(this.baseUrl + `clients/${id}`);
    // expected response shape: { data: { id:5, brandName: 'Amazon', ... }, message:'', success:true }
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
    return this.http.post<any>(this.baseUrl + `vouchers/sync/gyftr`, {});
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




}
