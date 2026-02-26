import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../authservice/api.service';
import { NgxOtpInputConfig } from 'ngx-otp-input';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { CreateUserComponent } from '../../../superadmin/project/Components/project-admin/create-user/create-user.component';
import { MatDialog } from '@angular/material/dialog';
import { JwtAuthService } from '../../authservice/jwt-auth.service';
@Component({
  selector: 'app-userlogin',
  templateUrl: './userlogin.component.html',
  styleUrl: './userlogin.component.css',
})
export class UserloginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  showOtp: boolean = false;
  show = '';
  emailId: any;
  otp: any;
  displayMsg: any;
  pushToken: any;
  isChecked: boolean = false;
  isInvalid: boolean = false;


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


  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private firemessage: AngularFireMessaging,
    public dialog: MatDialog,
    private jwtAuthService: JwtAuthService
  ) { }

  ngOnInit(): void {
    // this.loginForm = this.formBuilder.group({
    //   emailId: ['', Validators.required],
    //   password: ['', [Validators.required, Validators.minLength(8)]],
    // });
    this.generateToken();
  }
  generateToken() {
    this.firemessage.requestToken.subscribe({
      next: (res: any) => {
        console.log("Token===========>", res);

        this.pushToken = res;
      }, error: (err: any) => {
        console.warn("Eoor=========>", err);

      }
    });
  }
  submit() {
    this.showOtp = true;
    // console.log('', this.loginForm.value);
    if (this.loginForm.valid) {
      const form = this.loginForm.value;
      const obj = {
        emailId: form.emailId,
        password: form.password,
      };

      // console.log(obj);

      this.apiService.authLogin(obj).subscribe({
        next: (res: any) => {
          console.log('Authentication response:', res);
        },
        error: (error: any) => {
          console.error('Authentication error:', error);
        },
      });
    }
  }

  changeTextToPassword(): void {
    this.showPassword = !this.showPassword;
    this.show = !this.showPassword ? 'text' : 'password';
  }

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

  handeOtpChange(value: any): void {
    // console.log(value);
  }

  handleFillEvent(value: any): void {
    // console.log(value);
    this.otp = value;
  }
  isLoading: any;
  generate() {
    // console.log(this.emailId);
    this.displayMsg = ''
    // this.state = showModel.isVerifiy;
    if (this.emailId != null || this.emailId != undefined) {
      let formData = new FormData();

      formData.append('emailId', this.emailId);
      this.isLoading = true;
      this.apiService.generateOTP(this.emailId).subscribe((res: any) => {
        this.isLoading = false;
        if (res.message === 'OTP sent successfully.') {
          this.createCaptcha();
          this.showOtp = true;
          this.toastr.success('OTP sent successfully.', '', {
            timeOut: 1000,
          });
        } else if (res.message === 'Email not found!!') {
          this.toastr.error(
            'The email account that you tried to reach does not exist.',
            '',
            { timeOut: 3000 }
          );
          this.displayMsg = "The email account that you tried to reach does not exist."
        } else if (res.message === 'An OTP will be sent to the email. In case of any issues please contact the EXwise support team.') {
          this.toastr.success(
            'An OTP will be sent to the email. In case of any issues please contact the EXwise support team.',
            '',
            { timeOut: 5000 }
          );
          if (res?.success) {
            this.createCaptcha();
            this.showOtp = true;
          }
          else {
            this.displayMsg = "An OTP will be sent to the email. In case of any issues, please contact the EXwise support team.";
          }
        } else {
          this.toastr.error(res.message);
          this.isLoading = false;
          this.displayMsg = ''
        }
      });
    } else {
      this.toastr.warning("Please enter email");
    }
  }
  goToReset() {

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

    this.displayMsg = ''
    // if (this.otp != null || this.otp != undefined) {
    if (!this.isChecked) {
      this.isInvalid = true;
      // this.toastr.error('Please accept the Terms and Conditions before proceeding.','Error')
      return;
    }
    let formData = new FormData();
    formData.append('emailId', this.emailId);
    formData.append('otp', this.otp);

    this.isLoading = true;
    this.apiService
      .verifyOTP(this.emailId, this.otp)
      .subscribe((res: any) => {
        this.isLoading = false;
        this.otp = '';
        if (this.otpInputRef) {
          this.otpInputRef.clear();
        }

        this.reloadCaptcha();
        if (res.message === 'User logged in successfully.' || res.message === 'User logged in successfully. Demographic information missing.') {
          // sessionStorage.setItem(
          //   'currentLoggedInUserData',
          //   JSON.stringify(res.data)
          // );
          const tokenFromResp = res?.data?.token || res?.data;
          const userFromResp = res?.data?.user || null;

          if (tokenFromResp) {
            this.jwtAuthService.setToken(tokenFromResp);
          }

          if (userFromResp) {
            sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(userFromResp));
            const clientId = userFromResp.companyId || userFromResp.clientId || userFromResp.clientId;

            const userTypeStr = (userFromResp.userType || '').toString().toUpperCase();
            if (userTypeStr === 'CPOC' || userFromResp.typeOfUser == 1) {
              this.router.navigate(['/cpoc', clientId]);
              sessionStorage.setItem('isCpoc', 'true');
              this.toastr.success('Your login was successful!!');
              if (res.message === 'User logged in successfully. Demographic information missing.') {
                this.openPopUp();
              }
            } else if (userFromResp.typeOfUser == 2 || userTypeStr === 'EMPLOYEE') {
              this.router.navigate(['/clientEmployee/dashboard']);
              this.toastr.success('Your login was successful!!');
              if (res.message === 'User logged in successfully. Demographic information missing.') {
                this.openPopUp();
              }
            } else {
              this.toastr.error('Something went wrong!');
            }
          } else {
            // Fallback to existing behavior that fetches the logged-in user
            if (res?.data) {
              this.jwtAuthService.setToken(res?.data);
            }
            this.jwtAuthService.getLoggedInUser()!.subscribe({
              next: (userRes: any) => {
                sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(userRes.data));
                const clientId = userRes.data.clientId;

                if (userRes.data.typeOfUser == 1) {
                  this.router.navigate(['/cpoc', clientId]);
                  sessionStorage.setItem('isCpoc', 'true');
                  this.toastr.success('Your login was successful!!');
                  if (res.message === 'User logged in successfully. Demographic information missing.') {
                    this.openPopUp();
                  }
                } else if (userRes.data.typeOfUser == 2) {
                  this.router.navigate(['/clientEmployee/dashboard']);
                  this.toastr.success('Your login was successful!!');
                  if (res.message === 'User logged in successfully. Demographic information missing.') {
                    this.openPopUp();
                  }
                }
                else {
                  this.toastr.error('Something went wrong!');
                }
              },
              error: (err) => {
                console.error('Failed to fetch user data:', err);
                this.toastr.error('Failed to fetch user info');
              }
            });
          }

          // const obj = { deviceId: this.pushToken }
          // // this.apiService.updateUser(res.data.id, obj).subscribe((res: any) => {
          // //   console.log(res);
          // // })
          // const clientId = res.data.clientId;
          // if (res.data.typeOfUser == 1) {
          //   this.router.navigate(['/cpoc', clientId]);
          //   sessionStorage.setItem('isCpoc', 'true');
          //   this.toastr.success('Your login was successful!!');
          //   if (res.message === 'User logged in successfully. Demographic information missing.') {
          //     this.openPopUp();
          //   }
          // } else if (res.data.typeOfUser == 2) {
          //   this.router.navigate(['/clientEmployee/dashboard']);
          //   this.toastr.success('Your login was successful!!');
          //   if (res.message === 'User logged in successfully. Demographic information missing.') {
          //     this.openPopUp();
          //   }
          // } else {
          //   this.toastr.error(' Someting went wrong!');
          // }
        } else if (res.message === "Incorrect OTP. Please try again.") {
          this.toastr.error(
            'This is a incorrect otp. Please reenter the otp ',
            '',
            { timeOut: 3000 }
          );
          this.displayMsg = "This is a incorrect otp. Please reenter the otp "
          console.log('err');

        }

        else if (res.message === 'Too many failed OTP attempts. Please request a new OTP.') {
          const extraMsg = ' Try again after 5 minutes.';
          this.emailId = '';
          this.showOtp = false;
          this.toastr.error(res.message + extraMsg, 'Error..!', { timeOut: 5000 });
          return;
        }

        else if (res.message === 'Too many OTP verification requests. Please try again later.') {
          const extraMsg = ' Try again after 5 minutes.';
          this.emailId = '';
          this.showOtp = false;
          this.toastr.error('Too many failed OTP attempts. Please request a new OTP.' + extraMsg, 'Error..!', { timeOut: 5000 });
          return;
        }

        else if (
          res.message === 'OTP expired or already used. Please request a new OTP.' ||
          res.message === 'OTP has expired. Please request a new one.' ||
          res.message === 'User not found.'
        ) {
          this.toastr.error(res.message, 'Error..!');
          return;
        }

        else {
          this.toastr.error(res.message || 'Something went wrong.', 'Error..!');
        }
      });
    // } else {
    //   this.toastr.error('Please enter OTP');
    // }
  }

  onChangeCheckBox() {
    if (this.isChecked) {
      this.isInvalid = false;
    } else {
      this.isInvalid = true;
    }
  }

  openPopUp() {
    const dialogRef = this.dialog.open(CreateUserComponent, {
      width: '800px',
      height: '600px',
      disableClose: true,
      data: { name: 'edit-user', id: JSON.parse(sessionStorage.getItem("currentLoggedInUserData")!).id },
    });

    dialogRef.afterClosed().subscribe((result) => {
    });
  }

  navigateTo(page: string) {
    if (page === 'terms') {
      window.open('https://exwise.co/terms-and-conditions/', '_blank');
    } else if (page === 'privacy') {
      window.open('https://exwise.co/research-privacy-notice/', '_blank');
    }
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


  onBack() {
    this.showOtp = false;
  }
}
