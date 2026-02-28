import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AdminDataService } from '../../services/adminData.service';
import { AddBrandDialogComponent } from './add-brand-dialog/add-brand-dialog.component';
import { UpdateBrandDialogComponent } from './update-brand-dialog/update-brand-dialog.component';
import { BrandCategoryCouponsDialogComponent } from './brand-category-coupons-dialog/brand-category-coupons-dialog.component';
import { ClientInfoDialogComponent } from './client-info-dialog/client-info-dialog.component';

interface Brand {
  id: string;
  name: string;
  brandSku: string;
  onlineRedemptionUrl: string;
  brandImage: string;
  stockAvailable: boolean;
  categories: string[];
  updatedAt?: string;
}

@Component({
  selector: 'app-voucher-brand-list',
  templateUrl: './voucher-brand-list.component.html',
  styleUrls: ['./voucher-brand-list.component.css']
})
export class VoucherBrandListComponent implements OnInit {
  brands: Brand[] = [];
  filtered: Brand[] = [];
  loading = false;

  q = '';
  inStockOnly = false;
  selectedCategory = 'ALL';
  categoryMenu: string[] = ['ALL', 'Clothing', 'Footwear', 'Electronics', 'Lifestyle', 'Food & Beverages'];

  constructor(
    private router: Router,
    private dialog: MatDialog
    ,private adminService: AdminDataService
  ) {}

  ngOnInit(): void {
    this.loadBrands();
  }
  loadBrands() {
    this.loading = true;
    this.adminService.getAllBrands().subscribe({
      next: (res: any) => {
        this.loading = false;
        const data = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.brands = (data || []).map((b: any) => ({
          id: (b.id || b.brandId || '').toString(),
          name: b.brandName || b.name || b.BrandName || '',
          brandSku: b.brandSku || b.brandProductCode || this.generateBrandSku(b.brandName || b.name || ''),
          onlineRedemptionUrl: b.onlineRedemptionUrl || b.OnlineRedemptionUrl || '',
          brandImage: b.brandImage || b.BrandImage || '',
          stockAvailable: b.stockAvailable ?? b.stock_available ?? true,
          categories: b.categories || b.categoryList || [],
          updatedAt: b.updatedAt || b.updated_at || ''
        }));
        this.applyFilters();
      },
      error: () => {
        this.loading = false;
        this.brands = [];
        this.applyFilters();
      }
    });
  }

  refresh() {
    this.loadBrands();
  }

  applyFilters() {
    const q = this.q.toLowerCase();

    this.filtered = this.brands.filter((b) => {
      if (this.inStockOnly && !b.stockAvailable) return false;
      if (this.selectedCategory !== 'ALL' && !b.categories.includes(this.selectedCategory)) return false;
      if (!q) return true;
      return (
        b.name.toLowerCase().includes(q) ||
        b.categories.join(' ').toLowerCase().includes(q)
      );
    });
  }

  onSearchChange() {
    this.applyFilters();
  }

  setInStock(v: boolean) {
    this.inStockOnly = v;
    this.applyFilters();
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }
  openBrand(b: Brand, event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    const idToFetch = b.id || (b as any).brandId || (b as any).id;
    if (!idToFetch) {
      return;
    }

    this.loading = true;
    this.adminService.getClientBrandById(idToFetch).subscribe({
      next: (res: any) => {
        this.loading = false;
        const brand = res?.data || null;
        this.dialog.open(ClientInfoDialogComponent, {
          width: '700px',
          maxHeight: '90vh',
          disableClose: false,
          data: { brand }
        });
      },
      error: (err: any) => {
        this.loading = false;
        console.error('getClientBrandById error', err);
        this.dialog.open(ClientInfoDialogComponent, {
          width: '700px',
          maxHeight: '90vh',
          disableClose: false,
          data: { brand: { id: idToFetch } }
        });
      }
    });
  }

  openBrandCategoryCoupons(b: Brand) {
    this.dialog.open(BrandCategoryCouponsDialogComponent, {
      width: '980px',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        brand: b,
        categoryCoupons: this.buildCategoryCoupons(b)
      }
    });
  }

  openAddBrand() {
    const dialogRef = this.dialog.open(AddBrandDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const newBrand: Brand = {
        id: Date.now().toString(),
        name: result.BrandName || result.name || '',
        brandSku: this.generateBrandSku(result.BrandName || result.name || ''),
        onlineRedemptionUrl: result.OnlineRedemptionUrl || '',
        brandImage: result.BrandImage || result.logo || '',
        stockAvailable: result.stockAvailable ?? true,
        categories: this.parseCategories(result)
      };

      this.brands.unshift(newBrand);
      this.applyFilters();
    });
  }

  openUpdateBrand() {
    const dialogRef = this.dialog.open(UpdateBrandDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;

      const newBrand: Brand = {
        id: result.id?.toString() || Date.now().toString(),
        name: result.BrandName || result.name || '',
        brandSku: this.generateBrandSku(result.BrandName || result.name || ''),
        onlineRedemptionUrl: result.OnlineRedemptionUrl || '',
        brandImage: result.BrandImage || result.logo || '',
        stockAvailable: result.stockAvailable ?? true,
        categories: this.parseCategories(result)
      };

      const existingIndex = this.brands.findIndex((b) => b.id === newBrand.id);
      if (existingIndex >= 0) {
        this.brands[existingIndex] = newBrand;
      } else {
        this.brands.unshift(newBrand);
      }
      this.applyFilters();
    });
  }

  private parseCategories(result: any): string[] {
    if (Array.isArray(result?.categories)) {
      return result.categories;
    }

    if (Array.isArray(result?.Category)) {
      return result.Category;
    }

    if (typeof result?.Category === 'string' && result.Category.trim()) {
      return result.Category.split(',').map((c: string) => c.trim()).filter((c: string) => !!c);
    }

    return [];
  }

  private generateBrandSku(name: string): string {
    const cleaned = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefix = (cleaned.slice(0, 3) || 'brn').padEnd(3, 'x');
    const hash = Array.from(cleaned || 'brand').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const num = ((hash % 900) + 100).toString();
    return `${prefix}${num}`;
  }

  private buildCategoryCoupons(brand: Brand) {
    const providers = ['GYFTR', 'XOXODAY', 'MYHUMBLE'];
    return brand.categories.map((category, index) => {
      const categoryNo = (index + 1).toString().padStart(4, '0');
      const coupons = [1, 2].map((serial) => {
        const productCode = `${category.replace(/[^a-z]/gi, '').toLowerCase().slice(0, 2) || 'ct'}${serial}`.padEnd(4, 'x');
        const valueMin = serial === 1 ? 100 : 500;
        const valueMax = serial === 1 ? 1000 : 5000;
        return {
          product_name: `${brand.name} ${category} Voucher ${serial}`,
          provider_name: providers[(index + serial - 1) % providers.length],
          coupon_sku: `${brand.brandSku}-${categoryNo}-${productCode}`,
          min_value: valueMin,
          max_value: valueMax,
          discount_percent: serial === 1 ? 5 : 10,
          is_active: brand.stockAvailable
        };
      });

      return { category, coupons };
    });
  }
}
