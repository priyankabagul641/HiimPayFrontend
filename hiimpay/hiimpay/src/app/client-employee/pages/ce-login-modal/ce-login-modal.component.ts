import {
  Component, EventEmitter, Input, OnDestroy, Output,
  QueryList, ViewChildren, ElementRef
} from '@angular/core';
import { ApiService } from '../../..//public/services/public-auth.service';

@Component({
  selector: 'app-ce-login-modal',
  templateUrl: './ce-login-modal.component.html',
  styleUrls: ['./ce-login-modal.component.css']
})
export class CeLoginModalComponent implements OnDestroy {
  @Input() visible = false;
  @Output() closed = new EventEmitter<void>();
  @Output() loginSuccess = new EventEmitter<void>();
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  step: 'mobile' | 'otp' = 'mobile';
  identifier = '';
  agreedToTerms = true;
  currentYear = new Date().getFullYear();

  otpDigits: string[] = ['', '', '', '', '', ''];
  resendSeconds = 0;
  private timerRef: any;

  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private authService: ApiService) {}

  ngOnDestroy(): void {
    this.clearTimer();
  }

  close(): void {
    this.reset();
    this.closed.emit();
  }

  onBackdropClick(event: Event): void {
    if ((event.target as HTMLElement).classList.contains('ce-modal-backdrop')) {
      this.close();
    }
  }

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
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  onOtpInput(event: any, index: number): void {
    const input = event.target;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 1) value = value.charAt(0);
    input.value = value;
    this.otpDigits[index] = value;
    this.errorMsg = '';
    if (value && index < 5) {
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
    if (inputs?.[index]) inputs[index].nativeElement.focus();
  }

  get otpComplete(): boolean {
    return this.otpDigits.every(d => d.length === 1);
  }

  get otpValue(): string {
    return this.otpDigits.join('');
  }

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
          this.successMsg = 'Login successful!';
          setTimeout(() => {
            this.loginSuccess.emit();
            this.close();
          }, 800);
        } else {
          this.errorMsg = 'Invalid OTP. Please try again.';
          this.otpDigits = ['', '', '', '', '', ''];
          setTimeout(() => this.focusOtpBox(0), 50);
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Invalid OTP. Please try again.';
        this.otpDigits = ['', '', '', '', '', ''];
        setTimeout(() => this.focusOtpBox(0), 50);
      }
    });
  }

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
        this.startTimer(90);
        this.focusOtpBox(0);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg = err?.error?.message || 'Failed to resend OTP.';
      }
    });
  }

  get resendLabel(): string {
    const m = Math.floor(this.resendSeconds / 60);
    const s = this.resendSeconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `${s}s`;
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
    if (this.timerRef) {
      clearInterval(this.timerRef);
      this.timerRef = null;
    }
  }

  goBack(): void {
    this.step = 'mobile';
    this.otpDigits = ['', '', '', '', '', ''];
    this.errorMsg = '';
    this.successMsg = '';
    this.clearTimer();
  }

  private reset(): void {
    this.step = 'mobile';
    this.identifier = '';
    this.otpDigits = ['', '', '', '', '', ''];
    this.errorMsg = '';
    this.successMsg = '';
    this.loading = false;
    this.agreedToTerms = true;
    this.clearTimer();
  }
}
