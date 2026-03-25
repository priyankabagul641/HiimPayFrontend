import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../auth/authservice/api.service';
import { JwtAuthService } from '../../auth/authservice/jwt-auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-client-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  captchaConfig: any = {
    type: 1,
    length: 6,
    back: { stroke: '#2F9688', solid: '#f2efd2' },
    font: { color: '#000000', size: '35px', family: 'Arial' }
  };

  authStep: 'request' | 'verify' = 'request';
  loginForm!: FormGroup;
  captchaCode = '';
  isSendingOtp = false;
  isVerifyingOtp = false;
  authError = '';
  demoOtp = '123456';

  toastMessage = '';
  showToast = false;
  notifications: Array<{ message: string; time: string; unread: boolean }> = [];
  captchaLoading = false;

  constructor(
    private router: Router,
    private api: ApiService,
    private jwtAuthService: JwtAuthService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {
    this.generateCaptcha();
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailId: [''],
      enteredCaptcha: [''],
      enteredOtp: ['']
    });
    setTimeout(() => this.generateCaptcha(), 0);
  }

  sendOtp() {
    const email = (this.loginForm.get('emailId')?.value || '').toString().trim();
    this.authError = '';

    if (!email || !this.isValidEmail(email)) {
      this.authError = 'Enter a valid company email address.';
      return;
    }

    const enteredCaptcha = (this.loginForm.get('enteredCaptcha')?.value || '').toString();
    if (enteredCaptcha.trim().toUpperCase() !== this.captchaCode) {
      this.authError = 'Captcha does not match. Please try again.';
      this.generateCaptcha();
      this.loginForm.get('enteredCaptcha')?.setValue('');
      return;
    }

    this.isSendingOtp = true;
    this.api.generateOTP(email).subscribe({
      next: (res: any) => {
        this.isSendingOtp = false;
        if (res?.message && (res.message === 'OTP sent successfully.' || res.success)) {
          this.authStep = 'verify';
          this.showToastMessage(`OTP sent to ${email}`);
          this.pushNotification('OTP sent successfully');
        } else {
          this.authError = res?.message || 'Failed to send OTP. Please try again.';
        }
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        console.error('generateOTP error', err);
        this.authError = 'Failed to send OTP. Please try again later.';
      }
    });
  }

  verifyOtp() {
    this.authError = '';
    const enteredOtp = (this.loginForm.get('enteredOtp')?.value || '').toString();
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      this.authError = 'Enter a valid 6-digit OTP.';
      return;
    }

    const email = (this.loginForm.get('emailId')?.value || '').toString().trim();

    this.isVerifyingOtp = true;
    this.api.verifyOTP(email, enteredOtp).subscribe({
      next: (res: any) => {
        this.isVerifyingOtp = false;

        const ok = res?.success || res?.message === 'User logged in successfully.' || res?.message === 'User logged in successfully. Demographic information missing.';
        if (ok) {
          const tokenFromResp = res?.data?.token || res?.data;
          const userFromResp = res?.data?.user || null;

          if (tokenFromResp) {
            this.jwtAuthService.setToken(tokenFromResp);
          }

          if (userFromResp) {
            try {
              sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(userFromResp));
            } catch (e) {}

            const userTypeStr = (userFromResp.userType || '').toString().toUpperCase();
            const clientId = userFromResp.companyId || userFromResp.clientId || null;

            if (userTypeStr === 'CPOC') {
              this.router.navigate(['/cpoc', clientId]);
              sessionStorage.setItem('isCpoc', 'true');
              this.toastr.success('Your login was successful!!');
            } else {
              this.router.navigate(['/clientEmployee/dashboard']);
              sessionStorage.setItem('isCpoc', 'false');
              this.toastr.success('Your login was successful!!');
            }
          } else {
            if (res?.data) {
              this.jwtAuthService.setToken(res.data);
            }
            this.jwtAuthService.getLoggedInUser()?.subscribe({
              next: (userRes: any) => {
                try {
                  sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(userRes.data));
                } catch (e) {}
                const clientId = userRes.data?.clientId;
                if (userRes.data?.typeOfUser == 1) {
                  this.router.navigate(['/cpoc', clientId]);
                  sessionStorage.setItem('isCpoc', 'true');
                  this.toastr.success('Your login was successful!!');
                } else if (userRes.data?.typeOfUser == 2) {
                  this.router.navigate(['/clientEmployee/dashboard']);
                  this.toastr.success('Your login was successful!!');
                } else {
                  this.toastr.error('Something went wrong!');
                }
              },
              error: (err: any) => {
                console.error('Failed to fetch user data:', err);
                this.toastr.error('Failed to fetch user info');
              }
            });
          }

          this.showToastMessage('OTP verified successfully');
          this.pushNotification('You are logged in successfully');
        } else if (res?.message === 'Incorrect OTP. Please try again.') {
          this.authError = 'Incorrect OTP. Please try again.';
        } else if (res?.message) {
          this.authError = res.message;
        } else {
          this.authError = 'OTP verification failed. Please try again.';
        }
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        console.error('verifyOTP error', err);
        this.authError = 'OTP verification failed. Please try again later.';
      }
    });
  }

  backToRequestStep() {
    this.authStep = 'request';
    this.loginForm.get('enteredOtp')?.setValue('');
    this.generateCaptcha();
    this.loginForm.get('enteredCaptcha')?.setValue('');
    this.authError = '';
  }

  regenerateCaptcha() {
    if (!this.captchaLoading) {
      this.generateCaptcha();
      this.loginForm.get('enteredCaptcha')?.setValue('');
    }
  }

  get emailId() {
    return this.loginForm?.get('emailId')?.value || '';
  }

  private generateCaptcha() {
    this.captchaLoading = true;
    
    let generated = '';
    if (this.captchaConfig.type === 1) {
      generated =
        Math.random().toString(24).substring(2, this.captchaConfig.length) +
        Math.random().toString(24).substring(2, 4);
      this.captchaCode = generated.toUpperCase();
    }

    setTimeout(() => {
      const captcahCanvas: any = document.getElementById('captcahCanvas');
      if (!captcahCanvas) {
        this.captchaLoading = false;
        return;
      }
      const ctx = captcahCanvas.getContext('2d');
      if (!ctx) {
        this.captchaLoading = false;
        return;
      }

      // Clear canvas with light background
      ctx.fillStyle = '#fef9e7';
      ctx.fillRect(0, 0, captcahCanvas.width, captcahCanvas.height);

      // Draw subtle border
      ctx.strokeStyle = '#d4a574';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(1, 1, captcahCanvas.width - 2, captcahCanvas.height - 2);

      // Add minimal noise lines (reduced from 120 to ~25)
      ctx.strokeStyle = 'rgba(212, 165, 116, 0.15)';
      ctx.lineWidth = 0.8;
      for (let i = 0; i < 25; i += 1) {
        ctx.moveTo(Math.random() * captcahCanvas.width, Math.random() * captcahCanvas.height);
        ctx.lineTo(Math.random() * captcahCanvas.width, Math.random() * captcahCanvas.height);
      }
      ctx.stroke();

      // Draw text with better positioning
      ctx.font = 'bold 24px Arial, sans-serif';
      ctx.fillStyle = '#103a7f';
      ctx.textBaseline = 'middle';
      ctx.letterSpacing = '4px';

      // Center text in canvas
      const textWidth = ctx.measureText(this.captchaCode).width;
      const xPos = (captcahCanvas.width - textWidth) / 2;
      const yPos = captcahCanvas.height / 2;

      ctx.fillText(this.captchaCode, xPos, yPos);
      
      this.captchaLoading = false;
    }, 100);
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => (this.showToast = false), 2200);
  }

  private pushNotification(message: string) {
    this.notifications.unshift({ message, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), unread: true });
  }
}
