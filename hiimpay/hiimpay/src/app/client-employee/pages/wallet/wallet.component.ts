import { Component } from '@angular/core';
import { ClientEmployeeComponent } from '../../client-employee.component';
import { EmployeeService } from '../../Services/userDataService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-wallet-page',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent {
  showCreditForm = false;
  creditAmount: number | null = null;
  creditNotes = '';
  isCreditLoading = false;
  currentPage = 1;
  readonly pageSize = 8;
  private readonly razorpayKeyId = 'rzp_test_SUgWJosaiMRnFd';

  constructor(
    public shell: ClientEmployeeComponent,
    private employeeService: EmployeeService,
    private toastr: ToastrService
  ) {}

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
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalTransactions);
  }

  get visiblePages(): number[] {
    const maxButtons = 5;
    let start = Math.max(1, this.currentPage - 2);
    let end = Math.min(this.totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  get paginatedTransactions(): Array<{ date: string; description: string; type: string; amount: number }> {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
    if (this.currentPage < 1) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    return this.shell.walletTransactions.slice(start, start + this.pageSize);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
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
