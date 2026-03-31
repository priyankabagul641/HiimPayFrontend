import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../services/companyService';
import { AdminDataService } from '../../../services/adminData.service';
import { ToastrService } from 'ngx-toastr';

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
  walletBalance = 0;
  showCreditForm = false;
  creditAmount: number | null = null;
  creditNotes = '';
  isCreditLoading = false;
  private readonly razorpayKeyId = 'rzp_test_SUgWJosaiMRnFd';
  // interactive UI state
  searchTerm = '';
  page = 1;
  pageSize = 10;
  sortField: keyof WalletTransaction | '' = 'createdAt';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(private projectService: ProjectService, private toastr: ToastrService, private adminDataService: AdminDataService) {}

  ngOnInit(): void {
    this.loadWalletBalance();
    this.loadTransactions();
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

  loadWalletBalance(): void {
    const userId = this.getSessionUserId();
    if (!userId) {
      return;
    }
    this.projectService.getUserWalletById(userId).subscribe({
      next: (res) => {
        this.walletBalance = Number(res?.data?.balance ?? 0);
      },
      error: () => {
        this.walletBalance = 0;
      }
    });
  }

  loadTransactions() {
    this.error = null;
    this.loading = true;
    const userId = this.getSessionUserId();
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
      error: () => {
        this.error = 'Failed to load transactions';
        this.loading = false;
      }
    });
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

  openCreditForm(): void {
    this.creditAmount = null;
    this.creditNotes = '';
    this.showCreditForm = true;
  }

  closeCreditForm(): void {
    this.showCreditForm = false;
  }

  submitCreditWallet(): void {
    const userId = this.getSessionUserId();
    const amount = Number(this.creditAmount);

    if (!userId) {
      this.toastr.error('User not found. Please login again.');
      return;
    }
    if (!amount || amount <= 0) {
      this.toastr.error('Please enter a valid amount.');
      return;
    }

    this.isCreditLoading = true;
    const payload = {
      userId,
      amount,
      walletType: 'EMPLOYEE',
      receipt: `CPOC-WALLET-${Date.now()}`,
      notes: this.creditNotes || 'CPOC wallet top-up'
    };

    this.projectService.createWallet(payload).subscribe({
      next: async (res: any) => {
        const order = res?.data || {};
        const orderId = order?.orderId;
        const amountInPaise = Number(order?.amountInPaise ?? order?.amount ?? 0);
        const keyId = order?.keyId || this.razorpayKeyId;

        if (!orderId || !amountInPaise) {
          this.isCreditLoading = false;
          this.toastr.error('Invalid order response from server.');
          return;
        }

        const loaded = await this.loadRazorpayScript();
        if (!loaded || !(window as any).Razorpay) {
          this.isCreditLoading = false;
          this.toastr.error('Razorpay SDK failed to load.');
          return;
        }

        this.isCreditLoading = false;
        this.showCreditForm = false;

        const options = {
          key: keyId,
          amount: amountInPaise,
          currency: order?.currency || 'INR',
          name: 'HiimPay',
          description: 'CPOC Wallet Credit',
          order_id: orderId,
          handler: (paymentResponse: any) => {
            this.handleWalletPaymentSuccess(paymentResponse, userId, amount);
          },
          modal: {
            ondismiss: () => {
              this.toastr.info('Payment popup closed.');
            }
          },
          notes: {
            userId: String(userId)
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
      },
      error: () => {
        this.isCreditLoading = false;
        this.toastr.error('Failed to create wallet order. Please try again.');
      }
    });
  }

  private handleWalletPaymentSuccess(paymentResponse: any, userId: number, amount: number): void {
    const creditPayload = {
      cpocUserId: userId,
      amount,
      referenceNo: paymentResponse?.razorpay_payment_id || `REF-${Date.now()}`,
      notes: this.creditNotes || 'CPOC wallet top-up',
      razorpayOrderId: paymentResponse?.razorpay_order_id,
      razorpayPaymentId: paymentResponse?.razorpay_payment_id,
      razorpaySignature: paymentResponse?.razorpay_signature
    };

    this.projectService.razorPayWalletRes(creditPayload).subscribe({
      next: () => {
        this.toastr.success('Wallet credited successfully.');
        this.loadWalletBalance();
        this.loadTransactions();
        this.page = 1;
        // refresh and emit latest wallet balance to other components
        try {
          const uid = Number(userId);
          if (!isNaN(uid)) {
            console.debug('WallwtCpocComponent calling refreshCpocWalletBalance for', uid);
            this.adminDataService.refreshCpocWalletBalance(uid);
          }
        } catch {}
      },
      error: () => {
        this.toastr.error('Payment captured, but wallet credit failed.');
      }
    });
  }

  private loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
}
