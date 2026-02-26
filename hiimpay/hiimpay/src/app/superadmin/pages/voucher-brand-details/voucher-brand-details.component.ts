import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminDataService } from '../../services/adminData.service';

interface Brand {
  BrandName: string;
  OnlineRedemptionUrl: string;
  BrandImage: string;
  stockAvailable: boolean;
  categories: string[];
  Descriptions: string;
  updated_at: string;
}

@Component({
  selector: 'app-brand-details',
  templateUrl: './brand-details.component.html',
  styleUrls: ['./brand-details.component.css']
})
export class BrandDetailsComponent implements OnInit {
  loading = true;
  brand: Brand = {
    BrandName: '',
    OnlineRedemptionUrl: '',
    BrandImage: '',
    stockAvailable: false,
    categories: [],
    Descriptions: '',
    updated_at: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
    , private adminService: AdminDataService
  ) {}

  ngOnInit(): void {
    const navState: any = window.history.state && window.history.state.brand ? window.history.state.brand : null;
    const id = this.route.snapshot.paramMap.get('id');

    if (navState) {
      const data = navState;
      console.log('BrandDetailsComponent: received nav state', data);
      this.mapBrand(data);
      this.loading = false;
    } else {
      this.loadBrandDetails(id);
    }
  }

  loadBrandDetails(id: string | null) {
    if (!id) { this.loading = false; return; }
    this.loading = true;
    this.adminService.getBrandById(id).subscribe({
      next: (res: any) => {
        const data = (res && res.data) ? res.data : res;
        this.mapBrand(data);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  private mapBrand(data: any) {
    // map API fields to local shape
    this.brand = {
      BrandName: data.brandName || data.BrandName || data.name || '',
      OnlineRedemptionUrl: data.onlineRedemptionUrl || data.OnlineRedemptionUrl || '',
      BrandImage: data.brandImage || data.BrandImage || '',
      stockAvailable: data.stockAvailable ?? data.stock_available ?? true,
      categories: data.categories || data.categoryList || [],
      Descriptions: data.description || data.Descriptions || '',
      updated_at: data.updatedAt || data.updated_at || ''
    };
  }

  back() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
