export interface Voucher {
  id: number;
  name: string;
  brand: string;
  brandLogo: string;
  image: string;
  description: string;
  shortDescription: string;
  category: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  denomination: number[];
  termsAndConditions: string;
  howToRedeem: string;
  validity: string;
  type: string; // E-VOUCHER, GIFT_CARD
  redemptionType: string; // ONLINE, OFFLINE, BOTH
  status: string;
}

export interface PublicCartItem {
  voucherId: number;
  name: string;
  brand: string;
  brandLogo: string;
  image: string;
  price: number;
  discountPercent: number;
  discountedPrice: number;
  quantity: number;
  denomination: number;
}

export interface GuestCheckoutForm {
  name: string;
  email: string;
  mobile: string;
}

export interface OrderSummary {
  orderId: string;
  items: PublicCartItem[];
  guest: GuestCheckoutForm;
  totalAmount: number;
  totalSavings: number;
  paymentId: string;
  date: string;
}

export type VoucherCategory =
  | 'All'
  | 'Food & Dining'
  | 'Shopping'
  | 'Travel'
  | 'Electronics'
  | 'Entertainment'
  | 'Health & Wellness';
