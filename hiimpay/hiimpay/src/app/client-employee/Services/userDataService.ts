
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
    return this.http.get<any>(this.baseUrl+`user-wallets/user/${id}/status?status=ACTIVE`);
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
 getUserWalletsStatusUsedById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`user-wallets/user/${id}/status?status=USED`);
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

   getUserWalletsStatusExpiredById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`user-wallets/user/${id}/status?status=EXPIRED`);
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


   getUserTransactionsById(id: any): Observable<any> {
    return this.http.get<any>(this.baseUrl+`user-reward-wallets/user/${id}/transactions`);
//     getting responce like this
// {
//     "data": [
//         {
//             "id": 196,
//             "wallet": {
//                 "id": 14,
//                 "userId": 58,
//                 "balance": 5650,
//                 "createdAt": "2026-03-05T17:04:26.471",
//                 "updatedAt": "2026-04-01T14:23:13.081"
//             },
//             "userId": 58,
//             "transactionType": "DEBIT",
//             "amount": 2300,
//             "balanceAfter": 7950,
//             "referenceNo": "REF-1775033592085",
//             "notes": "Checkout using wallet",
//             "invoiceUrl": null,
//             "createdAt": "2026-04-01T14:23:12.954"
//         },]}
  }

   purchaseCoupoun (data:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`user-wallets/cart/items`, data);   
// object is like this
// {
// "userId": 0,
//   "voucherId": 0,
//   "amount": 0,
//   "quantity": 0
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

   razorPayWalletRes(data:any,id:any):Observable<any>{
    return this.http.post<any>(this.baseUrl+`user-reward-wallets/user/${id}/credit`, data);
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

  getCategories(): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'cpoc-coupons/public/categories');
  //   getting res like this
  //   {
  // "data": [
  //   {
  //     "id": 2,
  //     "categoryName": "Electronics",
  //     "categoryCode": "ELEC01",
  //     "displayOrder": 1,
  //     "isDeleted": false,
  //     "deletedAt": null,
  //     "active": true
  //   },]}
  }

  getBrands(): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'cpoc-coupons/public/brands');
    // getting res like this 
  //   {
  // "data": [
  //   {
  //     "id": 2,
  //     "brandName": "UrbanStyle Fashion",
  //     "brandProductCode": "USF-GIFT-2026",
  //     "brandSku": "USF-SKU-450",
  //     "sku": "USF-450-IND",
  //     "brandType": "Retail",
  //     "onboardingType": "ONLINE",
  //     "redemptionType": "ONLINE",
  //     "onlineRedemptionUrl": "https://urbanstyle.com/redeem",
  //     "brandImage": "https://example.com/images/urbanstyle-logo.png",
  //     "epayMinValue": 100,
  //     "epayMaxValue": 5000,
  //     "epayDiscount": 20,
  //     "serviceType": "Gift Voucher",
  //     "stockAvailable": true,
  //     "description": "UrbanStyle Fashion gift vouchers valid on all online purchases.",
  //     "tnc": "Valid for one-time use only. Cannot be combined with other promotional codes.",
  //     "importantInstruction": "Apply voucher code at checkout before making payment.",
  //     "createdAt": "2026-02-01T10:00:00",
  //     "updatedAt": "2026-02-24T18:55:26.847",
  //     "isDeleted": null,
  //     "deletedAt": null
  //   },]}
  }

  getVouchersByDemand(maxDiscount = 0, minDiscount = 0, brandId = 0, categoryId = 0): Observable<any> {
    const params: string[] = [];
    if (maxDiscount)  params.push(`maxDiscount=${maxDiscount}`);
    if (minDiscount)  params.push(`minDiscount=${minDiscount}`);
    if (brandId)      params.push(`brandId=${brandId}`);
    if (categoryId)   params.push(`categoryId=${categoryId}`);
    const query = params.length ? '?' + params.join('&') : '';
    return this.http.get<any>(this.baseUrl + 'cpoc-coupons/public/vouchers?' + query);
  
//  getting res like this 
// {
//   "data": {
//     "content": [
//       {
//         "id": 783,
//         "sku": "TAT696-001-TATT-01",
//         "productCode": "TATT",
//         "serialNo": 1,
//         "externalProductId": "87375",
//         "providerName": "XOXODAY",
//         "productName": "Tattva Spa",
//         "brand": {
//           "id": 704,
//           "brandName": "Tattva Spa",
//           "brandProductCode": null,
//           "brandSku": "TAT696",
//           "sku": null,
//           "brandType": null,
//           "onboardingType": null,
//           "redemptionType": null,
//           "onlineRedemptionUrl": null,
//           "brandImage": null,
//           "epayMinValue": null,
//           "epayMaxValue": null,
//           "epayDiscount": null,
//           "serviceType": null,
//           "stockAvailable": null,
//           "description": null,
//           "tnc": null,
//           "importantInstruction": null,
//           "createdAt": "2026-03-24T18:57:37.553",
//           "updatedAt": "2026-03-24T18:57:37.553",
//           "isDeleted": false,
//           "deletedAt": null
//         },
//         "brandName": "Tattva Spa",
//         "description": "Tattva Spa, a premium wellness brand, offers luxurious therapies like massages, spa kiosks, and beauty elixirs. Established in 2012 in Manali, currently it operates across 70+ locations in 28 cities, including Mumbai, Delhi, and Hyderabad. With 3200+ trained healers, Tattva Spa ensures a rejuvenating spa experience. Enjoy a relaxing escape with Tattva Spa Gift Cards from GyFTR and avail exclusive discounts.",
//         "category": {
//           "id": 1,
//           "categoryName": "UNCATEGORIZED",
//           "categoryCode": "001",
//           "displayOrder": 1,
//           "isDeleted": null,
//           "deletedAt": null,
//           "active": true
//         },
//         "categoryName": "UNCATEGORIZED",
//         "imageUrl": null,
//         "redemptionType": null,
//         "denominations": "5000,3000,2500,2000,1500",
//         "minValue": null,
//         "maxValue": null,
//         "discountPercent": null,
//         "userDiscount": null,
//         "quantity": null,
//         "currencyCode": null,
//         "countryCode": null,
//         "expiryDate": null,
//         "onboardingType": "API",
//         "apiType": "XOXODAY",
//         "createdAt": "2026-03-24T18:57:37.562",
//         "updatedAt": "2026-03-24T18:57:37.562",
//         "isDeleted": false,
//         "deletedAt": null,
//         "active": true
//       },]}
  
  }

}