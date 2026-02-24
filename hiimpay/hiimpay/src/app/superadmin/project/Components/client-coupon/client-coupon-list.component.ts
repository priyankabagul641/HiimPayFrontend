import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ClientCouponDialogComponent } from './client-coupon-dialog.component';

@Component({
  selector: 'app-client-coupon-list',
  templateUrl: './client-coupon-list.component.html',
  styleUrls: ['./client-coupon-list.component.css']
})
export class ClientCouponListComponent implements OnInit {
  brandId = '';
  clientId = '';
  coupons: any[] = [];
  searchTerm = '';
  selectedBrand = '';
  selectedCategory = '';
  expandedCouponId: number | null = null;
  currentPage = 1;
  pageSize = 5;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.brandId = this.route.snapshot.paramMap.get('brandId') || '';
    this.clientId = sessionStorage.getItem('ClientId') || '';
    this.seedCoupons();
  }

  seedCoupons() {
    const staticCoupons = [
      {
        id: 1,
        external_product_id: 'GYFTR-AMZ-500',
        provider_name: 'GYFTR',
        product_name: `Brand ${this.brandId} Welcome Voucher`,
        brand_name: 'Amazon',
        description: 'Welcome voucher for employees',
        category: 'Lifestyle',
        image_url: 'amazon-logo.png',
        redemption_type: 'Online',
        denominations: [500],
        min_value: 500,
        max_value: 500,
        discount_percent: 2,
        currency_code: 'INR',
        country_code: 'IN',
        expiry_date: '2026-12-31',
        is_active: true
      },
      {
        id: 2,
        external_product_id: 'XOXO-BATA-1000',
        provider_name: 'XOXODAY',
        product_name: `Brand ${this.brandId} Festive Voucher`,
        brand_name: 'Bata',
        description: 'Festive voucher offer',
        category: 'Footwear',
        image_url: 'bata-logo.png',
        redemption_type: 'Offline',
        denominations: [500, 1000],
        min_value: 500,
        max_value: 1000,
        discount_percent: 4,
        currency_code: 'INR',
        country_code: 'IN',
        expiry_date: '2026-11-30',
        is_active: true
      },
      {
        id: 3,
        external_product_id: 'PINELABS-TATA-2500',
        provider_name: 'PINELABS',
        product_name: `Brand ${this.brandId} Premium Gifting`,
        brand_name: 'Croma',
        description: 'Premium category electronic voucher',
        category: 'Electronics',
        image_url: 'croma-logo.png',
        redemption_type: 'Online',
        denominations: [1000, 2500, 5000],
        min_value: 1000,
        max_value: 5000,
        discount_percent: 5,
        currency_code: 'INR',
        country_code: 'IN',
        expiry_date: '2027-03-15',
        is_active: false
      },
      {
        id: 4,
        external_product_id: 'GYFTR-ZOMA-750',
        provider_name: 'GYFTR',
        product_name: `Brand ${this.brandId} Food Delight`,
        brand_name: 'Zomato',
        description: 'Food and beverages reward coupon',
        category: 'Food & Beverages',
        image_url: 'zomato-logo.png',
        redemption_type: 'Online',
        denominations: [250, 500, 750],
        min_value: 250,
        max_value: 750,
        discount_percent: 3,
        currency_code: 'INR',
        country_code: 'IN',
        expiry_date: '2026-09-01',
        is_active: true
      },
      {
        id: 5,
        external_product_id: 'XOXO-REL-1000',
        provider_name: 'XOXODAY',
        product_name: `Brand ${this.brandId} Fashion Rewards`,
        brand_name: 'Reliance Trends',
        description: 'Fashion and apparel rewards',
        category: 'Clothing',
        image_url: 'reliance-trends-logo.png',
        redemption_type: 'Offline',
        denominations: [500, 1000, 2000],
        min_value: 500,
        max_value: 2000,
        discount_percent: 6,
        currency_code: 'INR',
        country_code: 'IN',
        expiry_date: '2026-10-20',
        is_active: true
      },
      {
        id: 6,
        external_product_id: 'PINE-AJI-300',
        provider_name: 'PINELABS',
        product_name: `Brand ${this.brandId} Grocery Essential`,
        brand_name: 'BigBasket',
        description: 'Ecommerce grocery coupon',
        category: 'Ecommerce',
        image_url: 'bigbasket-logo.png',
        redemption_type: 'Online',
        denominations: [300, 600],
        min_value: 300,
        max_value: 600,
        discount_percent: 2,
        currency_code: 'INR',
        country_code: 'IN',
        expiry_date: '2027-01-01',
        is_active: false
      }
    ];

    this.coupons = staticCoupons.map((coupon) => this.enrichCouponSku(coupon));
  }

  editCoupon(coupon: any) {
    const ref = this.dialog.open(ClientCouponDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      data: { mode: 'update', coupon }
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const idx = this.coupons.findIndex((item) => item.id === coupon.id);
      if (idx >= 0) this.coupons[idx] = this.enrichCouponSku({ ...this.coupons[idx], ...result });
    });
  }

  toggleExpanded(couponId: number) {
    this.expandedCouponId = this.expandedCouponId === couponId ? null : couponId;
  }

  isExpanded(couponId: number): boolean {
    return this.expandedCouponId === couponId;
  }

  get brandOptions(): string[] {
    return [...new Set(this.coupons.map((item) => item.brand_name).filter(Boolean))];
  }

  get categoryOptions(): string[] {
    return [...new Set(this.coupons.map((item) => item.category).filter(Boolean))];
  }

  get filteredCoupons(): any[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.coupons.filter((item) => {
      const brandMatch = this.selectedBrand ? item.brand_name === this.selectedBrand : true;
      const categoryMatch = this.selectedCategory ? item.category === this.selectedCategory : true;
      const searchMatch = !term
        ? true
        : [
            item.product_name,
            item.brand_name,
            item.category,
            item.external_product_id,
            item.provider_name,
            item.coupon_sku
          ]
            .filter(Boolean)
            .some((field) => String(field).toLowerCase().includes(term));
      return brandMatch && categoryMatch && searchMatch;
    });
  }

  get totalPages(): number {
    const pages = Math.ceil(this.filteredCoupons.length / this.pageSize);
    return pages > 0 ? pages : 1;
  }

  get paginatedCoupons(): any[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCoupons.slice(start, start + this.pageSize);
  }

  get hasFilters(): boolean {
    return !!(this.searchTerm || this.selectedBrand || this.selectedCategory);
  }

  onFiltersChanged() {
    this.currentPage = 1;
    this.expandedCouponId = null;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedBrand = '';
    this.selectedCategory = '';
    this.onFiltersChanged();
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage += 1;
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage -= 1;
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) this.currentPage = page;
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i += 1) pages.push(i);
    return pages;
  }

  private enrichCouponSku(coupon: any) {
    const brandSku = this.generateBrandSku(coupon.brand_name || '');
    const categoryNo = this.getCategoryNumber(coupon.category || '');
    const productCode = this.getProductCode(coupon.external_product_id || '');
    return {
      ...coupon,
      brand_sku: brandSku,
      coupon_sku: `${brandSku}-${categoryNo}-${productCode}`
    };
  }

  private generateBrandSku(name: string): string {
    const cleaned = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefix = (cleaned.slice(0, 3) || 'brn').padEnd(3, 'x');
    const hash = Array.from(cleaned || 'brand').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const num = ((hash % 900) + 100).toString();
    return `${prefix}${num}`;
  }

  private getCategoryNumber(category: string): string {
    const map: { [key: string]: number } = {
      clothing: 1,
      footwear: 2,
      electronics: 3,
      lifestyle: 4,
      'food&beverages': 5,
      ecommerce: 6
    };
    const key = (category || '').toLowerCase().replace(/[^a-z]/g, '');
    const value = map[key] || 9999;
    return value.toString().padStart(4, '0');
  }

  private getProductCode(externalId: string): string {
    const cleaned = (externalId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return (cleaned.slice(-4) || 'xxxx').padStart(4, '0');
  }
}
