import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ApiService } from '../../authservice/api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { MessageService } from '../../../message.service';
import { AngularFireMessaging } from '@angular/fire/compat/messaging';
import { JwtAuthService } from '../../authservice/jwt-auth.service';


@Component({
  selector: 'app-adminlogin',
  templateUrl: './adminlogin.component.html',
  styleUrl: './adminlogin.component.css'
})

export class AdminloginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  show = '';
  displayMsg: any;
  userId: number = 1;
  fieldTextType: any;
  pushToken: any;

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
  captch_input: any;
  code: any = null;
  resultCode: any = null;
  checkCaptchaValue: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private toastr: ToastrService,
    private router: Router,
    private messageService: MessageService,
    private firemessage: AngularFireMessaging,
    private jwtAuthService: JwtAuthService,
  ) { }

  myFunction() {
    this.fieldTextType = !this.fieldTextType;
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      // email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      email: ['', [Validators.required, this.trimmedEmailValidator()]],
      password: ['', [Validators.required]],
    });

    this.createCaptcha();
    this.generateToken();


    // this.firemessage.messages.subscribe({
    //   next: (res: any) => {


    //     console.log(res);
    //     this.messageService.getter(res)
    //   }, error: (err: any) => {
    //     console.log(err);
    //   }
    // }

    // )

    // this.messageService.setter().subscribe({
    //   next: (res: any) => {
    //     console.log(res);

    //   }
    // })

    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
    this.messageService.requestPermission();
  }

  trimmedEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value) {
        const trimmedValue = control.value.trim();
        const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

        // Validate trimmed email
        if (!emailPattern.test(trimmedValue)) {
          return { invalidEmail: true }; // Invalid email
        }
      }
      return null; // Valid email
    };
  }

  generateToken() {
    this.firemessage.requestToken.subscribe({
      next: (res: any) => {
        // console.log("Token===========>", res);

        this.pushToken = res;
      }, error: (err: any) => {
        // console.warn("Eoor=========>",err);

      }
    });
  }

  submit() {
    if (this.loginForm.valid) {
      const form = this.loginForm.value;
      const obj = {
        email: form?.email.trim(),
        password: form?.password
      };

      if (!this.captch_input || this.captch_input.trim() === '') {
        this.toastr.error('Please enter captcha code');
        return;
      }

      if (this.captch_input !== this.resultCode) {
        this.toastr.error('Invalid captcha code');
        this.reloadCaptcha();
        return;
      }

      this.apiService.authLoginwithoutJwt(obj).subscribe({
        next: (res: any) => {
            // Expecting new response shape: { data: { token, user }, message, success }
            if (res && res.success && res.data && res.data.token && res.data.user) {
              const token = res.data.token;
              const user = res.data.user;

              // store token and user info
              this.jwtAuthService.setToken(token);
              sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(user));
              this.reloadCaptcha();

              // route based on userType mapping
              const userType = (user.userType || '').toString().toUpperCase();
              if (userType === 'ADMIN') {
                this.router.navigate(['/superadmin']);
                sessionStorage.setItem('isCpoc', 'false');
              } else if (userType === 'CPOC') {
                // CPOC should be routed to /cpoc/:clientId
                const clientId = user.companyId || user.clientId || null;
                if (clientId) {
                  this.router.navigate(['/cpoc', clientId]);
                  sessionStorage.setItem('isCpoc', 'true');
                } else {
                  this.router.navigate(['/superadmin']);
                }
              } else {
                // default to client employee dashboard
                this.router.navigate(['/clientEmployee/dashboard']);
              }

              this.toastr.success('Your login was successful!!');
              this.loginForm.reset();
            } else {
              this.reloadCaptcha();
              this.toastr.error(res?.message || 'Authentication failed.');
              this.displayMsg = res?.message || 'Authentication failed.';
            }
        },
        error: (error: any) => {
          this.reloadCaptcha();

          if (error.status === 401 && error.error) {
            try {
              const errorResponse = typeof error.error === 'string' ? JSON.parse(error.error) : error.error;
              const message = errorResponse.message || 'Authentication failed.';

              this.toastr.error(message);
              this.displayMsg = message;
            } catch (parseErr) {
              // console.error('Error parsing error response:', parseErr);
              this.toastr.error('Authentication failed.');
              this.displayMsg = 'Authentication failed.';
            }
          } else {
            // console.error('Authentication error:', error);
            this.toastr.error('Something went wrong. Please try again later.');
            this.displayMsg = 'Something went wrong. Please try again later.';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
      this.reloadCaptcha();
      this.toastr.error('Please enter valid email and password');
    }
  }


  // submit() {

  //   if (this.loginForm.valid) {
  //     const form = this.loginForm.value;
  //     const obj = {
  //       email: form?.email.trim(),
  //       password: form?.password
  //     };


  //   if (!this.captch_input || this.captch_input.trim() === '') {
  //     this.toastr.error('Please enter captcha code');
  //     return;
  //   }

  //   if (this.captch_input !== this.resultCode) {
  //     this.toastr.error('Invalid captcha code');
  //     this.reloadCaptcha();
  //     return;
  //   }

  //     this.apiService.authLoginwithoutJwt(obj).subscribe({
  //       next: (res: any) => {
  //         if (res.message === 'Current logged in Employee ') {
  //           const obj = { deviceId: this.pushToken };
  //           this.jwtAuthService.setToken(res.data);

  //           this.reloadCaptcha();
  //           this.jwtAuthService.getLoggedInUser()!.subscribe({
  //             next: (userRes: any) => {
  //               sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(userRes.data));
  //               const clientId = userRes.data.clientId;

  //               if (userRes.data.typeOfUser === 0) {
  //                 this.router.navigate(['/superadmin']);
  //                 this.toastr.success('Your login was successful!!');
  //                 sessionStorage.setItem('isCpoc', 'false');
  //               }
  //             },
  //             error: (err) => {
  //               console.error('Failed to fetch user data:', err);
  //             }
  //           });
  //         }

  //         else if (res.message === "Password wrong!! ") {
  //           this.reloadCaptcha();
  //           this.toastr.error('Sorry, your password is incorrect. Please double-check your password.');
  //           this.displayMsg = 'Sorry, your password is incorrect. Please double-check your password.';
  //         }

  //         else if (res.message === "Email not found!!") {
  //           this.reloadCaptcha();
  //           this.toastr.error('The email account that you tried to reach does not exist.');
  //           this.displayMsg = 'The email account that you tried to reach does not exist.';
  //         }

  //         else if (res?.message === "Too many login attempts. Please try again later.") {
  //           this.reloadCaptcha();
  //           this.toastr.error('Too many OTP requests. Please try again later. Try again after 5 minutes.');
  //           this.displayMsg = 'Too many login attempts. Please try again later. Try again after 5 minutes.';
  //         }

  //         else if (res.message === "User account is deactivated. Please contact support.") {
  //           this.reloadCaptcha();
  //           this.toastr.error('User account is deactivated. Please contact support.');
  //           this.displayMsg = 'User account is deactivated. Please contact support.';
  //         }
  //       },
  //       error: (error: any) => {
  //         this.reloadCaptcha();
  //         console.error('Authentication error:', error);
  //       },
  //     });
  //   } else {
  //     this.loginForm.markAllAsTouched();
  //     this.reloadCaptcha();
  //     this.toastr.error('Please enter email and password');
  //   }
  // }


  changeTextToPassword(): void {
    this.showPassword = !this.showPassword;
    this.show = !this.showPassword ? 'text' : 'password';
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
