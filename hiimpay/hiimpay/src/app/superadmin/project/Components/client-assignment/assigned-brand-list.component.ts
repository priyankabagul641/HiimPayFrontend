import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/companyService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assigned-brand-list',
  templateUrl: './assigned-brand-list.component.html',
  styleUrls: ['./assigned-brand-list.component.css']
})
export class AssignedBrandListComponent implements OnInit {
  activeTab: 'coupons' | 'amounts' = 'coupons';
  couponRows: any[] = [];
  amountRows: any[] = [];
  companyId: number = 0;

  constructor(private router: Router, private service: ProjectService, private toastr: ToastrService) {}

  ngOnInit(): void {
    const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData')!);
    this.companyId = userData?.companyId;

    const couponAssignmentsRaw = sessionStorage.getItem('clientBrandCouponAssignments');
    const couponAssignments = couponAssignmentsRaw ? JSON.parse(couponAssignmentsRaw) : [];

    this.couponRows = couponAssignments.flatMap((item: any) => {
      const brands = Array.isArray(item.brands) ? item.brands : [];
      return brands.map((brand: any) => ({
        assignmentId: item.id,
        assignedDate: item.assignedDate,
        brandName: brand?.name || '-',
        brandId: brand?.id || '',
        coupons: item.coupons || [],
        employees: item.employees || []
      }));
    });

    this.loadAmountRows();
  }

  loadAmountRows() {
    this.service.assignRewardsByCompanyID(this.companyId).subscribe({
      next: (res: any) => {
        this.amountRows = (res.data || []).map((item: any) => {
          const a = item.assignment || item;
          return {
            assignmentId: a.id,
            assignedDate: new Date(a.assignedDate || a.createdAt),
            source: a.mode || 'MANUAL',
            amount: a.amount,
            employeeCount: item.employeeCount ?? 0,
            assignedByName: a.assignedBy?.fullName || '-',
            fileName: a.fileUrl || a.notes || '-'
          };
        });
      },
      error: (err: any) => console.error('loadAmountRows error:', err)
    });
  }

  openDetails(item: { assignmentId: string }, type: 'coupon' | 'amount') {
    this.router.navigate(
      ['superadmin/project', sessionStorage.getItem('ClientId'), 'assigned-brands', item.assignmentId],
      { queryParams: { type } }
    );
  }

  downloadAssignmentReport(item: any, type: 'coupon' | 'amount') {
    if (type === 'amount') {
      this.service.assignExcelDowloadByCompanyID(item.assignmentId).subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `assignment_${item.assignmentId}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err: any) => {
          console.error('Download error:', err);
          this.toastr.error('Failed to download report.');
        }
      });
    } else {
      this.openDetails(item, type);
    }
  }
}
