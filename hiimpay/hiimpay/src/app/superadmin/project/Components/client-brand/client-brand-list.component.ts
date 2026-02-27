import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientBrandDialogComponent } from './client-brand-dialog.component';
import { ClientBrandCategoryCouponsDialogComponent } from './client-brand-category-coupons-dialog.component';
import { ProjectService } from '../../services/companyService';

interface Brand {
  id: string;
  brandProductCode: string;
  brandSku: string;
  name: string;
  brandType: string;
  onlineRedemptionUrl: string;
  brandImage: string;
  epayMinValue: number;
  epayMaxValue: number;
  epayDiscount: number;
  stockAvailable: boolean;
  categories: string[];
}

@Component({
  selector: 'app-client-brand-list',
  templateUrl: './client-brand-list.component.html',
  styleUrls: ['./client-brand-list.component.css']
})
export class ClientBrandListComponent implements OnInit {
  clientId = '';
  companyId: number = 0;
  brands: Brand[] = [];
  filtered: Brand[] = [];
  q = '';
  inStockOnly = false;
  isLoading = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private service: ProjectService
  ) {}

  ngOnInit(): void {
    this.clientId = sessionStorage.getItem('ClientId') || '';
    const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData')!);
    this.companyId = userData?.companyId;
    this.loadBrands();
  }

  loadBrands() {
    this.isLoading = true;
    this.service.brandsByCompanyID(this.companyId).subscribe({
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

  applyFilters() {
    const query = this.q.toLowerCase();
    this.filtered = this.brands.filter((brand) => {
      if (this.inStockOnly && !brand.stockAvailable) return false;
      if (!query) return true;
      return (
        brand.name.toLowerCase().includes(query) ||
        brand.brandProductCode.toLowerCase().includes(query)
      );
    });
  }

  openUpdateBrand() {
    const brand = this.filtered[0];
    if (!brand) return;
    const ref = this.dialog.open(ClientBrandDialogComponent, {
      width: '800px',
      maxHeight: '90vh',
      disableClose: true,
      data: { mode: 'update', brand }
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      const idx = this.brands.findIndex((item) => item.id === brand.id);
      if (idx < 0) return;
      this.brands[idx] = {
        ...this.brands[idx],
        brandProductCode: result.BrandProductCode || this.brands[idx].brandProductCode,
        brandSku: this.generateBrandSku(result.BrandName || this.brands[idx].name),
        name: result.BrandName || this.brands[idx].name,
        onlineRedemptionUrl: result.OnlineRedemptionUrl || this.brands[idx].onlineRedemptionUrl,
        brandImage: result.BrandImage || this.brands[idx].brandImage,
        epayMinValue: Number(result.EpayMinValue ?? this.brands[idx].epayMinValue),
        epayMaxValue: Number(result.EpayMaxValue ?? this.brands[idx].epayMaxValue),
        epayDiscount: Number(result.EpayDiscount ?? this.brands[idx].epayDiscount),
        categories: Array.isArray(result.categories) ? result.categories : this.brands[idx].categories
      };
      this.applyFilters();
    });
  }

  openCoupons(brand: Brand) {
    this.router.navigate(['../client-coupons', brand.id], { relativeTo: this.route });
  }

  openBrandCategoryCoupons(brand: Brand, event: MouseEvent) {
    event.stopPropagation();

    this.service.CoupounDataByBrandID(brand.id).subscribe({
      next: (res: any) => {
        const apiCoupons: any[] = res?.data || [];

        // Group by providerName (fallback to categoryName → 'General')
        const groupMap = new Map<string, any[]>();
        apiCoupons.forEach((c: any) => {
          const key = c.providerName || c.categoryName || 'General';
          if (!groupMap.has(key)) groupMap.set(key, []);
          groupMap.get(key)!.push({
            coupon_sku: c.sku || c.productCode || '-',
            product_name: c.productName || '-',
            min_value: c.minValue ?? c.brand?.epayMinValue ?? 0,
            max_value: c.maxValue ?? c.brand?.epayMaxValue ?? 0,
            discount_percent: c.discountPercent ?? 0,
            is_active: c.active ?? false
          });
        });

        const categoryCoupons = Array.from(groupMap.entries()).map(([category, coupons]) => ({ category, coupons }));

        this.dialog.open(ClientBrandCategoryCouponsDialogComponent, {
          width: '980px',
          maxHeight: '90vh',
          disableClose: false,
          data: {
            brand: {
              name: brand.name,
              brandSku: brand.brandSku,
              categories: brand.categories
            },
            categoryCoupons
          }
        });
      },
      error: (err: any) => {
        console.error('CoupounDataByBrandID error:', err);
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
}
