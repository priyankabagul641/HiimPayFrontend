import { Component, EventEmitter, Input, Output, OnDestroy, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/public-auth.service';
import { PublicCartService } from '../../services/public-cart.service';

@Component({
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent implements OnDestroy {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  step: 'mobile' | 'otp' = 'mobile';

  // Step 1
  identifier = '';   // mobile number or email
  agreedToTerms = true;
  currentYear = new Date().getFullYear();

  // Step 2
  otpDigits: string[] = ['', '', '', '', '', ''];
  resendSeconds = 0;
  private timerRef: any;

  // UI state
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(
    private router: Router,
    private authService: ApiService,
    private cartService: PublicCartService
  ) {}

  ngOnDestroy(): void {
    this.clearTimer();
  }

  close(): void {
    this.reset();
    this.closed.emit();
  }

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close();
    }
  }

  // ─── Step 1: Send OTP ─────────────────────────────────────────

  get isEmailMode(): boolean {
    return this.identifier.includes('@');
  }

  get canSendOtp(): boolean {
    if (!this.agreedToTerms) return false;
    const v = this.identifier.trim();
    if (this.isEmailMode) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    }
    return v.length === 10 && /^\d{10}$/.test(v);
  }

  onNext(): void {
    if (!this.canSendOtp || this.loading) return;
    this.loading = true;
    this.errorMsg = '';
    const id = this.identifier.trim();

    const call$ = this.isEmailMode
      ? this.authService.sendEmailOtp(id)
      : this.authService.sendMobileOtp(id);

    call$.subscribe({
      next: () => {
        this.loading = false;
        this.step = 'otp';
        this.startTimer(90);
        setTimeout(() => this.focusOtpBox(0), 100);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  // ─── Step 2: OTP input handling ──────────────────────────────

  onOtpInput(event: any, index: number): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');

    if (value.length > 1) {
      value = value.charAt(0); // prevent double input
    }

    input.value = value;
    this.otpDigits[index] = value;
    this.errorMsg = '';

    if (value && index < 5) {
      // Defer focus to next tick — moving focus synchronously during an input event
      // causes the browser to fire input again on the newly focused box (the skip bug).
      setTimeout(() => this.focusOtpBox(index + 1), 0);
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key !== 'Backspace') return;
    event.preventDefault();
    const inputs = this.otpInputs?.toArray();
    if (this.otpDigits[index]) {
      this.otpDigits[index] = '';
      if (inputs?.[index]) inputs[index].nativeElement.value = '';
    } else if (index > 0) {
      this.otpDigits[index - 1] = '';
      if (inputs?.[index - 1]) inputs[index - 1].nativeElement.value = '';
      this.focusOtpBox(index - 1);
    }
    this.errorMsg = '';
  }

  onOtpPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) ?? '';
    const inputs = this.otpInputs?.toArray();
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = text[i] ?? '';
      if (inputs?.[i]) inputs[i].nativeElement.value = text[i] ?? '';
    }
    this.focusOtpBox(Math.min(text.length, 5));
    this.errorMsg = '';
  }

  private focusOtpBox(index: number): void {
    const inputs = this.otpInputs?.toArray();
    if (inputs?.[index]) {
      inputs[index].nativeElement.focus();
    }
  }

  get otpComplete(): boolean {
    return this.otpDigits.every(d => d.length === 1);
  }

  get otpValue(): string {
    return this.otpDigits.join('');
  }

  // ─── Step 2: Verify OTP ──────────────────────────────────────

  onVerifyOtp(): void {
    if (!this.otpComplete || this.loading) return;
    this.loading = true;
    this.errorMsg = '';

    const id = this.identifier.trim();
    const call$ = this.isEmailMode
      ? this.authService.verifyEmailOtp(id, this.otpValue)
      : this.authService.verifyMobileOtp(id, this.otpValue);
    call$.subscribe({
      next: (res: any) => {
        this.loading = false;
        const token = res?.data?.token ?? res?.token;
        const user  = res?.data?.user  ?? res?.user;
        if (token) {
          this.authService.saveSession(token, user);
          this.cartService.loadCartFromApi();
          this.successMsg = 'Login successful!';
          setTimeout(() => this.close(), 800);
        } else {
          this.errorMsg = 'Invalid OTP. Please try again.';
          this.otpDigits = ['', '', '', '', '', ''];
          setTimeout(() => this.focusOtpBox(0), 50);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Invalid OTP. Please try again.';
        this.otpDigits = ['', '', '', '', '', ''];
        setTimeout(() => this.focusOtpBox(0), 50);
      }
    });
  }

  // ─── Resend timer ────────────────────────────────────────────

  resendOtp(): void {
    if (this.resendSeconds > 0 || this.loading) return;
    this.loading = true;
    this.errorMsg = '';
    const id = this.identifier.trim();
    const call$ = this.isEmailMode
      ? this.authService.sendEmailOtp(id)
      : this.authService.sendMobileOtp(id);
    call$.subscribe({
      next: () => {
        this.loading = false;
        this.otpDigits = ['', '', '', '', '', ''];
        this.startTimer(90);
        setTimeout(() => this.focusOtpBox(0), 100);
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to resend OTP.';
      }
    });
  }

  get resendLabel(): string {
    if (this.resendSeconds <= 0) return '';
    const m = Math.floor(this.resendSeconds / 60).toString().padStart(2, '0');
    const s = (this.resendSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  private startTimer(seconds: number): void {
    this.clearTimer();
    this.resendSeconds = seconds;
    this.timerRef = setInterval(() => {
      this.resendSeconds--;
      if (this.resendSeconds <= 0) this.clearTimer();
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerRef) { clearInterval(this.timerRef); this.timerRef = null; }
  }

  private reset(): void {
    this.step = 'mobile';
    this.identifier = '';
    this.otpDigits = ['', '', '', '', '', ''];
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = false;
    this.clearTimer();
  }

  goBack(): void {
    this.step = 'mobile';
    this.otpDigits = ['', '', '', '', '', ''];
    this.errorMsg = '';
    this.clearTimer();
  }
}
