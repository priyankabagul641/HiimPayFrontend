import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrderSummary } from '../../models/voucher.model';

@Component({
  selector: 'app-order-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.css']
})
export class OrderSuccessComponent implements OnInit {
  order: OrderSummary | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    try {
      const data = localStorage.getItem('publicLastOrder');
      if (data) {
        this.order = JSON.parse(data);
      }
    } catch {}

    if (!this.order) {
      this.router.navigate(['/store']);
    }
  }

  get formattedDate(): string {
    if (!this.order?.date) return '';
    return new Date(this.order.date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  downloadInvoice(): void {
    if (!this.order) return;
    // Generate a simple text-based invoice download
    const lines = [
      '==================================',
      '        HIIMPAY STORE INVOICE',
      '==================================',
      '',
      `Order ID:   ${this.order.orderId}`,
      `Date:       ${this.formattedDate}`,
      `Payment ID: ${this.order.paymentId}`,
      '',
      '--- Customer Info ---',
      `Name:   ${this.order.guest.name}`,
      `Email:  ${this.order.guest.email}`,
      `Mobile: ${this.order.guest.mobile}`,
      '',
      '--- Items ---',
      ...this.order.items.map(item =>
        `${item.name} (₹${item.denomination}) x${item.quantity} = ₹${item.discountedPrice * item.quantity}`
      ),
      '',
      `Savings:  ₹${this.order.totalSavings}`,
      `Total:    ₹${this.order.totalAmount}`,
      '',
      '==================================',
      '  Thank you for your purchase!',
      '=================================='
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${this.order.orderId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  continueShopping(): void {
    this.router.navigate(['/store']);
  }
}
