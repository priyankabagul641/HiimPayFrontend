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

      const payload: any = {
        couponCode: result.code || null,
        externalProductId: `EXT-${Date.now()}`,
        providerName: 'GYFTR',
        couponName: result.title || result.code || 'Voucher',
        brand: {
          id: result.companyId || 0,
          brandName: this.getCompanyNameById(result.companyId)
        },
        category: {
          categoryName: result.category || 'Lifestyle'
        },
        description: result.title ? `${result.title} voucher` : 'Voucher description',
        imageUrl: typeof result.poster === 'string' ? result.poster : (result.poster ? result.poster.name : ''),
        discountType: result.discountType || 'Percentage',
        discountValue: Number(result.discountValue || 0),
        minOrderValue: Number(result.minPurchase || 0),
        validFrom: result.startDate || null,
        validTo: result.expiryDate || null,
        isActive: true
      };

      this.adminService.createCoupoun(payload).subscribe({
        next: (res: any) => {
          const created = (res && res.data) ? res.data : res;
          const obj = Array.isArray(created) ? created[0] : created;
          if (obj) {
            this.surveyList = [this.enrichCouponSku(obj), ...(this.surveyList || [])];
            this.applyFilters();
            this.toastr.success('Coupon created successfully');
          } else {
            this.toastr.success('Coupon created');
            this.loadCoupons();
          }
        },
        error: () => {
          this.toastr.error('Failed to create coupon');
        }
      });
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

      const id = result.id || coupon.id;
      const payload: any = {
        couponCode: result.code || coupon.couponCode || coupon.coupon_sku,
        externalProductId: coupon.externalProductId || coupon.external_product_id || `EXT-${Date.now()}`,
        providerName: coupon.providerName || coupon.provider_name || 'GYFTR',
        couponName: result.title || coupon.couponName || coupon.product_name,
        brand: {
          id: result.companyId || coupon.brand?.id || 0,
          brandName: this.getCompanyNameById(result.companyId || coupon.brand?.id)
        },
        category: { categoryName: result.category || coupon.category?.categoryName || coupon.category },
        description: result.title || coupon.description || '',
        imageUrl: typeof result.poster === 'string' ? result.poster : (result.poster ? result.poster.name : coupon.imageUrl || ''),
        discountType: result.discountType || coupon.discountType,
        discountValue: Number(result.discountValue || coupon.discountValue || coupon.discount_percent || 0),
        minOrderValue: Number(result.minPurchase || coupon.minOrderValue || 0),
        validFrom: result.startDate || coupon.validFrom || null,
        validTo: result.expiryDate || coupon.validTo || coupon.expiry_date || null,
        isActive: coupon.is_active !== undefined ? coupon.is_active : (coupon.isActive !== undefined ? coupon.isActive : true)
      };

      this.adminService.updateCoupoun(id, payload).subscribe({
        next: (res: any) => {
          const updated = (res && res.data) ? res.data : res;
          const obj = Array.isArray(updated) ? updated[0] : updated;
          if (obj) {
            const idx = this.surveyList.findIndex((c) => c.id === id || c.id === obj.id);
            if (idx >= 0) this.surveyList[idx] = this.enrichCouponSku({ ...this.surveyList[idx], ...obj });
            else this.surveyList = [this.enrichCouponSku(obj), ...(this.surveyList || [])];
            this.applyFilters();
            this.toastr.success('Coupon updated successfully');
          } else {
            this.toastr.success('Coupon updated');
            this.loadCoupons();
          }
        },
        error: () => {
          this.toastr.error('Failed to update coupon');
        }
      });
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
