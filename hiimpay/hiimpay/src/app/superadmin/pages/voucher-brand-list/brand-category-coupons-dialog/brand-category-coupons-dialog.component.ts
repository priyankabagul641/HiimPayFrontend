import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-brand-category-coupons-dialog',
  templateUrl: './brand-category-coupons-dialog.component.html',
  styleUrls: ['./brand-category-coupons-dialog.component.css']
})
export class BrandCategoryCouponsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<BrandCategoryCouponsDialogComponent>
  ) {
    console.log('BrandCategoryCouponsDialogComponent received data:', data);

    if (!this.data) {
      this.data = { brand: { name: '', brandSku: '', categories: [] }, categoryCoupons: [] };
    }

    const b = this.data.brand || {};
    // normalize field names from API
    b.name = b.name || b.brandName || b.BrandName || '';
    b.brandSku = b.brandSku || b.brandProductCode || b.brandSku || '';
    if (!b.categories) {
      if (Array.isArray(b.categoryList)) b.categories = b.categoryList;
      else if (typeof b.Category === 'string' && b.Category.trim()) b.categories = b.Category.split(',').map((c: string) => c.trim());
      else b.categories = [];
    }
    this.data.brand = b;

    // ensure categoryCoupons exists (generate if missing)
    if (!Array.isArray(this.data.categoryCoupons) || this.data.categoryCoupons.length === 0) {
      this.data.categoryCoupons = (b.categories || []).map((category: string, index: number) => {
        const coupons = [1, 2].map((serial) => ({
          coupon_sku: `${b.brandSku || 'SKU'}-${(index + 1).toString().padStart(4, '0')}-${serial}`,
          product_name: `${b.name} ${category} Voucher ${serial}`,
          min_value: serial === 1 ? 100 : 500,
          max_value: serial === 1 ? 1000 : 5000,
          discount_percent: serial === 1 ? 5 : 10,
          is_active: b.stockAvailable ?? true
        }));
        return { category, coupons };
      });
    }
  }

  close() {
    this.dialogRef.close();
  }
}

