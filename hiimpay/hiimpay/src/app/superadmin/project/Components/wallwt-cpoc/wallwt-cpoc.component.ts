import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/companyService';

interface WalletTransaction {
  id: number;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  referenceNo?: string;
  notes?: string;
  createdAt: string;
}

@Component({
  selector: 'app-wallwt-cpoc',
  templateUrl: './wallwt-cpoc.component.html',
  styleUrl: './wallwt-cpoc.component.css'
})
export class WallwtCpocComponent implements OnInit {
  transactions: WalletTransaction[] = [];
  loading = false;
  error: string | null = null;
  // interactive UI state
  searchTerm = '';
  page = 1;
  pageSize = 10;
  sortField: keyof WalletTransaction | '' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions() {
    this.error = null;
    this.loading = true;
    try {
      const raw = sessionStorage.getItem('currentLoggedInUserData');
      const user = raw ? JSON.parse(raw) : null;
      const userId = user?.id ?? user?.userId ?? null;
      if (!userId) {
        this.error = 'User not found in session storage';
        this.loading = false;
        return;
      }

      this.projectService.getWalletById(userId).subscribe({
        next: (res) => {
          this.transactions = Array.isArray(res?.data) ? res.data : [];
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load transactions';
          this.loading = false;
        }
      });
    } catch (e) {
      this.error = 'Failed to parse session user';
      this.loading = false;
    }
  }

  get filteredTransactions(): WalletTransaction[] {
    let arr = this.transactions.slice();
    if (this.searchTerm && this.searchTerm.trim()) {
      const q = this.searchTerm.trim().toLowerCase();
      arr = arr.filter(t => `${t.transactionType} ${t.referenceNo ?? ''} ${t.notes ?? ''}`.toLowerCase().includes(q));
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

  toggleSort(field: keyof WalletTransaction) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'desc';
    }
    this.page = 1;
  }
}
