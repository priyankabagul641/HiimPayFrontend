import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../authservice/api.service';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { MatchPasswordService } from './match-password.service';
import { JwtAuthService } from '../../authservice/jwt-auth.service';

enum showModel {
  isgenerate = 1,
  isVerifiy = 2,
  isReset = 3,
}
@Component({
  selector: 'app-forgotpassword',
  templateUrl: './forgotpassword.component.html',
  styleUrl: './forgotpassword.component.css',
})
export class ForgotpasswordComponent implements OnInit {
  emailId: string = '';
  otp: string = '';
  resetForm!: FormGroup;
  displayMsg: string = '';
  isLoading: boolean = false;
  state: number = showModel.isgenerate;
  userId: any;
  submitted: boolean = false;
  fieldTextType: { password: boolean; passwordConfirmation: boolean } = {
    password: false,
    passwordConfirmation: false,
  };
  @ViewChild('otpInputRef') otpInputRef!: any;
  @Input('config') config: any = {
    type: 1,
    length: 6,
    cssClass: 'custom',
    back: {
      stroke: '#2F9688',
      solid: '#f2efd2',
    },
    font: {
      color: '#000000',
      size: '35px',
    },
  };
  @Output() captchaCode = new EventEmitter();
  emailForm!: FormGroup;
  captch_input: string = '';
  code: string = '';
  resultCode: string = '';
  checkCaptchaValue: boolean = false;

  constructor(
    private router: Router,
    private accountService: ApiService,
    private toastr: ToastrService,
    private matchPassword: MatchPasswordService,
    private fb: FormBuilder,
    private jwtAuthService: JwtAuthService
  ) {}

  ngOnInit(): void {
    this.state = showModel.isgenerate;
    this.resetForm = this.fb.group(
      {
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/),
          ],
        ],
        passwordConfirmation: [
          '',
          [
            Validators.required,
            Validators.pattern(/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!(@)-_#$%^&+=]).*$/),
          ],
        ],
      },
      { validators: this.matchPassword.validate.bind(this.matchPassword) }
    );
  }

  get f() {
    return this.resetForm.controls;
  }

  toggleFieldTextType(field: 'password' | 'passwordConfirmation'): void {
    this.fieldTextType[field] = !this.fieldTextType[field];
  }

  generate(): void {
    this.displayMsg = '';
    const trimmedEmail = this.emailId?.trim();
    if (!trimmedEmail) {
      this.toastr.warning('Please enter email or mobile number');
      return;
    }
    this.isLoading = true;
    this.accountService.generateOTP(trimmedEmail).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.success && res.message && (res.message.toLowerCase().includes('otp sent') || res.message.toLowerCase().includes('otp will be sent'))) {
          this.createCaptcha();
          this.state = showModel.isVerifiy;
          this.toastr.success(res.message);
        } else {
          this.displayMsg = res?.message || 'Failed to send OTP.';
          this.toastr.error(this.displayMsg);
        }
      },
      error: (_err: any) => {
        this.isLoading = false;
        this.displayMsg = 'Failed to send OTP. Please try again.';
        this.toastr.error(this.displayMsg);
      }
    });
  }


  backToGenerate() {
    this.state = showModel.isgenerate;
  }

  goToReset() {
    this.displayMsg = '';
    if (!this.otp || this.otp.trim() === '') {
      this.toastr.error('Please enter OTP');
      return;
    }
    if (!this.captch_input || this.captch_input.trim() === '') {
      this.toastr.error('Please enter captcha code');
      return;
    }
    if (this.captch_input !== this.resultCode) {
      this.toastr.error('Invalid captcha code');
      this.reloadCaptcha();
      return;
    }
    this.isLoading = true;
    this.accountService.verifyOTP(this.emailId, this.otp).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.otp = '';
        if (this.otpInputRef) {
          this.otpInputRef.clear();
        }
        this.reloadCaptcha();
        if (res.success && res.data && res.data.token) {
          this.jwtAuthService.setToken(res.data.token);
          this.state = showModel.isReset;
          this.toastr.success('Otp verified successfully');
        } else {
          this.displayMsg = res?.message || 'OTP verification failed.';
          this.toastr.error(this.displayMsg);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.reloadCaptcha();
        this.displayMsg = 'Internal error occurred. Please try again.';
        this.toastr.error(this.displayMsg);
      }
    });
  }


  // goToReset() {
  //   this.displayMsg = '';
  //   console.log(this.otp);

  //   if (this.otp != null || this.otp != undefined) {
  //     this.isLoading = true;
  //     console.log(this.emailId, this.otp);

  //     this.accountService
  //       .verifyOTP(this.emailId, this.otp)
  //       .subscribe((res: any) => {
  //         console.log(res);

  //         this.isLoading = false;
  //         if (res.message === 'User logged in successfully.' || res?.message === 'User logged in successfully. Demographic information missing.') {
  //           this.userId = res.data.id;
  //           this.state = showModel.isReset;
  //           this.toastr.success('Otp verified successfully');
  //         } else if (res.message === 'enter correct otp.') {
  //           this.toastr.error(
  //             'This is a incorrect otp. Please reenter the otp ',
  //             '',
  //             { timeOut: 3000 }
  //           );
  //           this.displayMsg =
  //             'This is a incorrect otp. Please reenter the otp ';
  //           console.log('err');
  //         }else {
  //           this.toastr.error(res.message, 'Error..!');
  //         }
  //       });
  //   }else{
  //     this.toastr.error('Please enter OTP');
  //   }
  // }

  resetPassword() {
    this.submitted = true;
    const token = this.jwtAuthService.getToken();
    if (this.resetForm.valid) {
      const password = this.resetForm.value.password;
      this.isLoading = true;
      this.accountService.resetPassword(password, token).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res.success && res.message && res.message.toLowerCase().includes('password updated')) {
            this.resetForm.reset();
            this.jwtAuthService.removeToken();
            this.toastr.success('Password reset successfully!');
            this.router.navigate(['/auth']);
          } else {
            this.displayMsg = res?.message || 'Password reset failed.';
            this.toastr.error(this.displayMsg);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.displayMsg = 'Something went wrong. Please try again later.';
          this.toastr.error(this.displayMsg);
        }
      });
    } else {
      if (this.resetForm.value.password?.length > 0) {
        this.resetForm.reset();
        this.toastr.warning('New Password and Confirm Password does not match', 'Warning..!');
      } else {
        this.toastr.error('Please Enter New Password', 'Error!');
      }
    }
  }


  // resetPassword() {
  //   this.submitted = true;

  //   if (this.resetForm.valid) {
  //     // if (this.resetForm.value) {
  //     let formData = new FormData();
  //     formData.append('id', this.userId);
  //     formData.append('password', this.resetForm.value.password);
  //     this.isLoading = true;
  //     this.accountService
  //       .resetPassword(this.userId, this.resetForm.value.password)
  //       .subscribe((res) => {
  //         this.isLoading = false;
  //         if (res.success) {
  //           this.resetForm.reset();
  //           this.toastr.success('Password reset sucessfully..!');
  //           this.router.navigate(['/auth']);
  //         } else {
  //           this.toastr.error(res.message, 'Error..!');
  //         }
  //       });
  //   } else {
  //     if (this.resetForm.value.password.length > 0) {
  //       this.resetForm.reset();
  //       this.toastr.warning(
  //         'New Password and Confirm Password does not match',
  //         'Warning..!'
  //       );
  //     }
  //     else {
  //       this.toastr.error('Please Enter New Password', 'Error!')
  //     }
  //   }
  //   // } else {
  //   //   // this.resetForm.markAllAsTouched()
  //   // }
  // }


  otpInputConfig: NgxOtpInputConfig = {
    otpLength: 6,
    autofocus: true,
    classList: {
      inputBox: 'my-super-box-class',
      input: 'my-super-class',
      inputFilled: 'my-super-filled-class',
      inputDisabled: 'my-super-disable-class',
      inputSuccess: 'my-super-success-class',
      inputError: 'my-super-error-class',
    },
  };

  handeOtpChange(value: string[]): void {
    // console.log(value);
  }

  handleFillEvent(value: string): void {
    // console.log(value);
    this.otp = value;
  }

  onBack() {
    window.history.back();
  }

  onBackFromState2() {
    this.state = 1;
  }


  checkCaptcha() {
    if (this.captch_input === this.resultCode) {
      this.checkCaptchaValue = true;
      return true;
    } else {
      this.checkCaptchaValue = false;
      return false;
    }
  }

  createCaptcha() {
    switch (this.config.type) {
      case 1:
        let char =
          Math.random()
            .toString(24)
            .substring(2, this.config.length) +
          Math.random().toString(24).substring(2, 4);
        this.code = this.resultCode = char.toUpperCase();
        break;
      case 2:
    }
    setTimeout(() => {
      let captcahCanvas: any = document.getElementById("captcahCanvas");
      var ctx = captcahCanvas?.getContext("2d");
      ctx.fillStyle = this.config.back.solid;
      ctx.fillRect(0, 0, captcahCanvas.width, captcahCanvas.height);

      ctx.beginPath();

      captcahCanvas.style.letterSpacing = 15 + "px";
      ctx.font = this.config.font.size + " " + this.config.font.family;
      ctx.fillStyle = this.config.font.color;
      ctx.textBaseline = "middle";
      ctx.fillText(this.code, 40, 50);
      if (this.config.back.stroke) {
        ctx.strokeStyle = this.config.back.stroke;
        for (var i = 0; i < 150; i++) {
          ctx.moveTo(Math.random() * 300, Math.random() * 300);
          ctx.lineTo(Math.random() * 300, Math.random() * 300);
        }
        ctx.stroke();
      }

    }, 100);
  }

  reloadCaptcha(): void {
    this.createCaptcha();
    this.captch_input = '';
    this.checkCaptchaValue = false;
  }
}
