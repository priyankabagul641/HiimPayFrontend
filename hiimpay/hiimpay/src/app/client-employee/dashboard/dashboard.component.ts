import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../auth/authservice/api.service';
import { JwtAuthService } from '../../auth/authservice/jwt-auth.service';
import { ToastrService } from 'ngx-toastr';

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

  isAuthenticated = false;
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

  walletBalance = 4280;
  totalSavings = 12840;
  usedAmount = 8560;

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

  offers = [
    {
      id: 1,
      brand: 'Swiggy',
      title: 'Flat Rs 500 Off',
      validTill: '2026-03-08',
      discountBadge: '40% OFF',
      discountType: 'Flat',
      category: 'Food & Dining',
      brandLogo: 'SW',
      brandColor: '#ff6b2b',
      image: 'assets/images/servey1.jfif',
      description: 'Get instant discount on food orders above Rs 1499.',
      terms: 'Valid once per employee. Not valid with other promo codes.',
      redeemSteps: ['Tap Grab Coupon', 'Copy the code', 'Apply at checkout'],
      isTrending: true
    },
    {
      id: 2,
      brand: 'Myntra',
      title: 'Extra 25% Off',
      validTill: '2026-03-20',
      discountBadge: '25% OFF',
      discountType: 'Percentage',
      category: 'Shopping',
      brandLogo: 'MY',
      brandColor: '#ff3f7f',
      image: 'assets/images/servey2.png',
      description: 'Extra discount on top fashion brands and beauty.',
      terms: 'Min order value Rs 1999. Select categories only.',
      redeemSteps: ['Grab the coupon', 'Copy code', 'Paste in payment page'],
      isTrending: true
    },
    {
      id: 3,
      brand: 'MakeMyTrip',
      title: 'Save Rs 1200 on Flights',
      validTill: '2026-03-14',
      discountBadge: 'Rs 1200 OFF',
      discountType: 'Flat',
      category: 'Travel',
      brandLogo: 'MM',
      brandColor: '#2e7bdd',
      image: 'assets/images/servey3.jfif',
      description: 'Discount on domestic one-way and round-trip flights.',
      terms: 'Only for bookings above Rs 7000. Limited seats.',
      redeemSteps: ['Tap Grab Coupon', 'Use code on flight checkout', 'Confirm booking'],
      isTrending: false
    },
    {
      id: 4,
      brand: 'Croma',
      title: 'Up to 15% Cashback',
      validTill: '2026-03-30',
      discountBadge: 'Cashback',
      discountType: 'Cashback',
      category: 'Electronics',
      brandLogo: 'CR',
      brandColor: '#2f4e7a',
      image: 'assets/images/servey4.png',
      description: 'Cashback on gadgets, accessories and smart appliances.',
      terms: 'Cashback credited in 7 business days.',
      redeemSteps: ['Claim the offer', 'Pay via supported method', 'Cashback auto-credits'],
      isTrending: true
    }
  ];

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
  walletTransactions = [
    { date: '2026-02-18', description: 'Food Coupon Redemption', type: 'debit', amount: 540 },
    { date: '2026-02-14', description: 'Wallet Top-up', type: 'credit', amount: 1200 },
    { date: '2026-02-11', description: 'Travel Offer Redemption', type: 'debit', amount: 980 },
    { date: '2026-02-07', description: 'Shopping Cashback Credit', type: 'credit', amount: 460 },
    { date: '2026-02-02', description: 'Entertainment Coupon Redemption', type: 'debit', amount: 320 }
  ];
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
    { title: 'Savings Insights', description: 'Track monthly performance', action: 'wallet', icon: 'analytics' },
    { title: 'Explore Categories', description: 'Find offers by use case', action: 'categories', icon: 'grid_view' }
  ];

  constructor(private router: Router, private api: ApiService, private jwtAuthService: JwtAuthService, private toastr: ToastrService) {
    this.generateCaptcha();
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.generateCaptcha();
    }, 0);
  }

  get selectedOffer() {
    return this.offers.find((offer) => offer.id === this.selectedOfferId) || this.offers[0];
  }

  get featuredOffers() {
    return this.offers.filter((offer) => offer.isTrending);
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
    return this.offers.filter((offer) => {
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
    return this.offers.filter((offer) => offer.category === this.selectedCategoryView);
  }

  get filteredCategories() {
    const query = this.categorySearchTerm.trim().toLowerCase();
    if (!query) {
      return this.categories;
    }
    return this.categories.filter((category) => category.label.toLowerCase().includes(query));
  }

  get remainingAmount() {
    return Math.max(this.walletBalance - this.usedAmount, 0);
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
        if (res?.message === 'User logged in successfully.' || res?.message === 'User logged in successfully. Demographic information missing.' || res?.success) {
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
          this.isAuthenticated = true;
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
    const offer = this.offers.find((item) => item.id === offerId);
    if (!offer) {
      return;
    }

    const alreadyClaimed = this.ownedCoupons.some((coupon) => coupon.title === offer.title);
    if (!alreadyClaimed) {
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const code = `${offer.brand.toUpperCase().slice(0, 4)}${randomSuffix}`;
      this.ownedCoupons.unshift({
        brand: offer.brand,
        title: offer.title,
        code,
        status: 'active',
        expiresOn: offer.validTill,
        redeemInstruction: 'Copy code and apply during checkout'
      });
      this.totalSavings += 500;
    }

    this.showToastMessage(`${offer.brand} coupon grabbed successfully`);
    this.pushNotification(`${offer.brand} coupon grabbed`);
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
    this.router.navigate(['/auth']);
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
