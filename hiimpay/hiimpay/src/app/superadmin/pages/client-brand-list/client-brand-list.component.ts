import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BrandCategoryCouponsDialogComponent } from '../voucher-brand-list/brand-category-coupons-dialog/brand-category-coupons-dialog.component';
import { AdminDataService } from '../../services/adminData.service';

interface ClientBrand {
  clientId: string;
  clientName: string;
  brandId: string;
  brandName: string;
  brandProductCode: string;
  brandSku: string;
  categories: string[];
  epayMinValue: number;
  epayMaxValue: number;
  stockAvailable: boolean;
}

@Component({
  selector: 'app-superadmin-client-brand-list',
  templateUrl: './client-brand-list.component.html',
  styleUrls: ['./client-brand-list.component.css']
})
export class ClientBrandListPageComponent implements OnInit {
  rows: ClientBrand[] = [];
  filtered: ClientBrand[] = [];
  loading = false;
  q = '';
  selectedClient = 'ALL';
  inStockOnly = false;
  // pagination
  page: number = 1;
  itemPerPage: number = 10;
  totalItems: number = 0;
 isLoading = false;
   brands: any[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private adminService: AdminDataService,

  ) {}

  ngOnInit(): void {
    this.loadClientBrands();
  }

  loadClientBrands() {
    this.loading = true;
    this.adminService.getAllClientBrands(0, 1000).subscribe({
      next: (res: any) => {
        this.loading = false;
        // normalize response to an array: support res array, res.data array, res.data.content, res.data.items, or single object
        let data: any[] = [];
        let total = 0;
        if (!res) {
          data = [];
        } else if (Array.isArray(res)) {
          data = res;
          total = data.length;
        } else if (res.data) {
          if (Array.isArray(res.data)) {
            data = res.data;
            total = data.length;
          } else if (Array.isArray(res.data.content)) {
            data = res.data.content;
            total = (res.data.totalElements ?? res.data.total) || data.length;
          } else if (Array.isArray(res.data.items)) {
            data = res.data.items;
            total = (res.data.totalElements ?? res.data.total) || data.length;
          } else if (typeof res.data === 'object') {
            data = [res.data];
            total = 1;
          }
        } else {
          data = [];
        }
        console.log('loadClientBrands - normalized data length:', data.length, 'raw response:', res);
        this.totalItems = total;
        this.rows = (data || []).map((r: any) => ({
          clientId: (r.clientId || r.client_id || r.client?.id || r.id || '').toString(),
          clientName: r.clientName || r.companyName || r.client?.name || r.client_name || r.client?.companyName || 'Unknown',
          brandId: (r.brandId || r.brand?.id || r.brand_id || r.brandId || '').toString(),
          brandName: r.brandName || r.brand?.brandName || r.brand?.name || r.brand_name || r.brand?.BrandName || '',
          brandProductCode: r.brandProductCode || r.brand?.brandProductCode || r.brandProductCode || '',
          brandSku: r.brandSku || r.brand?.brandSku || r.brand?.brandProductCode || this.generateBrandSku(r.brand?.brandName || r.brandName || ''),
          categories: r.categories || r.brand?.categories || r.categoryList || [],
          epayMinValue: r.epayMinValue ?? r.brand?.epayMinValue ?? 0,
          epayMaxValue: r.epayMaxValue ?? r.brand?.epayMaxValue ?? 0,
          stockAvailable: r.stockAvailable ?? r.brand?.stockAvailable ?? true
        }));
        this.applyFilters();
      },
      error: () => {
        this.loading = false;
        this.rows = [];
        this.applyFilters();
      }
    });
  }

  get clientOptions(): string[] {
    return ['ALL', ...Array.from(new Set(this.rows.map((item) => item.clientName)))];
  }

  applyFilters() {
    const query = this.q.trim().toLowerCase();
    this.filtered = this.rows.filter((item) => {
      if (this.selectedClient !== 'ALL' && item.clientName !== this.selectedClient) {
        return false;
      }
      if (this.inStockOnly && !item.stockAvailable) {
        return false;
      }
      if (!query) {
        return true;
      }
      return (
        item.clientName.toLowerCase().includes(query) ||
        item.brandName.toLowerCase().includes(query) ||
        item.brandProductCode.toLowerCase().includes(query)
      );
    });
    this.page = 1;
    this.totalItems = this.filtered.length;
  }

  pageChangeEvent(event: number) {
    this.page = event;
  }

  getPageUpperBound(): number {
    const upper = (this.page || 1) * (this.itemPerPage || 10);
    return Math.min(upper, this.totalItems || 0);
  }

  loadBrands(companyId?: string) {
    if (!companyId) {
      console.warn('loadBrands called without companyId');
      return;
    }
    this.isLoading = true;
    this.adminService.brandsByCompanyID(companyId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.brands = (res.data || []).map((b: any) => ({
          id: b.id,
          brandProductCode: b.brandProductCode || '',
          brandSku: b.brandSku || '',
          name: b.brandName || '',
          brandType: b.brandType || '',
          onlineRedemptionUrl: b.onlineRedemptionUrl || '',
          brandImage: b.brandImage || '',
          epayMinValue: b.epayMinValue ?? 0,
          epayMaxValue: b.epayMaxValue ?? 0,
          epayDiscount: b.epayDiscount ?? 0,
          stockAvailable: b.stockAvailable ?? false,
          categories: b.serviceType ? [b.serviceType] : []
        }));
        this.applyFilters();
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('loadBrands error:', err);
      }
    });
  }


  openCoupons(item: ClientBrand) {
    this.router.navigate(['superadmin', 'project', item.clientId, 'client-coupons', item.brandId]);
  }

  openBrandCategoryCoupons(clientId: string, item: ClientBrand, event: MouseEvent) {
    event.stopPropagation();
    this.loading = true;
    // Fetch all brands for the company and show them in the dialog as a table
    this.adminService.brandsByCompanyID(clientId).subscribe({
      next: (res: any) => {
        this.loading = false;
        const brands = (res && (res.data || res.items || res)) ? (res.data || res.items || res) : [];
        // normalize minimal brand info
        const normalized = (brands || []).map((b: any) => ({
          id: b.id || b.brandId || b.brand_id || '',
          name: b.brandName || b.name || b.brand_name || '',
          brandProductCode: b.brandProductCode || b.brandProductCode || '',
          brandSku: b.brandSku || b.sku || b.brandProductCode || '' ,
          stockAvailable: b.stockAvailable ?? b.inStock ?? false,
          epayDiscount: b.epayDiscount ?? b.discount ?? null,
          epayMaxValue: b.epayMaxValue ?? b.maxValue ?? null,
          epayMinValue: b.epayMinValue ?? b.minValue ?? null,
          brandType: b.brandType || b.type || ''
        }));

        this.dialog.open(BrandCategoryCouponsDialogComponent, {
          width: '900px',
          data: {
            companyId: clientId,
            companyName: item.clientName,
            brands: normalized
          }
        });
      },
      error: (err: any) => {
        this.loading = false;
        console.error('brandsByCompanyID error:', err);
        // Open dialog with empty brands if call fails
        this.dialog.open(BrandCategoryCouponsDialogComponent, {
          width: '900px',
          data: {
            companyId: clientId,
            companyName: item.clientName,
            brands: []
          }
        });
      }
    });
  }

  private openBrandDialog(item: ClientBrand, brandDetails: any) {
    this.dialog.open(BrandCategoryCouponsDialogComponent, {
      width: '980px',
      maxHeight: '90vh',
      disableClose: false,
      data: {
        brand: {
          name: item.brandName,
          brandSku: item.brandSku,
          categories: item.categories
        },
        categoryCoupons: this.buildCategoryCoupons(item),
        brandDetails
      }
    });
  }

  private generateBrandSku(name: string): string {
    const cleaned = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const prefix = (cleaned.slice(0, 3) || 'brn').padEnd(3, 'x');
    const hash = Array.from(cleaned || 'brand').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const num = ((hash % 900) + 100).toString();
    return `${prefix}${num}`;
  }

  private buildCategoryCoupons(item: ClientBrand) {
    const providers = ['GYFTR', 'XOXODAY', 'MYHUMBLE'];

    return item.categories.map((category, index) => {
      const categoryNo = (index + 1).toString().padStart(4, '0');
      const coupons = [1, 2].map((serial) => {
        const productCode = `${category.replace(/[^a-z]/gi, '').toLowerCase().slice(0, 2) || 'ct'}${serial}`.padEnd(4, 'x');
        const valueMin = serial === 1 ? item.epayMinValue : Math.max(item.epayMinValue, 500);
        const valueMax = serial === 1 ? Math.min(item.epayMaxValue, 1000) : item.epayMaxValue;

        return {
          product_name: `${item.brandName} ${category} Voucher ${serial}`,
          provider_name: providers[(index + serial - 1) % providers.length],
          coupon_sku: `${item.brandSku}-${categoryNo}-${productCode}`,
          min_value: valueMin,
          max_value: valueMax,
          discount_percent: serial === 1 ? 5 : 10,
          is_active: item.stockAvailable
        };
      });

      return { category, coupons };
    });
  }
}
