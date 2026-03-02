import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/companyService';

@Component({
  selector: 'app-brand-coupon-assignment',
  templateUrl: './brand-coupon-assignment.component.html',
  styleUrls: ['./brand-coupon-assignment.component.css']
})
export class BrandCouponAssignmentComponent implements OnInit {
  activeTab: 'coupon' | 'amount' = 'coupon';
  amountEntryMode: 'manual' | 'excel' = 'manual';

  brands: any[] = [];
  coupons: any[] = [];
  employees: any[] = [];

  selectedBrands: any[] = [];
  selectedCoupons: any[] = [];
  selectedEmployees: any[] = [];
  selectedAmountEmployees: any[] = [];

  brandDropdownSettings: any = {};
  couponDropdownSettings: any = {};
  employeeDropdownSettings: any = {};

  notes = '';
  amountValue: number | null = null;
  amountNotes = '';
  amountExcelFileName = '';
  amountExcelFile: File | null = null;
  companyId: number = 0;
  currentUserId: number = 0;
  isAssigningAmount = false;

  constructor(private toastr: ToastrService, private service: ProjectService) {}

  ngOnInit(): void {
    const userData = JSON.parse(sessionStorage.getItem('ClientId')!);
    console.log('Loaded userData from sessionStorage:', userData);
    this.companyId = userData;
    
    const currentUser = JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}');
    this.currentUserId = currentUser?.id || 0;

    this.brands = [
      { id: 'B1', name: 'Amazon' },
      { id: 'B2', name: 'Bata' },
      { id: 'B3', name: 'Flipkart' }
    ];

    this.coupons = [
      { id: 'C1', name: 'WELCOME10' },
      { id: 'C2', name: 'FESTIVE500' },
      { id: 'C3', name: 'SUPER20' }
    ];

    this.loadEmployees();

    const common = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.brandDropdownSettings = { ...common };
    this.couponDropdownSettings = { ...common };
    this.employeeDropdownSettings = { ...common };
  }

  loadEmployees() {
    this.service.clientByCompanyID(this.companyId).subscribe({
      next: (res: any) => {
        this.employees = (res.data || []).map((u: any) => ({
          id: u.id,
          name: u.fullName
        }));
      },
      error: (err: any) => console.error('loadEmployees error:', err)
    });
  }

  assignCouponNow() {
    if (
      this.selectedBrands.length === 0 ||
      this.selectedCoupons.length === 0 ||
      this.selectedEmployees.length === 0
    ) {
      this.toastr.error('Please select at least one brand, coupon and employee.');
      return;
    }

    const assignmentsRaw = sessionStorage.getItem('clientBrandCouponAssignments');
    const assignments = assignmentsRaw ? JSON.parse(assignmentsRaw) : [];

    const payload = {
      id: Date.now().toString(),
      clientId: sessionStorage.getItem('ClientId'),
      brands: this.selectedBrands,
      coupons: this.selectedCoupons,
      employees: this.selectedEmployees,
      notes: this.notes,
      assignedDate: new Date().toISOString(),
      assignedBy: JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}')?.id || ''
    };

    assignments.unshift(payload);
    sessionStorage.setItem('clientBrandCouponAssignments', JSON.stringify(assignments));
    this.toastr.success('Brand and coupon assigned successfully.');

    this.selectedBrands = [];
    this.selectedCoupons = [];
    this.selectedEmployees = [];
    this.notes = '';
  }

  onAmountExcelSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0] || null;
    this.amountExcelFile = file;
    this.amountExcelFileName = file?.name || '';
  }

  assignAmountNow() {
    if (this.amountEntryMode === 'manual') {
      if (this.selectedAmountEmployees.length === 0 || !this.amountValue || this.amountValue <= 0) {
        this.toastr.error('Please select employees and enter a valid amount.');
        return;
      }
    } else {
      if (!this.amountExcelFile) {
        this.toastr.error('Please upload an Excel file to assign amounts.');
        return;
      }
      if (!this.amountValue || this.amountValue <= 0) {
        this.toastr.error('Please enter a valid amount.');
        return;
      }

      const excelObj = {
        companyId: this.companyId,
        assignedByUserId: this.currentUserId,
        amount: Number(this.amountValue),
        file: this.amountExcelFile
      };

      const formData = new FormData();
      Object.entries(excelObj).forEach((val) => {
        formData.append(val[0], val[1] as any);
      });

      this.isAssigningAmount = true;
      this.service.addDataWithExcel(formData).subscribe({
        next: (res: any) => {
          this.isAssigningAmount = false;
          if (res?.success) {
            this.toastr.success(res.message || 'Amount assigned successfully via Excel.');
            this.amountExcelFile = null;
            this.amountExcelFileName = '';
            this.amountValue = null;
            this.amountNotes = '';
          } else {
            this.toastr.error(res?.message || 'Failed to assign amount via Excel.');
          }
        },
        error: (err: any) => {
          this.isAssigningAmount = false;
          console.error('assignAmountNow (excel) error:', err);
          this.toastr.error('Error uploading Excel. Please try again.');
        }
      });
      return;
    }

    const obj = {
      userIds: this.selectedAmountEmployees.map((e: any) => e.id),
      amount: Number(this.amountValue),
      referenceNo: `REF-${Date.now()}`,
      notes: this.amountNotes,
      companyId: this.companyId,
      assignedByUserId: this.currentUserId,
      mode: 'Manual',
      fileUrl: ''
    };

    this.isAssigningAmount = true;
    this.service.ASsignBrandToCompany(obj).subscribe({
      next: (res: any) => {
        this.isAssigningAmount = false;
        if (res?.success) {
          this.toastr.success(res.message || 'Amount assigned successfully.');
          this.selectedAmountEmployees = [];
          this.amountValue = null;
          this.amountNotes = '';
          this.amountExcelFileName = '';
        } else {
          this.toastr.error(res?.message || 'Failed to assign amount.');
        }
      },
      error: (err: any) => {
        this.isAssigningAmount = false;
        console.error('assignAmountNow error:', err);
        this.toastr.error('Error assigning amount. Please try again.');
      }
    });
  }
}
