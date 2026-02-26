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
// {"data":[{"id":14,"couponCode":"AMZ50OFH","externalProductId":"EXT-AMZ-5002","providerName":"Amazon","couponName":"Amazon 50% Discount","brand":{"id":5,"brandName":"Amazon","brandProductCode":"AMZ1001","brandSku":"AMA004","sku":null,"brandType":"GIFT_CARD","onboardingType":"API","redemptionType":"ONLINE","onlineRedemptionUrl":"https://amazon.in/redeem","brandImage":"https://example.com/amazon.png","epayMinValue":100.0,"epayMaxValue":10000.0,"epayDiscount":5.0,"serviceType":"E-VOUCHER","stockAvailable":true,"description":"Amazon Gift Voucher usable for shopping.","tnc":"Valid for 12 months from issue date.","importantInstruction":"Do not share voucher code with anyone.","createdAt":"2026-02-25T14:46:24.71","updatedAt":"2026-02-25T14:46:24.71","hibernateLazyInitializer"}}]}
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
//   "id": 0,
//   "couponCode": "string",
//   "externalProductId": "string",
//   "providerName": "string",
//   "couponName": "string",
//   "brand": {
//     "id": 0,
//     "brandName": "string",
//     "brandProductCode": "string",
//     "brandSku": "string",
//     "sku": "string",
//     "brandType": "string",
//     "onboardingType": "string",
//     "redemptionType": "string",
//     "onlineRedemptionUrl": "string",
//     "brandImage": "string",
//     "epayMinValue": 0,
//     "epayMaxValue": 0,
//     "epayDiscount": 0,
//     "serviceType": "string",
//     "stockAvailable": true,
//     "description": "string",
//     "tnc": "string",
//     "importantInstruction": "string",
//     "createdAt": "2026-02-25T10:27:09.374Z",
//     "updatedAt": "2026-02-25T10:27:09.374Z"
//   },
//   "category": {
//     "id": 0,
//     "categoryName": "string",
//     "categoryCode": "string",
//     "displayOrder": 0,
//     "active": true
//   },
//   "description": "string",
//   "imageUrl": "string",
//   "discountPercent": 0,
//   "discountAmount": 0,
//   "expiryDate": "2026-02-25T10:27:09.374Z",
//   "isActive": true,
//   "discountType": "string",
//   "discountValue": 0,
//   "minOrderValue": 0,
//   "validFrom": "2026-02-25T10:27:09.374Z",
//   "validTo": "2026-02-25T10:27:09.374Z",
//   "status": "string",
//   "createdBy": {
//     "id": 0,
//     "fullName": "string",
//     "email": "string",
//     "mobile": "string",
//     "passwordHash": "string",
//     "userType": "string",
//     "status": "string",
//     "company": {
//       "id": 0,
//       "companyName": "string",
//       "industry": "string",
//       "contactName": "string",
//       "contactEmail": "string",
//       "contactMobile": "string",
//       "status": "string",
//       "consultingPhase": "string",
//       "isSharedJourneyMap": true,
//       "isSharedFeedback": true,
//       "createdAt": "2026-02-25T10:27:09.374Z",
//       "updatedAt": "2026-02-25T10:27:09.374Z"
//     },
//     "lastLoginAt": "2026-02-25T10:27:09.374Z",
//     "createdAt": "2026-02-25T10:27:09.374Z",
//     "updatedAt": "2026-02-25T10:27:09.374Z"
//   },
//   "createdAt": "2026-02-25T10:27:09.374Z",
//   "updatedAt": "2026-02-25T10:27:09.374Z"
// }
  }

 deleteCoupoun(id: any) {
    return this.http.delete<any>(this.baseUrl + `coupons/${id}`);
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

  
}
