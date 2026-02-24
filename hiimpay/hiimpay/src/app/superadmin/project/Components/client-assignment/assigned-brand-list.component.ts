import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assigned-brand-list',
  templateUrl: './assigned-brand-list.component.html',
  styleUrls: ['./assigned-brand-list.component.css']
})
export class AssignedBrandListComponent implements OnInit {
  activeTab: 'coupons' | 'amounts' = 'coupons';
  couponRows: any[] = [];
  amountRows: any[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    const couponAssignmentsRaw = sessionStorage.getItem('clientBrandCouponAssignments');
    const couponAssignments = couponAssignmentsRaw ? JSON.parse(couponAssignmentsRaw) : [];
    const amountAssignmentsRaw = sessionStorage.getItem('clientAmountAssignments');
    const amountAssignments = amountAssignmentsRaw ? JSON.parse(amountAssignmentsRaw) : [];

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

    this.amountRows = amountAssignments.map((item: any) => ({
      assignmentId: item.id,
      assignedDate: item.assignedDate,
      source: item.source || 'MANUAL',
      amount: item.amount,
      fileName: item.fileName || '-',
      employees: item.employees || []
    }));
  }

  openDetails(item: { assignmentId: string }, type: 'coupon' | 'amount') {
    this.router.navigate(
      ['superadmin/project', sessionStorage.getItem('ClientId'), 'assigned-brands', item.assignmentId],
      { queryParams: { type } }
    );
  }

  downloadAssignmentReport(item: { assignmentId: string }, type: 'coupon' | 'amount') {
    // Placeholder hook: replace this navigation with actual excel download implementation.
    this.openDetails(item, type);
  }
}
