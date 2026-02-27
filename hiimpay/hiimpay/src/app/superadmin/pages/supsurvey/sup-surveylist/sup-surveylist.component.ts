import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SurveyApiService } from '../../../project/Components/survey/service/survey-api.service';
import { AdminDataService } from '../../../services/adminData.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { SearchService } from '../../../services/search.service';
import { DeleteComponent } from '../../delete/delete.component';
import { CreateCouponComponent } from './create-coupon/create-coupon.component';
import { VoucherDetailDialogComponent } from './voucher-detail-dialog/voucher-detail-dialog.component';

@Component({
  selector: 'app-sup-surveylist',
  templateUrl: './sup-surveylist.component.html',
  styleUrls: ['./sup-surveylist.component.css'],
})
export class SupSurveylistComponent implements OnInit {
  surveyList: any[] = [];
  filteredSurveyList: any[] = [];
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  p: number = 0;
  page: number = 1;
  totalPages: any;
  size: number = 10;
  orderBy: any = 'desc';
  sortBy: any = 'id';
  isLoading = false;
  itemPerPage: number = 10;
  totalItems: any;

  constructor(
    private dialog: MatDialog,
    private api: SurveyApiService,
    private adminService: AdminDataService,
    private toastr: ToastrService,
    private router: Router,
    private searchservice: SearchService
  ) {}

  ngOnInit(): void {
    this.loadCoupons();

    this.searchservice.sendResults().subscribe({
      next: (res: any) => {
        if (!res || (Array.isArray(res) && res.length === 0)) {
          this.isLoading = false;
        } else if (res.success) {
          this.isLoading = false;
          this.surveyList = (res.data || []).map((coupon: any) => this.enrichCouponSku(coupon));
          this.applyFilters();
        }
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  loadCoupons() {
    this.isLoading = true;
    this.adminService.getAllCoupouns().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
        this.surveyList = (data || []).map((coupon: any) => this.enrichCouponSku(coupon));
        this.applyFilters();
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Unable to fetch coupons');
        this.surveyList = [];
        this.applyFilters();
      }
    });
  }

  openCreateCoupon(): void {
    const dialogRef = this.dialog.open(CreateCouponComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      // Dialog handles its own API call and closes with true on success
      this.loadCoupons();
    });
  }

  deleteSurvey(coupon: any) {
    const dialogRef = this.dialog.open(DeleteComponent, {
      data: {
        message: `Do you really want to deactivate the records for ${coupon.product_name || coupon.external_product_id} ?`,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.action !== 'ok') return;

      this.adminService.deleteCoupoun(coupon.id).subscribe({
        next: () => {
          this.surveyList = (this.surveyList || []).filter((x: any) => x.id !== coupon.id);
          this.applyFilters();
          this.toastr.success('Coupon deactivated successfully.');
        },
        error: () => {
          this.toastr.error('Failed to deactivate coupon');
        }
      });
    });
  }

  editCoupon(coupon: any) {
    const ref = this.dialog.open(CreateCouponComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: true,
      data: { mode: 'update', coupon }
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      // Dialog handles its own API call and closes with true on success
      this.loadCoupons();
    });
  }

  openViewCoupon(coupon: any) {
    this.dialog.open(VoucherDetailDialogComponent, {
      width: '900px',
      maxHeight: '90vh',
      disableClose: false,
      data: coupon
    });
  }

  pageChangeEvent(event: number) {
    this.page = event;
  }

  onFiltersChanged() {
    this.page = 1;
    this.applyFilters();
  }

  private applyFilters() {
    const keyword = (this.searchTerm || '').trim().toLowerCase();

    this.filteredSurveyList = (this.surveyList || []).filter((item: any) => {
      const status = item?.is_active ? 'active' : 'inactive';
      const statusMatch = this.statusFilter === 'all' || this.statusFilter === status;
      if (!statusMatch) return false;
      if (!keyword) return true;

      const haystack = [
        item?.external_product_id,
        item?.coupon_sku,
        item?.provider_name,
        item?.product_name,
        item?.brand_name,
        item?.category,
        item?.expiry_date
      ]
        .map((x: any) => (x ?? '').toString().toLowerCase())
        .join(' ');

      return haystack.includes(keyword);
    });

    this.totalItems = this.filteredSurveyList.length;
  }

  private getCompanyNameById(companyId: number): string {
    const companies = [
      { id: 1, name: 'Amazon' },
      { id: 2, name: 'Flipkart' },
      { id: 3, name: 'Bata' }
    ];

    return companies.find((company) => company.id === Number(companyId))?.name || 'Unknown';
  }

  private enrichCouponSku(coupon: any) {
    // Normalize API camelCase fields → snake_case used by the template
    const provider_name       = coupon.provider_name       ?? coupon.providerName       ?? '-';
    const product_name        = coupon.product_name        ?? coupon.couponName         ?? coupon.productName ?? '-';
    const brand_name          = coupon.brand_name          ?? coupon.brand?.brandName   ?? '-';
    const categoryRaw         = coupon.category;
    const category            = typeof categoryRaw === 'string'
                                  ? categoryRaw
                                  : (categoryRaw?.categoryName ?? coupon.category_name ?? '-');
    const external_product_id = coupon.external_product_id ?? coupon.externalProductId ?? '';
    const min_value           = coupon.min_value           ?? coupon.minValue           ?? null;
    const max_value           = coupon.max_value           ?? coupon.maxValue           ?? null;
    const discount_percent    = coupon.discount_percent    ?? coupon.discountPercent    ?? null;
    const expiry_date         = coupon.expiry_date
                                  ?? (coupon.expiryDate ? coupon.expiryDate.split('T')[0] : null);
    const is_active           = coupon.is_active !== undefined
                                  ? coupon.is_active
                                  : (coupon.active !== undefined ? coupon.active : true);

    const brandSku    = this.generateBrandSku(brand_name);
    const categoryNo  = this.getCategoryNumber(category);
    const productCode = this.getProductCode(external_product_id);

    return {
      ...coupon,
      provider_name,
      product_name,
      brand_name,
      category,
      external_product_id,
      min_value,
      max_value,
      discount_percent,
      expiry_date,
      is_active,
      brand_sku:  brandSku,
      coupon_sku: coupon.coupon_sku ?? `${brandSku}-${categoryNo}-${productCode}`
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
