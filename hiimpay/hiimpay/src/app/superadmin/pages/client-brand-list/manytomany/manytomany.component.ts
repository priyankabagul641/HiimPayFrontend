import { Component, OnInit, Inject, HostListener, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdminDataService } from '../../../services/adminData.service';

@Component({
  selector: 'app-manytomany',
  templateUrl: './manytomany.component.html',
  styleUrls: ['./manytomany.component.css']
})
export class ManytomanyComponent implements OnInit {
  form: FormGroup;
  companies: Array<{ id: number; name: string }> = [];
  brands: Array<{ id: number; name: string }> = [];
  companyMap: { [key: string]: string } = {};
  brandMap: { [key: string]: string } = {};
  loadingCompanies = false;
  loadingBrands = false;
  companySearch = '';
  brandSearch = '';
  showValidationError = false;
  companyDropdownOpen = false;
  brandDropdownOpen = false;

  @ViewChild('companyDropdown', { static: false }) companyDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('brandDropdown', { static: false }) brandDropdown!: ElementRef<HTMLDivElement>;
  @ViewChild('root', { static: true }) root!: ElementRef<HTMLElement>;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ManytomanyComponent>,
    private adminService: AdminDataService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.form = this.fb.group({
      companies: [[]],
      brands: [[]]
    });
  }

  ngOnInit(): void {
    this.loadCompanies();
    this.loadBrands();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;
    if (this.companyDropdown && !this.companyDropdown.nativeElement.contains(target) && this.companyDropdownOpen) {
      this.companyDropdownOpen = false;
    }
    if (this.brandDropdown && !this.brandDropdown.nativeElement.contains(target) && this.brandDropdownOpen) {
      this.brandDropdownOpen = false;
    }
  }

  loadCompanies() {
    this.loadingCompanies = true;
    this.adminService.getAllCompanies().subscribe({
      next: (res: any) => {
        this.loadingCompanies = false;
        const list = (res && (res.data || res)) ? (res.data || res) : [];
        this.companies = (list || []).map((c: any) => ({ id: c.id, name: c.companyName || c.company_name || c.name || c.contactName || ('Company ' + c.id) }));
        this.companyMap = {};
        this.companies.forEach(c => this.companyMap[String(c.id)] = c.name || ('Company ' + c.id));
      },
      error: () => {
        this.loadingCompanies = false;
        this.companies = [];
      }
    });
  }

  loadBrands() {
    this.loadingBrands = true;
    this.adminService.getAllBrands().subscribe({
      next: (res: any) => {
        this.loadingBrands = false;
        const list = (res && (res.data || res)) ? (res.data || res) : [];
        this.brands = (list || []).map((b: any) => ({ id: b.id, name: b.brandName || b.brand_name || b.name || ('Brand ' + b.id) }));
        this.brandMap = {};
        this.brands.forEach(b => this.brandMap[String(b.id)] = b.name || ('Brand ' + b.id));
      },
      error: () => {
        this.loadingBrands = false;
        this.brands = [];
      }
    });
  }

  get filteredCompanies() {
    const q = (this.companySearch || '').toLowerCase();
    if (!q) return this.companies;
    return this.companies.filter(c => (c.name || '').toLowerCase().includes(q) || String(c.id).includes(q));
  }

  get filteredBrands() {
    const q = (this.brandSearch || '').toLowerCase();
    if (!q) return this.brands;
    return this.brands.filter(b => (b.name || '').toLowerCase().includes(q) || String(b.id).includes(q));
  }

  isCompanySelected(id: number) {
    const list: any[] = this.form.value.companies || [];
    return list.map((v) => Number(v)).includes(Number(id));
  }

  toggleCompany(id: number) {
    const list: any[] = [...(this.form.value.companies || [])].map((v) => Number(v));
    const idx = list.indexOf(Number(id));
    if (idx === -1) list.push(Number(id)); else list.splice(idx, 1);
    this.form.patchValue({ companies: list });
  }

  toggleCompanyDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.companyDropdownOpen = !this.companyDropdownOpen;
    if (this.companyDropdownOpen) this.brandDropdownOpen = false;
  }

  isBrandSelected(id: number) {
    const list: any[] = this.form.value.brands || [];
    return list.map((v) => Number(v)).includes(Number(id));
  }

  toggleBrand(id: number) {
    const list: any[] = [...(this.form.value.brands || [])].map((v) => Number(v));
    const idx = list.indexOf(Number(id));
    if (idx === -1) list.push(Number(id)); else list.splice(idx, 1);
    this.form.patchValue({ brands: list });
  }

  toggleBrandDropdown(event?: MouseEvent) {
    if (event) event.stopPropagation();
    this.brandDropdownOpen = !this.brandDropdownOpen;
    if (this.brandDropdownOpen) this.companyDropdownOpen = false;
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    const selectedCompanies: any[] = (this.form.value.companies || []).map((c: any) => Number(c));
    const selectedBrands: any[] = (this.form.value.brands || []).map((b: any) => Number(b));
    if (!selectedCompanies.length || !selectedBrands.length) {
      this.showValidationError = true;
      return;
    }
    const payload = {
      company: selectedCompanies,
      brands: selectedBrands
    };
    this.dialogRef.close(payload);
  }

  removeCompany(id: number) {
    const list: any[] = (this.form.value.companies || []).map((v: any) => Number(v)).filter((v: any) => v !== Number(id));
    this.form.patchValue({ companies: list });
  }

  removeBrand(id: number) {
    const list: any[] = (this.form.value.brands || []).map((v: any) => Number(v)).filter((v: any) => v !== Number(id));
    this.form.patchValue({ brands: list });
  }
}
