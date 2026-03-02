
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment/enviorment.prod';



@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  baseUrl = environment.baseUrl;
  // baseUrl2 = environment.baseUrl2;
  constructor(private http: HttpClient) {}


  getUserCoupounById(id: any): Observable<any> {
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

 getUserWalletsStatusById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`user-wallets/user/${id}/status?status=Active`);
// {
//   "data": [
//     {
//       "wallet": {
//         "id": 3,
//         "userId": 30,
//         "voucherId": 17,
//         "brand": {
//           "id": 5,
//           "brandName": "Amazon",
//           "brandProductCode": "AMZ1001",
//           "brandSku": "AMA004",
//           "sku": null,
//           "brandType": "GIFT_CARD",
//           "onboardingType": "API",
//           "redemptionType": "ONLINE",
//           "onlineRedemptionUrl": "https://amazon.in/redeem",
//           "brandImage": "https://example.com/amazon.png",
//           "epayMinValue": 100,
//           "epayMaxValue": 10000,
//           "epayDiscount": 5,
//           "serviceType": "E-VOUCHER",
//           "stockAvailable": true,
//           "description": "Amazon Gift Voucher usable for shopping.",
//           "tnc": "Valid for 12 months from issue date.",
//           "importantInstruction": "Do not share voucher code with anyone.",
//           "createdAt": "2026-02-25T14:46:24.71",
//           "updatedAt": "2026-02-25T14:46:24.71",
//           "isDeleted": null,
//           "deletedAt": null
//         },
//         "allocationSource": "WALLET",
//         "allocatedAt": "2026-03-02T14:51:25.381",
//         "expiresAt": "2027-02-27T23:59:59",
//         "status": "PENDING",
//         "redeemedAt": null,
//         "isExpired": false,
//         "isRedeemed": false,
//         "isDeleted": false,
//         "deletedAt": null
//       },
//       "usageStatus": "ACTIVE",
//       "isUsed": false,
//       "isExpired": false,
//       "isActive": true
//     }
//   ],
//   "message": "User wallet fetched successfully",
//   "success": true
// }
  }

   getUserWalletById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`user-reward-wallets/user/${id}`);
//     getting responce like this{
//   "data": {
//     "id": 2,
//     "userId": 36,
//     "balance": 10010,
//     "createdAt": "2026-02-27T12:19:44.091",
//     "updatedAt": "2026-02-27T12:56:19.487"
//   },
//   "message": "Reward wallet fetched successfully",
//   "success": true
// }
  }
   getUserTransactionsById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`user-reward-wallets/user/${id}/transactions`);
//     getting responce like this 
//     {
//   "data": [
//     {
//       "id": 21,
//       "wallet": {
//         "id": 2,
//         "userId": 36,
//         "balance": 10010,
//         "createdAt": "2026-02-27T12:19:44.091",
//         "updatedAt": "2026-02-27T12:56:19.487"
//       },
//       "userId": 36,
//       "transactionType": "CREDIT",
//       "amount": 5000,
//       "balanceAfter": 10010,
//       "referenceNo": "REF-1772177179869",
//       "notes": "padwa gift",
//       "createdAt": "2026-02-27T12:56:19.482"
//     },
//     {
//       "id": 16,
//       "wallet": {
//         "id": 2,
//         "userId": 36,
//         "balance": 10010,
//         "createdAt": "2026-02-27T12:19:44.091",
//         "updatedAt": "2026-02-27T12:56:19.487"
//       },
//       "userId": 36,
//       "transactionType": "CREDIT",
//       "amount": 1000,
//       "balanceAfter": 5010,
//       "referenceNo": "REF-1772176886277",
//       "notes": "holi gift",
//       "createdAt": "2026-02-27T12:51:25.914"
//     },
//     {
//       "id": 11,
//       "wallet": {
//         "id": 2,
//         "userId": 36,
//         "balance": 10010,
//         "createdAt": "2026-02-27T12:19:44.091",
//         "updatedAt": "2026-02-27T12:56:19.487"
//       },
//       "userId": 36,
//       "transactionType": "CREDIT",
//       "amount": 1010,
//       "balanceAfter": 4010,
//       "referenceNo": "REWARD-2026-001",
//       "notes": "Monthly performance reward",
//       "createdAt": "2026-02-27T12:22:49.235"
//     },
//     {
//       "id": 7,
//       "wallet": {
//         "id": 2,
//         "userId": 36,
//         "balance": 10010,
//         "createdAt": "2026-02-27T12:19:44.091",
//         "updatedAt": "2026-02-27T12:56:19.487"
//       },
//       "userId": 36,
//       "transactionType": "CREDIT",
//       "amount": 1000,
//       "balanceAfter": 3000,
//       "referenceNo": "REWARD-2026-001",
//       "notes": "Monthly performance reward",
//       "createdAt": "2026-02-27T12:20:12.76"
//     },
//     {
//       "id": 4,
//       "wallet": {
//         "id": 2,
//         "userId": 36,
//         "balance": 10010,
//         "createdAt": "2026-02-27T12:19:44.091",
//         "updatedAt": "2026-02-27T12:56:19.487"
//       },
//       "userId": 36,
//       "transactionType": "CREDIT",
//       "amount": 1000,
//       "balanceAfter": 2000,
//       "referenceNo": "REWARD-2026-001",
//       "notes": "Monthly performance reward",
//       "createdAt": "2026-02-27T12:20:04.544"
//     },
//     {
//       "id": 2,
//       "wallet": {
//         "id": 2,
//         "userId": 36,
//         "balance": 10010,
//         "createdAt": "2026-02-27T12:19:44.091",
//         "updatedAt": "2026-02-27T12:56:19.487"
//       },
//       "userId": 36,
//       "transactionType": "CREDIT",
//       "amount": 1000,
//       "balanceAfter": 1000,
//       "referenceNo": "REWARD-2026-001",
//       "notes": "Monthly performance reward",
//       "createdAt": "2026-02-27T12:19:44.093"
//     }
//   ],
//   "message": "Reward wallet transactions fetched successfully",
//   "success": true
// }
  }
 
   submitPurchase (data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`user-wallets/purchase`, data);
// object is like this 
// {
//   "userId": 0,
//   "voucherId": 0,
//   "amount": 0,
//   "referenceNo": "string",
//   "notes": "string",
//   "allocationSource": "string",
//   "status": "string",
//   "redemptionChannel": "string"
// }

   }

   totalCoupousCount(userId:any):Observable<any>{
    return this.http.get<any>(this.baseUrl+`user-wallets/user/${userId}/counts`);
//     {
//   "data": {
//     "purchasedCount": 0,
//     "assignedCount": 2,
//     "expiredCount": 0,
//     "totalCount": 2
//   },
//   "message": "User coupon counts fetched successfully",
//   "success": true
// }
   }

}