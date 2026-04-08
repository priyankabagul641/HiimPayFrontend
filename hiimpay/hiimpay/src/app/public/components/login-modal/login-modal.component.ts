import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();

  mobileNumber = '';
  agreedToTerms = true;
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  close(): void {
    this.closed.emit();
  }

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  onNext(): void {
    if (this.mobileNumber.trim().length >= 10) {
      this.close();
      this.router.navigate(['/auth/login'], { queryParams: { mobile: this.mobileNumber } });
    }
  }
}
