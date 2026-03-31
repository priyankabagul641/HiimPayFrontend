import { Component, OnInit, Inject, HostListener, ViewChild, ElementRef } from '@angular/core';
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

  @ViewChild('brandDropdownRef') brandDropdownRef!: ElementRef;

  activeTab: TabType = 'manual';
  couponForm: FormGroup;
  manualCode = false;
  title: string = 'Create Coupon';
  today: string = new Date().toISOString().split('T')[0];

  // Real data from APIs
  brands: any[] = [];
  filteredBrands: any[] = [];
  brandSearchTerm = '';
  dropdownSearchTerm = '';
  showBrandDropdown = false;
  highlightedIndex = -1;
  selectedBrandId: any = null;
  selectedBrandOnboardingType = '';
  categoriesList: any[] = [];
  filteredCategories: any[] = [];

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
      description:    [''],
      discountPercent:[null, [Validators.required, Validators.min(0), Validators.max(100)]],
      minValue:       [null, [Validators.min(0)]],
      maxValue:       [null, [Validators.min(0)]],
      denominations:  ['', [this.noNegativeNumbersValidator.bind(this)]],
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
      const selectedBrand = this.brands.find((b: any) => b.id === c.brand?.id);
      if (selectedBrand) {
        this.brandSearchTerm = selectedBrand.brandName;
        this.selectedBrandId = selectedBrand.id;
      }
      this.couponForm.patchValue({
        brandId:        c.brand?.id || null,
        categoryId:     c.category?.id || null,
        productName:    c.productName || '',
        couponCode:     c.productCode || '',
        description:    c.description || '',
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
      next: (res: any) => {
        this.brands = res?.data || [];
        this.filteredBrands = [...this.brands];

        // Keep validation in sync when brand is preselected (edit mode).
        const preselectedBrandId = this.couponForm.get('brandId')?.value;
        if (preselectedBrandId && !this.selectedBrandOnboardingType) {
          const preselectedBrand = this.brands.find((b: any) => b.id === preselectedBrandId);
          if (preselectedBrand) {
            this.selectedBrandOnboardingType = (preselectedBrand.onboardingType || preselectedBrand.OnboardingType || '').toString().toUpperCase();
            this.applyCategoryValidatorByOnboardingType(this.selectedBrandOnboardingType);
          }
        }
      },
      error: (err: any) => console.error('loadBrands error:', err)
    });
  }

  filterBrands(searchTerm: string) {
    this.brandSearchTerm = searchTerm;
    if (!searchTerm.trim()) {
      this.filteredBrands = this.brands;
    } else {
      const query = searchTerm.toLowerCase();
      this.filteredBrands = this.brands.filter((brand: any) =>
        brand.brandName?.toLowerCase().includes(query) ||
        brand.brandProductCode?.toLowerCase().includes(query)
      );
    }
  }

  selectBrand(brand: any) {
    this.couponForm.patchValue({ brandId: brand.id });
    this.brandSearchTerm = brand.brandName;
    this.selectedBrandId = brand.id;
    this.selectedBrandOnboardingType = (brand.onboardingType || brand.OnboardingType || '').toString().toUpperCase();
    this.applyCategoryValidatorByOnboardingType(this.selectedBrandOnboardingType);
    this.showBrandDropdown = false;
    this.dropdownSearchTerm = '';
    this.highlightedIndex = -1;
    this.onBrandChange();
  }

  isCategoryRequired(): boolean {
    return (this.selectedBrandOnboardingType || '').toUpperCase() !== 'MANUAL';
  }

  private applyCategoryValidatorByOnboardingType(onboardingType: string): void {
    const categoryCtrl = this.couponForm.get('categoryId');
    if (!categoryCtrl) return;

    if ((onboardingType || '').toUpperCase() === 'MANUAL') {
      categoryCtrl.clearValidators();
    } else {
      categoryCtrl.setValidators([Validators.required]);
    }
    categoryCtrl.updateValueAndValidity({ emitEvent: false });
  }

  toggleBrandDropdown() {
    this.showBrandDropdown = !this.showBrandDropdown;
    if (this.showBrandDropdown) {
      // Ensure brands are loaded and display all of them
      this.filteredBrands = [...this.brands];
      this.dropdownSearchTerm = '';
      this.highlightedIndex = -1;
      // Set highlighted to first item if any
      if (this.filteredBrands.length > 0) {
        this.highlightedIndex = 0;
      }
    }
  }

  filterBrandsInDropdown(searchTerm: string) {
    this.dropdownSearchTerm = searchTerm;
    if (!searchTerm || !searchTerm.trim()) {
      this.filteredBrands = [...this.brands];
    } else {
      const query = searchTerm.toLowerCase();
      this.filteredBrands = this.brands.filter((brand: any) => {
        const brandName = brand.brandName ? brand.brandName.toLowerCase() : '';
        const productCode = brand.brandProductCode ? brand.brandProductCode.toLowerCase() : '';
        return brandName.includes(query) || productCode.includes(query);
      });
    }
    this.highlightedIndex = this.filteredBrands.length > 0 ? 0 : -1;
  }

  onDropdownKeydown(event: KeyboardEvent) {
    if (!this.showBrandDropdown) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (this.highlightedIndex < this.filteredBrands.length - 1) {
          this.highlightedIndex++;
        }
        break;

      case 'ArrowUp':
        event.preventDefault();
        if (this.highlightedIndex > 0) {
          this.highlightedIndex--;
        }
        break;

      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredBrands.length) {
          this.selectBrand(this.filteredBrands[this.highlightedIndex]);
        }
        break;

      case 'Escape':
        event.preventDefault();
        this.showBrandDropdown = false;
        break;
    }
  }

  isItemHighlighted(index: number): boolean {
    return index === this.highlightedIndex;
  }

  isItemSelected(brandId: any): boolean {
    return brandId === this.selectedBrandId || brandId === this.couponForm.get('brandId')?.value;
  }

  onBrandSearchFocus() {
    this.showBrandDropdown = true;
    // Initialize dropdown with all brands
    this.filteredBrands = [...this.brands];
    this.dropdownSearchTerm = '';
    this.highlightedIndex = this.filteredBrands.length > 0 ? 0 : -1;
  }

  onDropdownSearchFocus() {
    this.showBrandDropdown = true;
  }

  onDropdownClick(event: MouseEvent) {
    event.stopPropagation();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.brandDropdownRef) {
      const isClickInsideDropdown = this.brandDropdownRef.nativeElement.contains(event.target);
      if (!isClickInsideDropdown && this.showBrandDropdown) {
        this.showBrandDropdown = false;
      }
    }
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

  // Custom validator to prevent negative numbers in denominations string
  noNegativeNumbersValidator(control: any) {
    if (!control.value) return null;
    const denominations = control.value.toString().split(',').map((d: string) => d.trim());
    const hasNegative = denominations.some((d: string) => {
      const num = parseFloat(d);
      return isNaN(num) || num < 0;
    });
    return hasNegative ? { negativeNumbers: true } : null;
  }

  // Helper method to check if min value is negative
  isMinValueNegative(): boolean {
    const minValue = this.couponForm.get('minValue')?.value;
    return minValue !== null && minValue !== undefined && minValue < 0;
  }

  // Helper method to check if max value is negative
  isMaxValueNegative(): boolean {
    const maxValue = this.couponForm.get('maxValue')?.value;
    return maxValue !== null && maxValue !== undefined && maxValue < 0;
  }

  // Helper method to check if discount is negative
  isDiscountNegative(): boolean {
    const discount = this.couponForm.get('discountPercent')?.value;
    return discount !== null && discount !== undefined && discount < 0;
  }

  onBrandChange() {
    const selectedBrandId = this.couponForm.get('brandId')?.value;
    if (selectedBrandId) {
      const selectedBrand = this.brands.find((b: any) => b.id === selectedBrandId);
      this.selectedBrandOnboardingType = (selectedBrand?.onboardingType || selectedBrand?.OnboardingType || '').toString().toUpperCase();
      this.applyCategoryValidatorByOnboardingType(this.selectedBrandOnboardingType);

      // Call API to get categories for the selected brand
      this.adminService.getCategoryByCoupounId(selectedBrandId).subscribe({
        next: (res: any) => {
          const categoryData = res?.data || {};
          const categoryNames = Object.keys(categoryData);
          
          if (categoryNames.length > 0) {
            // Create category objects from the response keys and extract categoryId from items
            this.filteredCategories = categoryNames.map((name: string) => {
              const items = categoryData[name] || [];
              // Extract the actual categoryId from the first item in the category array
              const categoryId = items.length > 0 ? items[0].categoryId : null;
              return {
                id: categoryId, // Use actual categoryId (numeric ID)
                categoryName: name // Display name
              };
            });
            // Auto-select first category
            this.couponForm.patchValue({ categoryId: this.filteredCategories[0].id });
          } else {
            // If no categories, show Uncategorized
            this.filteredCategories = [
              { id: null, categoryName: 'Uncategorized' }
            ];
            this.couponForm.patchValue({ categoryId: null });
          }
        },
        error: (err: any) => {
          console.error('getCategoryByCoupounId error:', err);
          // Fallback to Uncategorized on error
          this.filteredCategories = [
            { id: null, categoryName: 'Uncategorized' }
          ];
          this.couponForm.patchValue({ categoryId: null });
          this.toastr.warning('Could not fetch categories, showing Uncategorized');
        }
      });
    } else {
      this.selectedBrandOnboardingType = '';
      this.applyCategoryValidatorByOnboardingType(this.selectedBrandOnboardingType);
      this.filteredCategories = [];
      this.couponForm.patchValue({ categoryId: null });
    }
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
        // Add siripay as static provider
        // if (!this.providerNames.includes('siripay')) {
        //   this.providerNames.push('siripay');
        // }
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
    } else if (provider.includes('siripay')) {
      call$ = this.adminService.createsiripay({});
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

    // Validate no negative values for discount
    if (form.discountPercent < 0) {
      this.toastr.error('Discount % cannot be negative.');
      return;
    }

    // Validate no negative values for min value
    if (form.minValue && form.minValue < 0) {
      this.toastr.error('Min Value cannot be negative.');
      return;
    }

    // Validate no negative values for max value
    if (form.maxValue && form.maxValue < 0) {
      this.toastr.error('Max Value cannot be negative.');
      return;
    }

    // Validate no negative values in denominations
    if (form.denominations) {
      const denominations = form.denominations.toString().split(',').map((d: string) => d.trim());
      const hasNegative = denominations.some((d: string) => {
        const num = parseFloat(d);
        return isNaN(num) || num < 0;
      });
      if (hasNegative) {
        this.toastr.error('Denominations cannot contain negative values.');
        return;
      }
    }

    const payload: any = {
      productCode:        form.couponCode,
      sku:                form.couponCode,
      serialNo:           0,
      externalProductId:  `EXT-${form.couponCode}`,
      providerName:       "",
      productName:        form.productName,
      brand:              { id: form.brandId },
      category:           form.categoryId ? { id: form.categoryId } : null,
      description:        form.description || '',
      imageUrl:           form.imageUrl || '',
      redemptionType:     form.redemptionType,
      denominations:      form.denominations || '',
      minValue:           form.minValue || 0,
      maxValue:           form.maxValue || 0,
      discountPercent:    form.discountPercent,
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
