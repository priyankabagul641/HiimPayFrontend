import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../services/companyService';

@Component({
  selector: 'app-vouchers',
  templateUrl: './vouchers.component.html',
  styleUrls: ['./vouchers.component.css']
})
export class VouchersComponent implements OnInit {
  brands: any[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  filterType = '';
  companyId = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService
  ) {}

  ngOnInit(): void {
    const routeId =
      this.route.snapshot.parent?.params['id'] ||
      this.route.snapshot.params['id'];
    if (routeId) {
      this.companyId = Number(routeId);
    } else {
      const stored = sessionStorage.getItem('ClientId');
      this.companyId = stored ? Number(stored) : 0;
    }
    this.loadBrands();
  }

  loadBrands(): void {
    if (!this.companyId) {
      this.error = 'Company ID not found.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.projectService.getCpocCouponById(this.companyId).subscribe({
      next: (res: any) => {
        const raw: any[] = Array.isArray(res?.data) ? res.data : [];
        this.brands = raw.map(c => ({
          id: c.id,
          brandName: c.brand?.brandName || c.productName || '',
          brandImage: c.imageUrl || c.brand?.brandImage || '',
          brandType: c.brand?.brandType || c.category?.categoryName || '',
          epayDiscount: c.discountPercent ?? c.brand?.epayDiscount ?? 0,
          epayMinValue: c.minValue ?? c.brand?.epayMinValue ?? 0,
          epayMaxValue: c.maxValue ?? c.brand?.epayMaxValue ?? 99999,
          serviceType: c.brand?.serviceType || '',
          description: c.description || '',
          denominations: c.denominations || '',
          onlineRedemptionUrl: c.brand?.onlineRedemptionUrl || '',
          expiryDate: c.expiryDate || null,
          categoryName: c.category?.categoryName || '',
          productName: c.productName || '',
          currencyCode: c.currencyCode || 'INR',
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load vouchers.';
        this.loading = false;
      }
    });
  }

  get filteredBrands(): any[] {
    let arr = [...this.brands];
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      arr = arr.filter(b =>
        (b.brandName || '').toLowerCase().includes(q) ||
        (b.serviceType || '').toLowerCase().includes(q)
      );
    }
    if (this.filterType) {
      arr = arr.filter(b => (b.brandType || '').toLowerCase() === this.filterType.toLowerCase());
    }
    return arr;
  }

  get uniqueBrandTypes(): string[] {
    return [...new Set(this.brands.map(b => b.brandType).filter(Boolean))];
  }

  openVoucherDetail(id: number | string): void {
    this.router.navigate(['../voucher-detail', id], { relativeTo: this.route });
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  trackById(_: number, b: any): any {
    return b.id;
  }
}
