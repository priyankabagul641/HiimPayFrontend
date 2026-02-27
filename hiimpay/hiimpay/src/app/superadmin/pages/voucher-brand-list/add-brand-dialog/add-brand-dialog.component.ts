import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { AdminDataService } from '../../../services/adminData.service';
import { ToastrService } from 'ngx-toastr';

type TabType = 'excel' | 'api';
type OnboardingType = 'EXCEL' | 'API';
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
  selector: 'app-add-brand-dialog',
  templateUrl: './add-brand-dialog.component.html',
  styleUrls: ['./add-brand-dialog.component.scss']
})
export class AddBrandDialogComponent implements OnInit {

  activeTab: TabType = 'api';

  brand: {
    onboardingType: OnboardingType;
    BrandProductCode: string;
    BrandName: string;
    Brandtype: string;
    RedemptionType: string;
    OnlineRedemptionUrl: string;
    BrandImage: string;
    denominationList: string;
    MinValue: number | null;
    MaxValue: number | null;
    DenomType: string;
    stockAvailable: boolean;
    Category: string[];
    Descriptions: string;
    tnc: string;
    importantInstruction: string;
    redeemSteps: Record<string, { text: string; image: string }>;
    EpayMinValue: number;
    EpayMaxValue: number;
    EpayDiscount: number;
    sku: string;
  } = {
    onboardingType: 'EXCEL',
    BrandProductCode: '',
    BrandName: '',
    Brandtype: 'VOUCHER',
    RedemptionType: '2',
    OnlineRedemptionUrl: '',
    BrandImage: '',
    denominationList: '',
    MinValue: null,
    MaxValue: null,
    DenomType: 'F',
    stockAvailable: true,
    Category: [],
    Descriptions: '',
    tnc: '',
    importantInstruction: '',
    redeemSteps: {
      '1': { text: '', image: '' },
      '2': { text: '', image: '' },
      '3': { text: '', image: '' }
    },
    EpayMinValue: 0,
    EpayMaxValue: 0,
    EpayDiscount: 0
    ,
    sku: ''
  };

  categories = ['Food & Beverages', 'Lifestyle', 'E-Commerce', 'Fashion', 'Electronics'];

  // Provider dropdown (loaded from getapi())
  providerNames: string[] = [];
  selectedProviderName = '';
  providerEndpointsMap = new Map<string, any[]>();

  // Displayed endpoint cards (auth section)
  apiEndpoints: ApiEndpointConfig[] = [];
  pullInProgress = false;
  pullMessage = '';
  lastPulledAt = '';
  isSaving = false;

  constructor(
    private dialogRef: MatDialogRef<AddBrandDialogComponent>,
    private adminService: AdminDataService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadApiProfiles();
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
      type: (ep.endpointType || '').toLowerCase().includes('auth') ? 'auth' : 'auth',
      method: (ep.method === 'GET' || ep.method === 'POST') ? ep.method : 'POST',
      url: ep.url || '',
      apiKey: ep.apiKey || '',
      requestSecret: ep.requestSecret || ''
    }));
    this.pullMessage = '';
  }

  get isSkuValid(): boolean {
    return true;
  }

  switchTab(tab: TabType) {
    this.activeTab = tab;
    if (tab === 'excel') this.brand.onboardingType = 'EXCEL';
    if (tab === 'api') this.brand.onboardingType = 'API';
  }

  toggleCategory(cat: string) {
    const i = this.brand.Category.indexOf(cat);
    i >= 0
      ? this.brand.Category.splice(i, 1)
      : this.brand.Category.push(cat);
  }

  onFileSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) console.log('Excel selected:', file.name);
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

  save() {
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
          this.toastr.success(res?.message || 'Brand synced successfully.');
          this.dialogRef.close(true);
        } else {
          this.toastr.error(res?.message || 'Failed to sync brand.');
        }
      },
      error: (err: any) => {
        this.isSaving = false;
        console.error('save brand error:', err);
        this.toastr.error(err?.error?.message || 'Failed to sync brand.');
      }
    });
  }

  close() {
    this.dialogRef.close();
  }
}