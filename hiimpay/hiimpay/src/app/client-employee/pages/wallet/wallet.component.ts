import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientEmployeeComponent } from '../../client-employee.component';
import { EmployeeService } from '../../Services/userDataService';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../Services/cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wallet-page',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit, OnDestroy {
  showCreditForm = false;
  creditAmount: number | null = null;
  creditNotes = '';
  isCreditLoading = false;
  walletCurrentPage = 1;
  tableCurrentPage = 1;
  readonly pageSize = 8;
  // Transaction table state
  tableTransactions: any[] = [];
  pageSizeOptions = [10, 25, 50];
  pageSizeTable = 10;
  tableTotal = 0;
  loadingTransactions = false;
  selected = new Set<number>();
  selectAllOnPage = false;
  sortKey: string | null = null;
  sortDir: 'asc' | 'desc' = 'asc';
  private sub?: Subscription;
  private readonly razorpayKeyId = 'rzp_test_SUgWJosaiMRnFd';

  constructor(
    public shell: ClientEmployeeComponent,
    private employeeService: EmployeeService,
    private toastr: ToastrService
    , private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.pageSizeTable = 10;
    this.loadTransactions();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  get totalCredited(): number {
    return this.shell.walletTransactions
      .filter(tx => tx.type === 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  get totalDebited(): number {
    return this.shell.walletTransactions
      .filter(tx => tx.type !== 'credit')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }

  get totalTransactions(): number {
    return this.shell.walletTransactions.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalTransactions / this.pageSize));
  }

  get startIndex(): number {
    if (this.totalTransactions === 0) {
      return 0;
    }
    return (this.walletCurrentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.walletCurrentPage * this.pageSize, this.totalTransactions);
  }

  get visiblePages(): number[] {
    const maxButtons = 5;
    let start = Math.max(1, this.walletCurrentPage - 2);
    let end = Math.min(this.totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get paginatedTransactions(): any[] {
    if (this.tableCurrentPage > this.tableTotalPages) this.tableCurrentPage = this.tableTotalPages;
    if (this.tableCurrentPage < 1) this.tableCurrentPage = 1;

    const start = (this.tableCurrentPage - 1) * this.pageSizeTable;
    return this.getSortedTransactions().slice(start, start + this.pageSizeTable);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.walletCurrentPage) {
      return;
    }
    this.walletCurrentPage = page;
  }

  nextPage(): void {
    this.goToPage(this.walletCurrentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.walletCurrentPage - 1);
  }

  openCreditForm(): void {
    this.creditAmount = null;
    this.creditNotes = '';
    this.showCreditForm = true;
  }

  private loadTransactions(): void {
    try {
      const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}');
      const userId = userData?.id || this.shell.userId || 0;
      if (!userId) return;

      this.loadingTransactions = true;
      this.sub = this.employeeService.getUserTransactionsById(userId).subscribe({
        next: (res: any) => {
          this.tableTransactions = res?.data || [];
          this.tableTotal = this.tableTransactions.length;
          this.tableCurrentPage = 1;
          this.loadingTransactions = false;
        },
        error: (err: any) => {
          console.error('getUserTransactionsById error', err);
          this.toastr.error('Failed to load transactions');
          this.loadingTransactions = false;
        }
      });
    } catch (e) {
      console.error(e);
    }
  }

  changePage(page: number): void {
    const max = this.tableTotalPages;
    if (page < 1) page = 1;
    if (page > max) page = max;
    this.tableCurrentPage = page;
    this.selectAllOnPage = false;
  }

  get tableTotalPages(): number {
    return Math.max(1, Math.ceil(this.tableTotal / this.pageSizeTable));
  }

  toggleSelectAll(checked: boolean): void {
    this.selectAllOnPage = !!checked;
    const start = (this.tableCurrentPage - 1) * this.pageSizeTable;
    const pageItems = this.getSortedTransactions().slice(start, start + this.pageSizeTable);
    pageItems.forEach((t: any) => {
      if (checked) this.selected.add(t.id);
      else this.selected.delete(t.id);
    });
  }

  toggleSelect(tx: any): void {
    if (this.selected.has(tx.id)) this.selected.delete(tx.id);
    else this.selected.add(tx.id);
  }

  isSelected(tx: any): boolean {
    return this.selected.has(tx.id);
  }

  downloadRow(tx: any): void {
    const url = tx?.invoiceUrl || tx?.invoice_url || tx?.data?.invoiceUrl || null;
    if (!url) {
      this.toastr.error('Invoice not available');
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
    let count = 0;
    ids.forEach((id) => {
      const tx = this.tableTransactions.find((t) => t.id === id);
      const url = tx?.invoiceUrl || tx?.invoice_url || tx?.data?.invoiceUrl || null;
      if (url) {
        this.cartService.downloadUrl(url);
        count++;
      }
    });
    this.toastr.success(`Triggered downloads for ${count} invoice(s)`);
  }

  private getSortedTransactions(): any[] {
    if (!this.sortKey) return [...this.tableTransactions];
    const arr = [...this.tableTransactions];
    arr.sort((a, b) => {
      const av = a[this.sortKey as string] ?? a?.data?.[this.sortKey as string] ?? '';
      const bv = b[this.sortKey as string] ?? b?.data?.[this.sortKey as string] ?? '';
      if (av < bv) return this.sortDir === 'asc' ? -1 : 1;
      if (av > bv) return this.sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return arr;
  }

  sortBy(key: string): void {
    if (this.sortKey === key) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else {
      this.sortKey = key;
      this.sortDir = 'asc';
    }
  }

  closeCreditForm(): void {
    this.showCreditForm = false;
  }

  submitCreditWallet(): void {
    const amount = Number(this.creditAmount);
    if (!amount || amount <= 0) {
      this.toastr.error('Enter a valid amount.');
      return;
    }

    const userId = this.shell.userId;
    if (!userId) {
      this.toastr.error('User not found. Please login again.');
      return;
    }

    this.isCreditLoading = true;

    const payload = {
      userId,
      amount,
      walletType: 'EMPLOYEE',
      receipt: `WALLET-${Date.now()}`,
      notes: this.creditNotes || 'Wallet top-up'
    };

    this.employeeService.createWallet(payload).subscribe({
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
          description: 'Wallet Top-Up',
          order_id: orderId,
          handler: (paymentResponse: any) => {
            this.handleWalletPaymentSuccess(paymentResponse, amount, userId);
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
      error: (err: any) => {
        this.isCreditLoading = false;
        console.error('createWallet API error:', err);
        this.toastr.error('Failed to create wallet order. Please try again.');
      }
    });
  }

  private handleWalletPaymentSuccess(paymentResponse: any, amount: number, userId: number): void {
    const creditPayload = {
      amount,
      referenceNo: paymentResponse?.razorpay_payment_id || `REF-${Date.now()}`,
      notes: this.creditNotes || 'Wallet top-up',
      razorpayOrderId: paymentResponse?.razorpay_order_id,
      razorpayPaymentId: paymentResponse?.razorpay_payment_id,
      razorpaySignature: paymentResponse?.razorpay_signature
    };

    this.employeeService.razorPayWalletRes(creditPayload, userId).subscribe({
      next: () => {
        this.toastr.success('Wallet credited successfully!');
        // Auto-refresh wallet balance and transactions
        this.shell.loadWalletBalance();
        this.shell.loadWalletTransactions();
      },
      error: (err: any) => {
        console.error('razorPayWalletRes API error:', err);
        this.toastr.error('Payment done, but wallet credit failed.');
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
