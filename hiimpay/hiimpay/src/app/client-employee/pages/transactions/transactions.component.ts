import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { EmployeeService } from '../../Services/userDataService';
import { CartService } from '../../Services/cart.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent implements OnInit, OnDestroy {
  transactions: any[] = [];
  visibleTransactions: any[] = [];
  page = 1;
  pageSize = 10;
  total = 0;
  loading = false;
  selected = new Set<number>();
  sub?: Subscription;

  constructor(
    private employeeService: EmployeeService,
    private cartService: CartService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private loadTransactions(): void {
    try {
      const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}');
      const userId = userData?.id || 0;
      if (!userId) {
        this.toastr.error('User not found.');
        return;
      }

      this.loading = true;
      this.sub = this.employeeService.getUserTransactionsById(userId).subscribe({
        next: (res: any) => {
          this.transactions = res?.data || [];
          this.total = this.transactions.length;
          this.page = 1;
          this.updateVisible();
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          console.error('Transactions API error', err);
          this.toastr.error('Failed to load transactions');
        }
      });
    } catch (e) {
      this.toastr.error('Could not read user data');
    }
  }

  private updateVisible(): void {
    const start = (this.page - 1) * this.pageSize;
    this.visibleTransactions = this.transactions.slice(start, start + this.pageSize);
  }

  changePage(p: number): void {
    if (p < 1) return;
    const max = Math.ceil(this.total / this.pageSize);
    if (p > max) return;
    this.page = p;
    this.updateVisible();
  }

  toggleSelectAll(checked: boolean): void {
    if (checked) {
      this.visibleTransactions.forEach((t) => this.selected.add(t.id));
    } else {
      this.visibleTransactions.forEach((t) => this.selected.delete(t.id));
    }
  }

  toggleSelect(transaction: any): void {
    if (this.selected.has(transaction.id)) this.selected.delete(transaction.id);
    else this.selected.add(transaction.id);
  }

  isSelected(transaction: any): boolean {
    return this.selected.has(transaction.id);
  }

  downloadRow(transaction: any, event?: Event): void {
    if (event?.preventDefault) event.preventDefault();
    const url = transaction?.invoiceUrl || transaction?.invoice_url || transaction?.data?.invoiceUrl || null;
    if (!url) {
      this.toastr.error('Invoice not available for this transaction');
      return;
    }
    this.cartService.downloadUrl(url);
  }

  downloadSelected(): void {
    const ids = Array.from(this.selected);
    if (ids.length === 0) {
      this.toastr.info('No transactions selected');
      return;
    }

    let downloaded = 0;
    ids.forEach((id) => {
      const tx = this.transactions.find((t) => t.id === id);
      const url = tx?.invoiceUrl || tx?.invoice_url || tx?.data?.invoiceUrl || null;
      if (url) {
        this.cartService.downloadUrl(url);
        downloaded++;
      }
    });

    if (downloaded === 0) this.toastr.warning('Selected transactions have no invoices');
    else this.toastr.success(`Triggered download for ${downloaded} invoice(s)`);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
}
