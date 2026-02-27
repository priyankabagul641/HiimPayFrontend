
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
//     {
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
//       "updatedAt": "2026-02-24T18:55:26.847",
//       "isDeleted": null,
//       "deletedAt": null
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
//       "updatedAt": "2026-02-25T10:50:25.991",
//       "isDeleted": null,
//       "deletedAt": null
//     },
//     {
//       "id": 5,
//       "brandName": "Amazon",
//       "brandProductCode": "AMZ1001",
//       "brandSku": "AMA004",
//       "sku": null,
//       "brandType": "GIFT_CARD",
//       "onboardingType": "API",
//       "redemptionType": "ONLINE",
//       "onlineRedemptionUrl": "https://amazon.in/redeem",
//       "brandImage": "https://example.com/amazon.png",
//       "epayMinValue": 100,
//       "epayMaxValue": 10000,
//       "epayDiscount": 5,
//       "serviceType": "E-VOUCHER",
//       "stockAvailable": true,
//       "description": "Amazon Gift Voucher usable for shopping.",
//       "tnc": "Valid for 12 months from issue date.",
//       "importantInstruction": "Do not share voucher code with anyone.",
//       "createdAt": "2026-02-25T14:46:24.71",
//       "updatedAt": "2026-02-25T14:46:24.71",
//       "isDeleted": null,
//       "deletedAt": null
//     }
//   ],
//   "message": "Brands fetched successfully",
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


}