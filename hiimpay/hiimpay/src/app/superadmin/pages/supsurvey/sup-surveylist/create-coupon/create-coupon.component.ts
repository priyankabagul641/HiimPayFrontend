import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminDataService } from '../../../../services/adminData.service';
import { ToastrService } from 'ngx-toastr';

type TabType = 'manual' | 'excel' | 'api';
type ApiEndpointType = 'auth' | 'data';

interface ApiEndpointConfig {
  endpointType: string;
  name: string;
  type: ApiEndpointType;
  method: 'GET' | 'POST';
  url: string;
  apiKey: string;
  requestSecret: string;
}

@Component({
  selector: 'app-create-coupon',
  templateUrl: './create-coupon.component.html',
  styleUrls: ['./create-coupon.component.css']
})
export class CreateCouponComponent implements OnInit {

  activeTab: TabType = 'manual';
  couponForm: FormGroup;
  manualCode = false;
  title: string = 'Create Coupon';
  today: string = new Date().toISOString().split('T')[0];

  // Real data from APIs
  brands: any[] = [];
  categoriesList: any[] = [];

  // Provider dropdown (loaded from getapi())
  providerNames: string[] = [];
  selectedProviderName = '';
  providerEndpointsMap = new Map<string, any[]>();
  apiEndpoints: ApiEndpointConfig[] = [];
  pullMessage = '';
  isSaving = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateCouponComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminDataService,
    private toastr: ToastrService
  ) {
    this.couponForm = this.fb.group({
      brandId:        [null, Validators.required],
      categoryId:     [null, Validators.required],
      productName:    ['', Validators.required],
      couponCode:     ['', Validators.required],
      serialNo:       [null],
      description:    [''],
      providerName:   [''],
      discountPercent:[null, [Validators.required, Validators.min(0), Validators.max(100)]],
      minValue:       [null],
      maxValue:       [null],
      denominations:  [''],
      currencyCode:   ['INR'],
      countryCode:    ['IN'],
      redemptionType: ['ONLINE', Validators.required],
      expiryDate:     ['', Validators.required],
      imageUrl:       ['']
    });
  }

  ngOnInit(): void {
    this.generateCode();
    this.loadBrands();
    this.loadCategories();
    this.loadApiProfiles();

    // If dialog was opened with coupon data (for edit), patch form
    if (this.data && this.data.mode === 'update' && this.data.coupon) {
      const c = this.data.coupon;
      this.couponForm.patchValue({
        brandId:        c.brand?.id || null,
        categoryId:     c.category?.id || null,
        productName:    c.couponName || c.productName || '',
        couponCode:     c.couponCode || '',
        description:    c.description || '',
        providerName:   c.providerName || '',
        discountPercent:c.discountPercent || null,
        minValue:       c.minValue || null,
        maxValue:       c.maxValue || null,
        denominations:  c.denominations || '',
        currencyCode:   c.currencyCode || 'INR',
        countryCode:    c.countryCode || 'IN',
        redemptionType: c.redemptionType || 'ONLINE',
        expiryDate:     c.expiryDate ? c.expiryDate.split('T')[0] : '',
        imageUrl:       c.imageUrl || ''
      });
      this.title = 'Update Coupon';
    }
  }

  loadBrands() {
    this.adminService.getAllBrand().subscribe({
      next: (res: any) => { this.brands = res?.data || []; },
      error: (err: any) => console.error('loadBrands error:', err)
    });
  }

  loadCategories() {
    this.adminService.getAllCategory().subscribe({
      next: (res: any) => { this.categoriesList = res?.data || []; },
      error: (err: any) => console.error('loadCategories error:', err)
    });
  }

  switchTab(tab: TabType) {
    this.activeTab = tab;
  }

  toggleManual() {
    this.manualCode = !this.manualCode;
    if (!this.manualCode) {
      this.generateCode();
    }
  }

  generateCode() {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.couponForm.patchValue({ couponCode: `CPN-${rand}` });
  }

  onPosterChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      // Store filename/object reference
      this.couponForm.patchValue({ imageUrl: file.name });
    }
  }

  onExcelSelect(event: any) {
    const file = event.target.files?.[0];
    console.log('Excel file:', file);
  }

  loadApiProfiles() {
    this.adminService.getapi().subscribe({
      next: (res: any) => {
        const allEndpoints: any[] = (res.data || []).flatMap((item: any) => item.endpoints || [item].filter((e: any) => e.endpointType));
        const map = new Map<string, any[]>();
        for (const ep of allEndpoints) {
          const provName: string = ep.integration?.providerName || 'Unknown';
          if (!map.has(provName)) map.set(provName, []);
          map.get(provName)!.push(ep);
        }
        this.providerEndpointsMap = map;
        this.providerNames = Array.from(map.keys());
        if (this.providerNames.length) {
          this.onProviderChange(this.providerNames[0]);
        }
      },
      error: (err: any) => console.error('loadApiProfiles error:', err)
    });
  }

  onProviderChange(providerName: string) {
    this.selectedProviderName = providerName;
    const endpoints = this.providerEndpointsMap.get(providerName) || [];
    this.apiEndpoints = endpoints.map((ep: any) => ({
      endpointType: ep.endpointType || '',
      name: ep.endpointName || '',
      type: 'auth' as ApiEndpointType,
      method: (ep.method === 'GET' || ep.method === 'POST') ? ep.method : 'POST',
      url: ep.url || '',
      apiKey: ep.apiKey || '',
      requestSecret: ep.requestSecret || ''
    }));
    this.pullMessage = '';
  }

  addEndpoint(type: ApiEndpointType) {
    this.apiEndpoints.push({
      endpointType: type === 'auth' ? 'AUTH' : 'DATA',
      name: type === 'auth' ? 'Auth Endpoint' : 'Data Endpoint',
      type,
      method: type === 'auth' ? 'POST' : 'GET',
      url: '',
      apiKey: '',
      requestSecret: ''
    });
  }

  removeEndpoint(index: number) {
    this.apiEndpoints.splice(index, 1);
  }

  saveApiSetup() {
    if (!this.selectedProviderName) {
      this.toastr.error('Please select an API provider.');
      return;
    }
    this.isSaving = true;
    const provider = this.selectedProviderName.toLowerCase();
    let call$;
    if (provider.includes('xoxoday')) {
      call$ = this.adminService.createxoxoday({});
    } else if (provider.includes('humble')) {
      call$ = this.adminService.createmyhumble({});
    } else if (provider.includes('gyftr')) {
      call$ = this.adminService.creategyftr({});
    } else {
      call$ = this.adminService.createxoxoday({});
    }
    call$.subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res?.success !== false) {
          this.toastr.success(res?.message || 'Coupons synced successfully.');
          this.dialogRef.close(true);
        } else {
          this.toastr.error(res?.message || 'Failed to sync coupons.');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('saveApiSetup error:', err);
        this.toastr.error(err?.error?.message || 'Failed to sync coupons.');
      }
    });
  }

  submit() {
    if (this.couponForm.invalid) {
      this.couponForm.markAllAsTouched();
      return;
    }
    const form = this.couponForm.value;

    // Validate expiry date is not in the past
    if (form.expiryDate && form.expiryDate < this.today) {
      this.toastr.error('Expiry date cannot be in the past.');
      return;
    }

    const payload: any = {
      productCode:        form.couponCode,
      sku:                form.couponCode,
      serialNo:           form.serialNo || null,
      externalProductId:  `EXT-${form.couponCode}`,
      providerName:       form.providerName || '',
      productName:        form.productName,
      brand:              { id: form.brandId },
      category:           { id: form.categoryId },
      description:        form.description || '',
      imageUrl:           form.imageUrl || '',
      discountPercent:    form.discountPercent,
      minValue:           form.minValue || 0,
      maxValue:           form.maxValue || 0,
      redemptionType:     form.redemptionType,
      denominations:      form.denominations || '',
      currencyCode:       form.currencyCode || 'INR',
      countryCode:        form.countryCode || 'IN',
      expiryDate:         form.expiryDate ? new Date(form.expiryDate).toISOString() : '',
      active:             true
    };

    const isUpdate = this.data?.mode === 'update' && this.data?.coupon?.id;
    const call$ = isUpdate
      ? this.adminService.updateCoupoun(this.data.coupon.id, payload)
      : this.adminService.createCoupoun(payload);

    call$.subscribe({
      next: (res: any) => {
        if (res?.success !== false) {
          this.toastr.success(res?.message || (isUpdate ? 'Coupon updated successfully.' : 'Coupon created successfully.'));
          this.dialogRef.close(true);
        } else {
          this.toastr.error(res?.message || 'Operation failed.');
        }
      },
      error: (err: any) => {
        console.error('submit error:', err);
        this.toastr.error(err?.error?.message || 'Failed to save coupon.');
      }
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
