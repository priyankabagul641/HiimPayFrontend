import { Component, OnInit } from '@angular/core';
import { AdminDataService } from '../../services/adminData.service';

interface AdminTransaction {
  id: number;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  referenceNo?: string;
  notes?: string;
  transactionId?: string;
  paidVia?: string;
  status?: string;
  createdAt: string;
  companyName?: string;
}

@Component({
  selector: 'app-walletbalance',
  templateUrl: './walletbalance.component.html',
  styleUrls: ['./walletbalance.component.css']
})
export class WalletbalanceComponent implements OnInit {
  transactions: AdminTransaction[] = [];
  loading = false;
  error: string | null = null;

  // UI state
  searchTerm = '';
  page = 1;
  pageSize = 10;
  sortField: keyof AdminTransaction | '' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private adminService: AdminDataService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions() {
    this.loading = true;
    this.error = null;
    this.adminService.getAllTransactions().subscribe({
      next: (res: any) => {
        const data = res?.data || [];
        this.transactions = data.map((item: any) => {
          const tx = item.transaction || item;
          return {
            id: tx.id,
            transactionType: tx.transactionType,
            amount: tx.amount,
            balanceAfter: tx.balanceAfter,
            referenceNo: tx.referenceNo,
            transactionId: tx.transactionId || tx.txnId || tx.referenceId || tx.transactionReference || tx.tranId,
            paidVia: tx.paidVia || tx.paymentMode || tx.paymentMethod || tx.paid_via,
            status: tx.status || tx.transactionStatus || tx.state,
            notes: tx.notes,
            createdAt: tx.createdAt,
            companyName: item.companyName || tx.companyName || ''
          } as AdminTransaction;
        });
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load transactions';
        this.loading = false;
      }
    });
  }

  get filteredTransactions(): AdminTransaction[] {
    let arr = this.transactions.slice();
    if (this.searchTerm && this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      arr = arr.filter(t => `${t.transactionType} ${t.referenceNo ?? ''} ${t.notes ?? ''} ${t.companyName ?? ''}`.toLowerCase().includes(q));
    }
    if (this.sortField) {
      arr.sort((a, b) => {
        const va: any = (a as any)[this.sortField!];
        const vb: any = (b as any)[this.sortField!];
        if (va == null) return 1;
        if (vb == null) return -1;
        if (this.sortDirection === 'asc') return va > vb ? 1 : va < vb ? -1 : 0;
        return va < vb ? 1 : va > vb ? -1 : 0;
      });
    } else {
      arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return arr;
  }

  toggleSort(field: keyof AdminTransaction) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.page = 1;
  }

  get totalItems(): number {
    return this.filteredTransactions.length;
  }

  getPageUpperBound(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  pageChangeEvent(event: number) {
    this.page = event;
  }
}
