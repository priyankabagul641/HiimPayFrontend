import { Component } from '@angular/core';
import { ClientEmployeeComponent } from '../../client-employee.component';

@Component({
  selector: 'app-client-dashboard-page',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardPageComponent {
  private readonly imageLoadErrors = new Set<string>();

  constructor(public shell: ClientEmployeeComponent) {}

  openWalletPage(): void {
    this.shell.onQuickAction('wallet');
  }

  hasOfferImage(offer: any): boolean {
    return Boolean(offer?.image) && !this.imageLoadErrors.has(this.getOfferImageKey(offer));
  }

  onOfferImageError(offer: any): void {
    this.imageLoadErrors.add(this.getOfferImageKey(offer));
  }

  private getOfferImageKey(offer: any): string {
    return String(offer?.id ?? offer?.brand ?? offer?.title ?? 'unknown-offer');
  }
}
