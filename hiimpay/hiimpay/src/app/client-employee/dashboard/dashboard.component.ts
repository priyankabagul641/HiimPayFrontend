import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../auth/authservice/api.service';
import { JwtAuthService } from '../../auth/authservice/jwt-auth.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from '../Services/userDataService';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  captchaConfig: any = {
    type: 1,
    length: 6,
    back: {
      stroke: '#2F9688',
      solid: '#f2efd2'
    },
    font: {
      color: '#000000',
      size: '35px',
      family: 'Arial'
    }
  };

  authStep: 'request' | 'verify' = 'request';
  emailId = '';
  enteredOtp = '';
  enteredCaptcha = '';
  captchaCode = '';
  isSendingOtp = false;
  isVerifyingOtp = false;
  authError = '';
  demoOtp = '123456';

  activeScreen: 'home' | 'browse' | 'categories' | 'details' | 'my-coupons' | 'wallet' = 'home';
  activeCouponTab: 'active' | 'used' | 'expired' = 'active';
  selectedOfferId = 1;
  toastMessage = '';
  showToast = false;
  copiedCouponCode = '';
  showSidebar = true;
  showNotificationPanel = false;
  showFaqPanel = false;
  faqOpenIndex = -1;
  selectedCategoryView = 'Food & Dining';
  categorySearchTerm = '';
  walletView: 'coupon' | 'amount' = 'coupon';

  walletBalance = 0;
  totalSavings = 0;
  userId: number = 0;
  companyId: number = 0;
  browseCoupons: any[] = [];
  browseCouponsLoading = false;

  // Grab-coupon dialog
  showGrabDialog = false;
  grabDialogStep: 'confirm' | 'checkout' = 'confirm';
  grabDialogOffer: any = null;
  grabAmount: number | null = null;
  grabNotes = '';
  isProcessingGrab = false;
  grabResult: any = null;

  searchTerm = '';
  selectedBrand = 'All';
  selectedCategory = 'All';
  selectedDiscountType = 'All';

  categories = [
    { icon: 'lunch_dining', label: 'Food & Dining', accent: 'food' },
    { icon: 'shopping_bag', label: 'Shopping', accent: 'shopping' },
    { icon: 'flight_takeoff', label: 'Travel', accent: 'travel' },
    { icon: 'devices', label: 'Electronics', accent: 'electronics' },
    { icon: 'movie', label: 'Entertainment', accent: 'entertainment' },
    { icon: 'self_improvement', label: 'Health & Wellness', accent: 'wellness' }
  ];

  offers: any[] = [];

  ownedCoupons = [
    {
      brand: 'Swiggy',
      title: 'Flat Rs 500 Off',
      code: 'SWIGGY500',
      status: 'active',
      expiresOn: '2026-03-08',
      redeemInstruction: 'Apply on cart page before payment'
    },
    {
      brand: 'Myntra',
      title: 'Extra 25% Off',
      code: 'MYNTRA25',
      status: 'used',
      expiresOn: '2026-02-10',
      redeemInstruction: 'Redeemed on 10 Feb 2026'
    },
    {
      brand: 'BookMyShow',
      title: 'Buy 1 Get 1',
      code: 'BMSB1G1',
      status: 'expired',
      expiresOn: '2026-02-02',
      redeemInstruction: 'Offer validity ended'
    }
  ];

  monthlyCouponStats = [
    { month: 'Jan', purchased: 24, assigned: 18, expired: 4 },
    { month: 'Feb', purchased: 30, assigned: 22, expired: 5 },
    { month: 'Mar', purchased: 28, assigned: 24, expired: 6 },
    { month: 'Apr', purchased: 36, assigned: 29, expired: 8 },
    { month: 'May', purchased: 40, assigned: 34, expired: 7 },
    { month: 'Jun', purchased: 34, assigned: 27, expired: 6 }
  ];
  walletTransactions: Array<{ date: string; description: string; type: string; amount: number }> = [];
  notifications: Array<{ message: string; time: string; unread: boolean }> = [
    { message: 'Welcome to Employee Coupon Portal', time: 'Just now', unread: true }
  ];
  faqs: Array<{ question: string; answer: string }> = [
    {
      question: 'How do I claim a coupon?',
      answer: 'Go to Browse Coupons, open an offer and click Grab Coupon.'
    },
    {
      question: 'Where can I find my coupon code?',
      answer: 'Open My Coupons tab and click Copy beside your active coupon.'
    },
    {
      question: 'Why did my coupon expire?',
      answer: 'Coupons are time-bound. Check the expiry date shown in each card.'
    }
  ];
  quickActions: Array<{
    title: string;
    description: string;
    action: 'browse' | 'categories' | 'my-coupons' | 'wallet';
    icon: string;
  }> = [
    { title: 'Claim Best Deal', description: 'Open trending coupons', action: 'browse', icon: 'local_offer' },
    { title: 'Expiring Soon', description: 'Review active coupon deadlines', action: 'my-coupons', icon: 'timer' },
  
    { title: 'Explore Categories', description: 'Find offers by use case', action: 'categories', icon: 'grid_view' }
  ];

  constructor(private router: Router, private api: ApiService, private jwtAuthService: JwtAuthService, private toastr: ToastrService, private employeeService: EmployeeService) {
    this.generateCaptcha();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.generateCaptcha();
    }, 0);

    const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}');
    this.userId = userData?.id || 0;
    this.companyId = userData?.companyId || userData?.clientId || 0;
    if (this.userId) {
      this.loadWalletBalance();
      this.loadWalletTransactions();
    }
    if (this.companyId) {
      this.loadBrowseCoupons();
    }
  }

  loadBrowseCoupons() {
    this.browseCouponsLoading = true;
    this.employeeService.getUserCoupounById(this.companyId).subscribe({
      next: (res: any) => {
        this.browseCouponsLoading = false;
        this.browseCoupons = (res?.data || []).map((b: any, idx: number) => this.normalizeBrand(b, idx));
      },
      error: (err: any) => {
        this.browseCouponsLoading = false;
        console.error('loadBrowseCoupons error:', err);
      }
    });
  }

  private normalizeBrand(b: any, idx: number): any {
    const name: string = b.brandName || 'Brand';
    const logo = name.substring(0, 2).toUpperCase();
    const colorMap: Record<string, string> = {
      'E-COMMERCE': '#ff9900', 'GIFT_CARD': '#6c5ce7', 'RETAIL': '#2ecc71',
      'E-VOUCHER': '#00b894', 'FASHION': '#fd79a8'
    };
    const brandColor = colorMap[(b.brandType || '').toUpperCase()] || '#2980b9';
    const discount = b.epayDiscount || 0;
    const discountBadge = discount > 0 ? `${discount}% OFF` : 'Offer';
    const discountType = discount > 0 ? 'Percentage' : 'Flat';
    const category = this.brandTypeToCategory(b.brandType);
    const validTill = new Date();
    validTill.setFullYear(validTill.getFullYear() + 1);
    return {
      id:           b.id ?? idx + 1,
      brand:        name,
      title:        b.description || `${name} gift voucher`,
      validTill:    validTill.toISOString().split('T')[0],
      discountBadge,
      discountType,
      category,
      brandLogo:    logo,
      brandColor,
      image:        b.brandImage || 'assets/images/servey1.jfif',
      description:  b.description || '',
      terms:        b.tnc || 'Terms and conditions apply.',
      redeemSteps:  b.importantInstruction
                      ? [b.importantInstruction]
                      : ['Grab the coupon', 'Copy the code', 'Apply at checkout'],
      isTrending:   b.stockAvailable !== false,
      minValue:     b.epayMinValue,
      maxValue:     b.epayMaxValue,
      redemptionUrl:b.onlineRedemptionUrl || ''
    };
  }

  private brandTypeToCategory(brandType: string): string {
    const map: Record<string, string> = {
      'E-COMMERCE': 'Shopping', 'GIFT_CARD': 'Shopping', 'RETAIL': 'Shopping',
      'FOOD': 'Food & Dining', 'TRAVEL': 'Travel', 'ELECTRONICS': 'Electronics',
      'FASHION': 'Shopping', 'E-VOUCHER': 'Shopping'
    };
    return map[(brandType || '').toUpperCase()] || 'Shopping';
  }

  loadWalletBalance() {
    this.employeeService.getUserWalletById(this.userId).subscribe({
      next: (res: any) => {
        this.walletBalance = res?.data?.balance ?? 0;
      },
      error: (err: any) => console.error('loadWalletBalance error:', err)
    });
  }

  loadWalletTransactions() {
    this.employeeService.getUserTransactionsById(this.userId).subscribe({
      next: (res: any) => {
        this.walletTransactions = (res?.data || []).map((tx: any) => ({
          date: tx.createdAt,
          description: tx.notes || tx.referenceNo || 'Transaction',
          type: (tx.transactionType || 'CREDIT').toLowerCase(),
          amount: tx.amount
        }));
      },
      error: (err: any) => console.error('loadWalletTransactions error:', err)
    });
  }

  get activeOffers(): any[] {
    return this.browseCoupons;
  }

  get selectedOffer() {
    return this.activeOffers.find((offer) => offer.id === this.selectedOfferId) || this.activeOffers[0] || {};
  }

  get featuredOffers() {
    return this.activeOffers.filter((offer) => offer.isTrending);
  }

  get redeemedCount() {
    return this.ownedCoupons.filter((coupon) => coupon.status === 'used').length;
  }

  get unreadCount() {
    return this.notifications.filter((item) => item.unread).length;
  }

  get purchasedCount() {
    return this.monthlyCouponStats.reduce((sum, item) => sum + item.purchased, 0);
  }

  get assignedCount() {
    return this.monthlyCouponStats.reduce((sum, item) => sum + item.assigned, 0);
  }

  get expiredCount() {
    return this.monthlyCouponStats.reduce((sum, item) => sum + item.expired, 0);
  }

  get thisMonthPurchasedCount() {
    return this.monthlyCouponStats[this.monthlyCouponStats.length - 1]?.purchased || 0;
  }

  get assignedPercentage() {
    return this.purchasedCount === 0 ? 0 : Math.round((this.assignedCount / this.purchasedCount) * 100);
  }

  get expiredPercentage() {
    return this.purchasedCount === 0 ? 0 : Math.round((this.expiredCount / this.purchasedCount) * 100);
  }

  get activeCouponCount() {
    return this.ownedCoupons.filter((coupon) => coupon.status === 'active').length;
  }

  get expiringSoonCouponCount() {
    return this.ownedCoupons.filter(
      (coupon) => coupon.status === 'active' && this.getDaysLeft(coupon.expiresOn) <= 7
    ).length;
  }

  getCouponBarHeight(value: number) {
    const maxValue = Math.max(...this.monthlyCouponStats.map((item) => Math.max(item.purchased, item.assigned, item.expired)), 1);
    const minHeight = 22;
    const maxHeight = 138;
    return Math.round((value / maxValue) * (maxHeight - minHeight) + minHeight);
  }

  get filteredOffers() {
    return this.activeOffers.filter((offer) => {
      const searchMatch =
        this.searchTerm.trim().length === 0 ||
        offer.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const brandMatch = this.selectedBrand === 'All' || offer.brand === this.selectedBrand;
      const categoryMatch = this.selectedCategory === 'All' || offer.category === this.selectedCategory;
      const discountTypeMatch =
        this.selectedDiscountType === 'All' || offer.discountType === this.selectedDiscountType;
      return searchMatch && brandMatch && categoryMatch && discountTypeMatch;
    });
  }

  get filteredOwnedCoupons() {
    return this.ownedCoupons.filter((coupon) => coupon.status === this.activeCouponTab);
  }

  get categoryOffers() {
    return this.activeOffers.filter((offer) => offer.category === this.selectedCategoryView);
  }

  get filteredCategories() {
    const query = this.categorySearchTerm.trim().toLowerCase();
    if (!query) {
      return this.categories;
    }
    return this.categories.filter((category) => category.label.toLowerCase().includes(query));
  }

  get remainingAmount() {
    return this.walletBalance;
  }

  sendOtp() {
    const email = this.emailId.trim();
    this.authError = '';

    if (!email || !this.isValidEmail(email)) {
      this.authError = 'Enter a valid company email address.';
      return;
    }

    if (this.enteredCaptcha.trim().toUpperCase() !== this.captchaCode) {
      this.authError = 'Captcha does not match. Please try again.';
      this.generateCaptcha();
      this.enteredCaptcha = '';
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

    if (!this.enteredOtp || this.enteredOtp.trim().length !== 6) {
      this.authError = 'Enter a valid 6-digit OTP.';
      return;
    }

    this.isVerifyingOtp = true;
    this.api.verifyOTP(this.emailId, this.enteredOtp).subscribe({
      next: (res: any) => {
        this.isVerifyingOtp = false;

        const ok = res?.success || res?.message === 'User logged in successfully.' || res?.message === 'User logged in successfully.';
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

            if (userTypeStr === 'CPOC' ) {
              this.router.navigate(['/cpoc', clientId]);
              sessionStorage.setItem('isCpoc', 'true');
              this.toastr.success('Your login was successful!!');
            } else if ( userTypeStr === 'USER') {
              this.router.navigate(['/clientEmployee/dashboard']);
              this.toastr.success('Your login was successful!!');
            } else {
              this.toastr.error('Something went wrong!');
            }
          } else {
            // Fallback to previous flow which fetches the logged-in user
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

          this.activeScreen = 'home';
          this.showToastMessage('OTP verified successfully');
          this.pushNotification('You are logged in successfully');
        } else if (res?.message === "Incorrect OTP. Please try again.") {
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
    this.enteredOtp = '';
    this.generateCaptcha();
    this.enteredCaptcha = '';
    this.authError = '';
  }

  regenerateCaptcha() {
    this.generateCaptcha();
    this.enteredCaptcha = '';
  }

  navigate(screen: 'home' | 'browse' | 'categories' | 'my-coupons' | 'wallet') {
    this.activeScreen = screen;
    this.showFaqPanel = false;
    this.showNotificationPanel = false;
    if (screen === 'categories' && !this.selectedCategoryView) {
      this.selectedCategoryView = this.categories[0].label;
    }
  }

  showDetails(offerId: number) {
    this.selectedOfferId = offerId;
    this.activeScreen = 'details';
  }

  grabCoupon(offerId: number) {
    const offer = this.activeOffers.find((item) => item.id === offerId);
    if (!offer) return;
    this.grabDialogOffer = offer;
    this.grabAmount = offer.minValue || null;
    this.grabNotes = '';
    this.grabResult = null;
    this.grabDialogStep = 'confirm';
    this.showGrabDialog = true;
  }

  confirmPurchase() {
    if (!this.grabDialogOffer || !this.grabAmount) return;
    this.isProcessingGrab = true;
    const refNo = `REF-${Date.now()}`;
    const payload = {
      userId:           this.userId,
      voucherId:        this.grabDialogOffer.id,
      amount:           this.grabAmount,
      referenceNo:      refNo,
      notes:            this.grabNotes || this.grabDialogOffer.title,
      allocationSource: 'WALLET',
      status:           'PENDING',
      redemptionChannel: this.grabDialogOffer.redemptionType || 'ONLINE'
    };
    this.employeeService.submitPurchase(payload).subscribe({
      next: (res: any) => {
        this.isProcessingGrab = false;
        this.grabResult = {
          refNo:   res?.data?.referenceNo || refNo,
          message: res?.message || 'Voucher claimed successfully!',
          amount:  this.grabAmount
        };
        this.grabDialogStep = 'checkout';
        // Add to owned coupons
        this.ownedCoupons.unshift({
          brand:             this.grabDialogOffer.brand,
          title:             this.grabDialogOffer.title,
          code:              this.grabResult.refNo,
          status:            'active',
          expiresOn:         this.grabDialogOffer.validTill,
          redeemInstruction: 'Copy the reference and apply at checkout'
        });
        this.loadWalletBalance();
        this.pushNotification(`${this.grabDialogOffer.brand} voucher claimed`);
      },
      error: (err: any) => {
        this.isProcessingGrab = false;
        const msg = err?.error?.message || 'Purchase failed. Please try again.';
        this.showToastMessage(msg);
      }
    });
  }

  closeGrabDialog() {
    this.showGrabDialog = false;
    this.grabDialogOffer = null;
    this.grabResult = null;
    this.grabDialogStep = 'confirm';
  }

  copyCode(code: string) {
    this.copiedCouponCode = code;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
    }
    this.showToastMessage(`Coupon code ${code} copied`);
    this.pushNotification(`Coupon ${code} copied`);
    setTimeout(() => {
      this.copiedCouponCode = '';
    }, 1200);
  }

  getDaysLeft(dateValue: string) {
    const now = new Date();
    const expiry = new Date(dateValue);
    const diff = expiry.getTime() - now.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }

  selectCouponTab(tab: 'active' | 'used' | 'expired') {
    this.activeCouponTab = tab;
  }

  goBack() {
    if (this.activeScreen === 'details') {
      this.activeScreen = 'browse';
      return;
    }
    if (this.activeScreen !== 'home') {
      this.activeScreen = 'home';
    }
  }

  toggleSidebar() {
    this.showSidebar = !this.showSidebar;
  }

  toggleNotifications() {
    this.showNotificationPanel = !this.showNotificationPanel;
    if (this.showNotificationPanel) {
      this.showFaqPanel = false;
      this.notifications = this.notifications.map((item) => ({ ...item, unread: false }));
    }
  }

  toggleFaqPanel() {
    this.showFaqPanel = !this.showFaqPanel;
    if (this.showFaqPanel) {
      this.showNotificationPanel = false;
    }
  }

  selectCategoryCard(category: string) {
    this.selectedCategoryView = category;
  }

  selectWalletView(view: 'coupon' | 'amount') {
    this.walletView = view;
  }

  logout() {
    sessionStorage.clear();
    this.router.navigate(['/clientEmployee']);
  }

  openProfile() {
    this.router.navigate(['/clientEmployee/profile']);
  }

  toggleFaqItem(index: number) {
    this.faqOpenIndex = this.faqOpenIndex === index ? -1 : index;
  }

  onQuickAction(action: 'browse' | 'categories' | 'my-coupons' | 'wallet') {
    this.navigate(action);
  }

  private showToastMessage(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2200);
  }

  private pushNotification(message: string) {
    this.notifications.unshift({
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: true
    });
  }

  private generateCaptcha() {
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
        return;
      }
      const ctx = captcahCanvas.getContext('2d');
      if (!ctx) {
        return;
      }

      ctx.fillStyle = this.captchaConfig.back.solid;
      ctx.fillRect(0, 0, captcahCanvas.width, captcahCanvas.height);
      captcahCanvas.style.letterSpacing = '15px';

      ctx.beginPath();
      ctx.font = `${this.captchaConfig.font.size} ${this.captchaConfig.font.family}`;
      ctx.fillStyle = this.captchaConfig.font.color;
      ctx.textBaseline = 'middle';
      ctx.fillText(this.captchaCode, 40, 38);

      if (this.captchaConfig.back.stroke) {
        ctx.strokeStyle = this.captchaConfig.back.stroke;
        for (let i = 0; i < 120; i += 1) {
          ctx.moveTo(Math.random() * 300, Math.random() * 120);
          ctx.lineTo(Math.random() * 300, Math.random() * 120);
        }
        ctx.stroke();
      }
    }, 60);
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
