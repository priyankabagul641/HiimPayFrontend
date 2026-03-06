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
        message: `Do you really want to deactivate the records for ${coupon.product_name || coupon.external_product_id || coupon.sku} ?`,
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result || result.action !== 'ok') return;

      this.adminService.deleteCoupoun(coupon.id).subscribe({
        next: () => {
          // reload list from server to reflect soft-delete changes
          this.loadCoupons();
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
        item?.sku,
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

  private enrichCouponSku(coupon: any) {
    // Map all fields from API response to normalized names for templates
    
    // Core product info
    const sku                 = coupon.sku ?? '';
    const provider_name       = coupon.providerName ?? '-';
    const product_name        = coupon.productName ?? '-';
    const brand_name          = coupon.brandName ?? coupon.brand?.brandName ?? '-';
    
    // Brand details
    const brand_type          = coupon.brand?.brandType ?? '-';
    const service_type        = coupon.serviceType ?? coupon.brand?.serviceType ?? '-';
    
    // Pricing & values
    const min_value           = coupon.minValue ?? coupon.brand?.epayMinValue ?? null;
    const max_value           = coupon.maxValue ?? coupon.brand?.epayMaxValue ?? null;
    const discount_percent    = coupon.discountPercent ?? coupon.brand?.epayDiscount ?? null;
    
    // Redemption & expiry
    const redemption_type     = coupon.redemptionType ?? coupon.brand?.redemptionType ?? '-';
    const expiry_date         = coupon.expiryDate ? coupon.expiryDate.split('T')[0] : null;
    const is_active           = coupon.active !== undefined ? coupon.active : true;
    
    // Product identifiers
    const external_product_id = coupon.externalProductId ?? '';
    const product_code        = coupon.productCode ?? '';
    
    // Category
    const categoryRaw         = coupon.category;
    const category            = typeof categoryRaw === 'string'
                                  ? categoryRaw
                                  : (categoryRaw?.categoryName ??  '-');
    
    // Parse denominations: convert string to array if needed
    let denominations = coupon.denominations ?? [];
    if (typeof denominations === 'string') {
      denominations = denominations.split(',').map((d: string) => d.trim());
    }

    // Parse terms & conditions from tnc field
    const terms_conditions = coupon.tnc ? [coupon.tnc] : coupon.brand?.tnc ? [coupon.brand.tnc] : [];
    
    // Extract redemption steps from importantInstruction
    const redeem_steps = coupon.importantInstruction ? [coupon.importantInstruction] : (coupon.brand?.importantInstruction ? [coupon.brand.importantInstruction] : []);

    const description = coupon.description ?? coupon.brand?.description ?? '-';

    return {
      ...coupon,
      sku,
      provider_name,
      product_name,
      brand_name,
      brand_type,
      service_type,
      category,
      external_product_id,
      product_code,
      min_value,
      max_value,
      discount_percent,
      redemption_type,
      expiry_date,
      is_active,
      denominations,
      terms_conditions,
      redeem_steps,
      description,
      coupon_sku: sku
    };
  }
}
