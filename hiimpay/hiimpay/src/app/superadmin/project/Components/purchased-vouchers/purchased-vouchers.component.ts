import { Component, OnInit } from '@angular/core';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';
import { CpocCartService } from '../../services/cpoc-cart.service';
import { ProjectService } from '../../services/companyService';

@Component({
  selector: 'app-purchased-vouchers',
  templateUrl: './purchased-vouchers.component.html',
  styleUrls: ['./purchased-vouchers.component.css']
})
export class PurchasedVouchersComponent implements OnInit {
  vouchers: any[] = [];
  loading = false;
  error: string | null = null;
  searchTerm = '';
  activeTab: 'vouchers' | 'history' = 'vouchers';
  showAssignModal = false;
  employees: any[] = [];
  selectedEmployees: any[] = [];
  employeeDropdownSettings: IDropdownSettings = {};
  voucherDropdownSettings: IDropdownSettings = {};
  voucherOptions: any[] = [];
  selectedVoucherOption: any[] = [];
  selectedVoucher: any | null = null;
  assignQuantity = 1;
  assignNotes = '';
  isAssigning = false;
  assignedCoupons: any[] = [];

  private cpocUserId: number | null = null;
  private companyId: number | null = null;
  private readonly assignmentStorageKey = 'cpocVoucherAssignments';

  constructor(
    private cpocCart: CpocCartService,
    private projectService: ProjectService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.cpocUserId = this.getSessionUserId();
    this.companyId = this.getCompanyId();
    this.employeeDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 3,
      allowSearchFilter: true,
      enableCheckAll: true
    };
    this.voucherDropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      allowSearchFilter: true,
      closeDropDownOnSelection: true,
      enableCheckAll: false,
      itemsShowLimit: 1
    };
    this.loadEmployees();
    this.loadAssignmentHistory();
    this.loadPurchasedVouchers();
  }

  setActiveTab(tab: 'vouchers' | 'history'): void {
    this.activeTab = tab;
  }

  loadPurchasedVouchers(): void {
    if (!this.cpocUserId) {
      this.error = 'User not found. Please login again.';
      return;
    }
    this.loading = true;
    this.error = null;
    this.cpocCart.getPurchasedVouchers(this.cpocUserId).subscribe({
      next: (res: any) => {
        const raw: any[] = Array.isArray(res?.data) ? res.data : [];
        this.vouchers = raw.map(item => {
          const stock = item.stock || item;
          const brand = stock.brand || {};
          return {
            id: stock.id,
            voucherId: stock.voucherId,
            brandName: brand.brandName || `Voucher #${stock.voucherId}`,
            brandImage: brand.brandImage || '',
            discountPercent: Number(brand.epayDiscount ?? 0),
            purchasedQuantity: Number(stock.purchasedQuantity ?? 0),
            availableQuantity: Number(stock.availableQuantity ?? 0),
            purchaseDate: stock.createdAt || null,
            redemptionUrl: brand.onlineRedemptionUrl || '',
            description: brand.description || '',
            serviceType: brand.serviceType || brand.brandType || '',
            minValue: Number(brand.epayMinValue ?? 0),
            maxValue: Number(brand.epayMaxValue ?? 0),
          };
        });
        this.voucherOptions = this.vouchers.map(voucher => ({
          id: voucher.voucherId,
          name: `${voucher.brandName} (${voucher.availableQuantity} available)`,
        }));
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load purchased vouchers.';
        this.loading = false;
      }
    });
  }

  loadEmployees(): void {
    if (!this.companyId) {
      this.employees = [];
      return;
    }

    this.projectService.clientByCompanyID(this.companyId).subscribe({
      next: (res: any) => {
        this.employees = (Array.isArray(res?.data) ? res.data : []).map((employee: any) => ({
          id: employee.id,
          name: employee.fullName,
          email: employee.email,
          userType: employee.userType
        }));
      },
      error: () => {
        this.employees = [];
        this.toastr.error('Failed to load employees.');
      }
    });
  }

  startAssign(voucher: any): void {
    this.selectedVoucher = voucher;
    this.selectedVoucherOption = voucher
      ? [{ id: voucher.voucherId, name: `${voucher.brandName} (${voucher.availableQuantity} available)` }]
      : [];
    this.assignQuantity = voucher.availableQuantity > 0 ? 1 : 0;
    this.selectedEmployees = [];
    this.assignNotes = '';
    this.showAssignModal = true;
  }

  openAssignModal(): void {
    this.resetAssignForm();
    this.showAssignModal = true;
  }

  closeAssignModal(): void {
    this.showAssignModal = false;
    this.resetAssignForm();
  }

  onVoucherSelectionChange(): void {
    const selectedId = this.selectedVoucherOption[0]?.id;
    this.selectedVoucher = this.vouchers.find(voucher => voucher.voucherId === selectedId) || null;
    this.assignQuantity = this.selectedVoucher && this.selectedVoucher.availableQuantity > 0 ? 1 : 0;
  }

  submitAssignment(): void {
    if (!this.selectedVoucher) {
      this.toastr.error('Please select a voucher to assign.');
      return;
    }

    if (this.selectedEmployees.length === 0) {
      this.toastr.error('Please select at least one employee.');
      return;
    }

    if (!this.assignQuantity || this.assignQuantity < 1) {
      this.toastr.error('Please enter a valid quantity.');
      return;
    }

    if (this.assignQuantity > Number(this.selectedVoucher.availableQuantity || 0)) {
      this.toastr.error('Assigned quantity cannot exceed available quantity.');
      return;
    }

    if (!this.cpocUserId) {
      this.toastr.error('User not found. Please login again.');
      return;
    }

    const payload = {
      cpocUserId: this.cpocUserId,
      voucherId: this.selectedVoucher.voucherId,
      quantity: Number(this.assignQuantity),
      userIds: this.selectedEmployees.map(employee => employee.id),
      referenceNo: `ASSIGN-${Date.now()}`,
      notes: this.assignNotes || `Assigned ${this.selectedVoucher.brandName} vouchers`
    };

    this.isAssigning = true;
    this.cpocCart.assignVouchers(payload).subscribe({
      next: (res: any) => {
        this.isAssigning = false;
        if (res?.success === false) {
          this.toastr.error(res?.message || 'Voucher assignment failed.');
          return;
        }

        this.appendAssignmentHistory(payload.referenceNo);
        this.updateVoucherAvailability();
        this.toastr.success(res?.message || 'Vouchers assigned successfully.');
        this.activeTab = 'history';
        this.closeAssignModal();
      },
      error: (err: any) => {
        this.isAssigning = false;
        const msg = err?.error?.message || err?.message || 'Voucher assignment failed. Please try again.';
        this.toastr.error(msg);
      }
    });
  }

  private appendAssignmentHistory(referenceNo: string): void {
    if (!this.selectedVoucher) {
      return;
    }

    const createdAt = new Date().toISOString();
    const rows = this.selectedEmployees.map(employee => ({
      id: `${referenceNo}-${employee.id}`,
      referenceNo,
      voucherName: this.selectedVoucher.brandName,
      voucherId: this.selectedVoucher.voucherId,
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email || '',
      quantity: this.assignQuantity,
      assignedAt: createdAt,
      notes: this.assignNotes,
      status: 'Assigned'
    }));

    this.assignedCoupons = [...rows, ...this.assignedCoupons];
    sessionStorage.setItem(this.assignmentStorageKey, JSON.stringify(this.assignedCoupons));
  }

  private updateVoucherAvailability(): void {
    if (!this.selectedVoucher) {
      return;
    }

    const selectedVoucherId = this.selectedVoucher.voucherId;
    this.vouchers = this.vouchers.map(voucher => {
      if (voucher.voucherId !== selectedVoucherId) {
        return voucher;
      }

      const availableQuantity = Math.max(0, Number(voucher.availableQuantity || 0) - Number(this.assignQuantity || 0));
      return {
        ...voucher,
        availableQuantity
      };
    });
  }

  private resetAssignForm(): void {
    this.selectedVoucher = null;
    this.selectedVoucherOption = [];
    this.selectedEmployees = [];
    this.assignQuantity = 1;
    this.assignNotes = '';
  }

  private loadAssignmentHistory(): void {
    try {
      const raw = sessionStorage.getItem(this.assignmentStorageKey);
      this.assignedCoupons = raw ? JSON.parse(raw) : [];
    } catch {
      this.assignedCoupons = [];
    }
  }

  get filteredVouchers(): any[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) return this.vouchers;
    return this.vouchers.filter(v =>
      (v.brandName || '').toLowerCase().includes(q)
    );
  }

  get totalBrands(): number {
    return this.vouchers.length;
  }

  get totalPurchased(): number {
    return this.vouchers.reduce((s, v) => s + v.purchasedQuantity, 0);
  }

  get totalAvailable(): number {
    return this.vouchers.reduce((s, v) => s + v.availableQuantity, 0);
  }

  get totalVouchers(): number {
    return this.totalPurchased;
  }

  get totalSpent(): number {
    return this.vouchers.reduce((sum, voucher) => sum + (voucher.minValue * voucher.purchasedQuantity), 0);
  }

  get totalSaved(): number {
    return this.vouchers.reduce((sum, voucher) => {
      const minValue = Number(voucher.minValue || 0);
      const discountPercent = Number(voucher.discountPercent || 0);
      const purchasedQuantity = Number(voucher.purchasedQuantity || 0);
      const savingsPerVoucher = minValue * (discountPercent / 100);
      return sum + (savingsPerVoucher * purchasedQuantity);
    }, 0);
  }

  get canAssign(): boolean {
    return Boolean(this.selectedVoucher && Number(this.selectedVoucher.availableQuantity || 0) > 0);
  }

  get filteredAssignedCoupons(): any[] {
    const q = this.searchTerm.trim().toLowerCase();
    if (!q) {
      return this.assignedCoupons;
    }

    return this.assignedCoupons.filter(item =>
      (item.voucherName || '').toLowerCase().includes(q) ||
      (item.employeeName || '').toLowerCase().includes(q) ||
      (item.referenceNo || '').toLowerCase().includes(q)
    );
  }

  openRedemption(url: string): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  private getSessionUserId(): number | null {
    try {
      const raw = sessionStorage.getItem('currentLoggedInUserData');
      const user = raw ? JSON.parse(raw) : null;
      return user?.id ?? user?.userId ?? null;
    } catch {
      return null;
    }
  }

  private getCompanyId(): number | null {
    try {
      const raw = sessionStorage.getItem('ClientId');
      return raw ? Number(JSON.parse(raw)) || Number(raw) : null;
    } catch {
      const raw = sessionStorage.getItem('ClientId');
      return raw ? Number(raw) : null;
    }
  }
}
