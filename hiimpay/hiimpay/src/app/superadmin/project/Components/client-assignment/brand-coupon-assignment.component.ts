import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProjectService } from '../../services/companyService';

@Component({
  selector: 'app-brand-coupon-assignment',
  templateUrl: './brand-coupon-assignment.component.html',
  styleUrls: ['./brand-coupon-assignment.component.css']
})
export class BrandCouponAssignmentComponent implements OnInit {
  activeTab: 'assign' | 'history' = 'assign';
  amountEntryMode: 'manual' | 'excel' = 'manual';

  employees: any[] = [];

  selectedAmountEmployees: any[] = [];

  employeeDropdownSettings: any = {};

  amountValue: number | null = null;
  amountNotes = '';
  amountExcelFileName = '';
  amountExcelFile: File | null = null;
  companyId: number = 0;
  currentUserId: number = 0;
  isAssigningAmount = false;
  isDownloadingTemplate = false;

  // Assignment History
  assignmentHistory: any[] = [];
  historyLoading = false;
  historyPage = 0;
  historyPageSize = 10;
  historyTotalItems = 0;
  selectedHistoryIds = new Set<number>();
  downloadingIds = new Set<number>();
  isDownloadingMulti = false;

  constructor(private toastr: ToastrService, private service: ProjectService) {}

  ngOnInit(): void {
    const userData = JSON.parse(sessionStorage.getItem('ClientId')!);
    this.companyId = userData;

    const currentUser = JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}');
    this.currentUserId = currentUser?.id || 0;

    this.loadEmployees();
    this.loadAssignmentHistory();

    this.employeeDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'Unselect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  setActiveTab(tab: 'assign' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history') {
      this.loadAssignmentHistory();
    }
  }

  loadAssignmentHistory(): void {
    if (!this.companyId) return;
    this.historyLoading = true;
    this.service.assignRewardsByCompanyID(this.companyId).subscribe({
      next: (res: any) => {
        const raw: any[] = Array.isArray(res?.data) ? res.data : [];
        this.historyTotalItems = raw.length;
        this.assignmentHistory = raw.map((item: any) => {
          const a = item.assignment || {};
          return {
            id: a.id,
            assignedBy: a.assignedBy?.fullName || '-',
            assignedDate: a.assignedDate || a.createdAt,
            mode: a.mode || '-',
            amount: a.amount ?? 0,
            notes: a.notes || '',
            employeeCount: item.employeeCount ?? 0
          };
        });
        this.historyLoading = false;
      },
      error: () => {
        this.assignmentHistory = [];
        this.historyLoading = false;
        this.toastr.error('Failed to load assignment history.');
      }
    });
  }

  get pagedHistory(): any[] {
    const start = this.historyPage * this.historyPageSize;
    return this.assignmentHistory.slice(start, start + this.historyPageSize);
  }

  get historyTotalPages(): number {
    return Math.max(1, Math.ceil(this.historyTotalItems / this.historyPageSize));
  }

  get historyPages(): number[] {
    return Array.from({ length: this.historyTotalPages }, (_, i) => i);
  }

  goToHistoryPage(page: number): void {
    if (page < 0 || page >= this.historyTotalPages) return;
    this.historyPage = page;
  }

  toggleHistorySelection(id: number): void {
    if (this.selectedHistoryIds.has(id)) {
      this.selectedHistoryIds.delete(id);
    } else {
      this.selectedHistoryIds.add(id);
    }
  }

  get isAllPageSelected(): boolean {
    return this.pagedHistory.length > 0 && this.pagedHistory.every(r => this.selectedHistoryIds.has(r.id));
  }

  toggleSelectAllPage(): void {
    if (this.isAllPageSelected) {
      this.pagedHistory.forEach(r => this.selectedHistoryIds.delete(r.id));
    } else {
      this.pagedHistory.forEach(r => this.selectedHistoryIds.add(r.id));
    }
  }

  downloadReport(id: number): void {
    this.downloadingIds.add(id);
    this.service.assignExcelDowloadByCompanyID(id).subscribe({
      next: (blob: Blob) => {
        this.downloadingIds.delete(id);
        this.saveBlob(blob, `assignment-report-${id}.xlsx`);
      },
      error: () => {
        this.downloadingIds.delete(id);
        this.toastr.error('Failed to download report.');
      }
    });
  }

  downloadSelectedReports(): void {
    const ids = Array.from(this.selectedHistoryIds);
    if (ids.length === 0) {
      this.toastr.error('Please select at least one record to download.');
      return;
    }
    this.isDownloadingMulti = true;
    let completed = 0;
    ids.forEach(id => {
      this.service.assignExcelDowloadByCompanyID(id).subscribe({
        next: (blob: Blob) => {
          this.saveBlob(blob, `assignment-report-${id}.xlsx`);
          completed++;
          if (completed === ids.length) {
            this.isDownloadingMulti = false;
            this.toastr.success(`Downloaded ${ids.length} report(s).`);
          }
        },
        error: () => {
          completed++;
          if (completed === ids.length) {
            this.isDownloadingMulti = false;
          }
          this.toastr.error(`Failed to download report #${id}.`);
        }
      });
    });
  }

  private saveBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
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

  downloadAmountTemplate() {
    this.isDownloadingTemplate = true;
    this.service.getDownloadFileUrl().subscribe({
      next: (res: any) => {
        this.isDownloadingTemplate = false;
        const url = res?.data;
        if (url) {
          const a = document.createElement('a');
          a.href = url;
          a.download = 'reward-amount-assign-template.xlsx';
          a.target = '_blank';
          a.click();
        } else {
          this.toastr.error('Template URL not available.');
        }
      },
      error: (err: any) => {
        this.isDownloadingTemplate = false;
        this.toastr.error('Failed to download template.');
        console.error('downloadAmountTemplate error:', err);
      }
    });
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
            this.loadAssignmentHistory();
          } else {
            this.toastr.error(res?.message || 'Failed to assign amount via Excel.');
          }
        },
        error: (err: any) => {
          this.isAssigningAmount = false;
          console.error('assignAmountNow (excel) error:', err);
          this.toastr.error(err?.error?.message || 'Error uploading Excel. Please try again.');
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
          this.loadAssignmentHistory();
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
