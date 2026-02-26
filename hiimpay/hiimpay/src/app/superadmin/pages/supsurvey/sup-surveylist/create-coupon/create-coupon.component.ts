import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

type TabType = 'manual' | 'excel' | 'api';
type ApiEndpointType = 'auth' | 'data';

interface ApiEndpointConfig {
  name: string;
  type: ApiEndpointType;
  method: 'GET' | 'POST';
  url: string;
  apiKey: string;
  requestSecret: string;
}

interface ApiProfile {
  id: string;
  name: string;
  description: string;
  endpoints: ApiEndpointConfig[];
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

  companies = [
    { id: 1, name: 'Amazon' },
    { id: 2, name: 'Flipkart' }
  ];
  categories: string[] = ['E-Commerce', 'Food', 'Fashion', 'Travel', 'Electronics', 'Lifestyle'];
  apiSample = `POST /api/coupons
Content-Type: application/json

{
  "brand": "Amazon",
  "title": "Festival Offer",
  "code": "AMZ50",
  "discountType": "PERCENTAGE",
  "discountValue": 50
}`;
  apiProfiles: ApiProfile[] = [
    {
      id: 'gyftr_v1',
      name: 'GyFTR - v1',
      description: 'Token based flow for coupon sync and management.',
      endpoints: [
        { name: 'Get Token', type: 'auth', method: 'GET', url: '/API/v1/gettoken', apiKey: '', requestSecret: '' },
        { name: 'Get Coupons', type: 'data', method: 'POST', url: '/API/v1/getcoupons', apiKey: '', requestSecret: '' }
      ]
    },
    {
      id: 'pine_labs_v2',
      name: 'Pine Labs - v2',
      description: 'OAuth authentication followed by coupon catalog sync.',
      endpoints: [
        { name: 'OAuth Token', type: 'auth', method: 'POST', url: '/oauth/token', apiKey: '', requestSecret: '' },
        { name: 'Get Coupon Catalog', type: 'data', method: 'GET', url: '/v2/catalog/coupons', apiKey: '', requestSecret: '' }
      ]
    },
    {
      id: 'woohoo_v3',
      name: 'Woohoo - v3',
      description: 'API key and secret based partner coupon integration.',
      endpoints: [
        { name: 'Partner Auth', type: 'auth', method: 'POST', url: '/partner/authenticate', apiKey: '', requestSecret: '' },
        { name: 'Fetch Coupons', type: 'data', method: 'GET', url: '/partner/coupons', apiKey: '', requestSecret: '' }
      ]
    }
  ];
  selectedApiProfileId = this.apiProfiles[0].id;
  selectedApiProfileDescription = this.apiProfiles[0].description;
  apiEndpoints: ApiEndpointConfig[] = this.cloneEndpoints(this.apiProfiles[0].endpoints);
  pullInProgress = false;
  pullMessage = '';
  lastPulledAt = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateCouponComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.couponForm = this.fb.group({
      companyId: [this.companies[0].id, Validators.required],
      poster: [null],
      title: ['', Validators.required],
      code: ['', Validators.required],
      category: ['', Validators.required],
      discountType: ['Percentage', Validators.required],
      discountValue: [null, Validators.required],
      minPurchase: [null],
      startDate: ['', Validators.required],
      expiryDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.generateCode();
    this.couponForm.patchValue({ category: this.categories[0] });

    // If dialog was opened with coupon data (for edit), patch form
    if (this.data && this.data.mode === 'update' && this.data.coupon) {
      const c = this.data.coupon;
      this.couponForm.patchValue({
        companyId: c.brand?.id || this.companies[0].id,
        title: c.couponName || c.product_name || c.title || '',
        code: c.couponCode || c.coupon_sku || c.code || '',
        category: c.category?.categoryName || c.category || '',
        discountType: (c.discountType || (c.discount_percent ? 'Percentage' : 'Amount')) || 'Percentage',
        discountValue: c.discountValue || c.discountAmount || c.discount_percent || null,
        minPurchase: c.minOrderValue || null,
        startDate: c.validFrom ? c.validFrom : '',
        expiryDate: c.validTo || c.expiryDate || ''
      });
      // If poster is image URL, keep it as string in poster control
      if (c.imageUrl) {
        this.couponForm.patchValue({ poster: c.imageUrl });
      }
      this.title = 'Update Coupon';
    }
  }

  switchTab(tab: TabType) {
    this.activeTab = tab;
    if (tab === 'api') {
      this.onApiProfileChange(this.selectedApiProfileId);
    }
  }

  toggleManual() {
    this.manualCode = !this.manualCode;
    if (!this.manualCode) {
      this.generateCode();
    }
  }

  generateCode() {
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.couponForm.patchValue({ code: `CPN-${rand}` });
  }

  onPosterChange(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.couponForm.patchValue({ poster: file });
    }
  }

  onExcelSelect(event: any) {
    const file = event.target.files?.[0];
    console.log('Excel file:', file);
  }

  onApiProfileChange(profileId: string) {
    const profile = this.apiProfiles.find((item) => item.id === profileId);
    if (!profile) {
      return;
    }
    this.selectedApiProfileId = profile.id;
    this.selectedApiProfileDescription = profile.description;
    this.apiEndpoints = this.cloneEndpoints(profile.endpoints);
    this.pullMessage = '';
  }

  addEndpoint(type: ApiEndpointType) {
    this.apiEndpoints.push({
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

  pullFromApi() {
    if (!this.apiEndpoints.length) {
      this.pullMessage = 'Add at least one endpoint before pulling data.';
      return;
    }

    this.pullInProgress = true;
    this.pullMessage = 'Pulling coupon data from API...';

    setTimeout(() => {
      this.pullInProgress = false;
      this.lastPulledAt = new Date().toISOString();
      this.pullMessage = `Pull completed successfully at ${new Date(this.lastPulledAt).toLocaleString()}.`;
    }, 900);
  }

  saveApiSetup() {
    this.dialogRef.close({
      activeTab: 'api',
      apiIntegration: {
        profileId: this.selectedApiProfileId,
        endpoints: this.apiEndpoints,
        lastPulledAt: this.lastPulledAt
      }
    });
  }

  submit() {
    if (this.couponForm.invalid) return;
    const payload = this.couponForm.value;
    // when in update mode, include original id so parent can call update
    if (this.data && this.data.mode === 'update' && this.data.coupon) {
      payload.id = this.data.coupon.id;
    }
    this.dialogRef.close(payload);
  }

  cancel() {
    this.dialogRef.close();
  }

  private cloneEndpoints(endpoints: ApiEndpointConfig[]): ApiEndpointConfig[] {
    return endpoints.map((endpoint) => ({ ...endpoint }));
  }
}
