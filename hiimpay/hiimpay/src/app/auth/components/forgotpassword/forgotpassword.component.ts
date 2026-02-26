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
export class ForgotpasswordComponent {
  // Temporary demo switch: bypass OTP/reset API flow while email gateway is not integrated.
  private readonly demoMode = true;
  emailId: string = '';
  otp: any;
  resetForm!: FormGroup;
  displayMsg: any;

  isLoading: boolean = false;
  state: any;
  userId: any;
  submitted: boolean = false;
  fieldTextType: { password: boolean; passwordConfirmation: boolean } = {
    password: false,
    passwordConfirmation: false,
  };

  @ViewChild('otpInputRef') otpInputRef: any;

  @Input("config") config: any = {
    type: 1,
    length: 6,
    cssClass: "custom",
    back: {
      stroke: "#2F9688",
      solid: "#f2efd2",
    },
    font: {
      color: "#000000",
      size: "35px",
    },
  };
  // @Input("config") config: any;
  @Output() captchaCode = new EventEmitter();
  emailForm!: FormGroup;
  captch_input: any;
  code: any = null;
  resultCode: any = null;
  checkCaptchaValue: boolean = false;


  get f() {
    return this.resetForm.controls;
  }
  constructor(
    private router: Router,
    private accountService: ApiService,
    private toastr: ToastrService,
    private matchPassword: MatchPasswordService,
    private fb: FormBuilder,
    private jwtAuthService: JwtAuthService
  ) { }

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

  toggleFieldTextType(field: 'password' | 'passwordConfirmation'): void {
    this.fieldTextType[field] = !this.fieldTextType[field];
  }

  // generate() {
  //   this.displayMsg = '';

  //   this.emailId.trim();
  //   if (this.emailId != null || this.emailId != undefined) {
  //     let formData = new FormData();
  //     formData.append('emailId', this.emailId);
  //     this.isLoading = true;
  //     console.log(formData);

  //     this.accountService.generateOTP(this.emailId).subscribe((res: any) => {
  //       console.log(res);
  //       if (res.message === 'Email not found!!') {
  //         this.isLoading = false;
  //         this.displayMsg =
  //           'The email account that you tried to reach does not exist.';
  //         this.toastr.error('Please Enter Valid Email-ID');
  //       } else if (res.message === 'OTP sent successfully.') {
  //         this.state = showModel.isVerifiy;
  //         this.isLoading = false;
  //         this.toastr.success('Otp sent successfully');
  //       } else if(res.message === 'Your account is not active. Please contact support.'){
  //         this.isLoading = false;
  //         this.toastr.error('Your account is not active. Please contact support.')
  //       }else {
  //         this.toastr.warning('Something went wrong..!');
  //       }
  //     });
  //   } else {
  //     this.toastr.warning('Please enter email');
  //   }
  // }

  generate() {
    if (this.demoMode) {
      const trimmedEmail = this.emailId?.trim();
      if (!trimmedEmail) {
        this.toastr.warning('Please enter email');
        return;
      }
      this.createCaptcha();
      this.state = showModel.isVerifiy;
      this.toastr.success('OTP sent successfully (demo mode)');
      return;
    }

    this.displayMsg = '';

    const trimmedEmail = this.emailId?.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check for empty or invalid email
    if (!trimmedEmail) {
      this.toastr.warning('Please enter email');
      return;
    }

    if (!emailPattern.test(trimmedEmail)) {
      this.toastr.error('Please enter a valid Email-ID');
      return;
    }

    this.isLoading = true;

    this.accountService.generateOTP(trimmedEmail).subscribe({
      next: (res: any) => {
        // console.log(res);

        this.isLoading = false;

        switch (res.message) {
          case 'Email not found!!':
            this.displayMsg = 'The email account that you tried to reach does not exist.';
            this.toastr.error('Please enter a valid Email-ID');
            break;

          case 'OTP sent successfully.':
            this.createCaptcha();
            this.state = showModel.isVerifiy;
            this.toastr.success('Otp sent successfully');
            break;

          case 'Your account is not active. Please contact support.':
            this.toastr.error('Your account is not active. Please contact support.');
            break;

          case 'Too many OTP requests. Please try again later.':
            this.toastr.error('Too many OTP requests. Please try again later.');
            break;

          case 'An OTP will be sent to the email. In case of any issues please contact the EXwise support team.':
            this.toastr.success('An OTP will be sent to the email. In case of any issues please contact the EXwise support team.', '', { timeOut: 5000 });
            if (res?.success) {
              this.createCaptcha();
              this.state = showModel.isVerifiy;
            }
            break;

          default:
            this.toastr.warning('Something went wrong..!');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this.toastr.error('Failed to send OTP. Please try again.');
      }
    });
  }


  backToGenerate() {
    this.state = showModel.isgenerate;
  }

  goToReset() {
    if (this.demoMode) {
      this.state = showModel.isReset;
      this.toastr.success('Otp verified successfully (demo mode)');
      return;
    }

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
    // console.log(this.emailId, this.otp);

    this.accountService.verifyOTP(this.emailId, this.otp).subscribe({
      next: (res: any) => {

        this.isLoading = false;
        this.otp = '';
        if (this.otpInputRef) {
          this.otpInputRef.clear();
        }

        this.reloadCaptcha();

        if (
          res.message === 'User logged in successfully.' ||
          res.message === 'User logged in successfully. Demographic information missing.'
        ) {
          // this.userId = res.data?.id;
          this.jwtAuthService.setToken(res.data?.token || res.data);
          this.state = showModel.isReset;
          this.toastr.success('Otp verified successfully');
          return;
        }

        if (res.message === 'Incorrect OTP. Please try again.') {
          this.displayMsg = 'This is a incorrect otp. Please reenter the otp ';
          this.toastr.error(this.displayMsg, '', { timeOut: 3000 });
          return;
        }

        if (res.message === 'Too many failed OTP attempts. Please request a new OTP.') {
          const extraMsg = ' Try again after 5 minutes.';
          this.emailId = '';
          this.state = showModel.isgenerate;
          this.toastr.error(res.message + extraMsg, 'Error..!', { timeOut: 5000 });
          return;
        }

        if (res.message === 'Too many OTP verification requests. Please try again later.') {
          const extraMsg = ' Try again after 5 minutes.';
          this.emailId = '';
          this.state = showModel.isgenerate;
          this.toastr.error('Too many failed OTP attempts. Please request a new OTP.' + extraMsg, 'Error..!', { timeOut: 5000 });
          return;
        }

        if (
          res.message === 'OTP expired or already used. Please request a new OTP.' ||
          res.message === 'OTP has expired. Please request a new one.' ||
          res.message === 'User not found.'
        ) {
          this.toastr.error(res.message, 'Error..!');
          return;
        }

        this.toastr.error(res.message || 'Something went wrong.', 'Error..!');
      },

      error: (err) => {
        this.isLoading = false;
        this.reloadCaptcha();
        console.error(err);
        this.toastr.error('Internal error occurred. Please try again.', 'Error..!');
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
    if (this.demoMode) {
      const password = this.resetForm.value.password;
      const passwordConfirmation = this.resetForm.value.passwordConfirmation;
      if (!password || !passwordConfirmation) {
        this.toastr.error('Please Enter New Password', 'Error!');
        return;
      }
      if (password !== passwordConfirmation) {
        this.toastr.warning('New Password and Confirm Password does not match', 'Warning..!');
        return;
      }
      this.resetForm.reset();
      this.toastr.success('Password reset successfully (demo mode)');
      this.router.navigate(['/auth']);
      return;
    }

    this.submitted = true;
    const token = this.jwtAuthService.getToken();

    if (this.resetForm.valid) {
      const password = this.resetForm.value.password;

      this.isLoading = true;
      this.accountService.resetPassword(password, token).subscribe((res) => {
        this.isLoading = false;

        if (res.success && res?.message === 'Password updated successfully.') {
          this.resetForm.reset();
          this.jwtAuthService.removeToken();
          this.toastr.success('Password reset sucessfully..!');
          this.router.navigate(['/auth']);
        } else {
          this.toastr.error(res.message, 'Error..!');
        }
      }, (error) => {
        this.isLoading = false;
        this.toastr.error('Something went wrong. Please try again later.', 'Error..!');
      });

    } else {
      if (this.resetForm.value.password?.length > 0) {
        this.resetForm.reset();
        this.toastr.warning(
          'New Password and Confirm Password does not match',
          'Warning..!'
        );
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
