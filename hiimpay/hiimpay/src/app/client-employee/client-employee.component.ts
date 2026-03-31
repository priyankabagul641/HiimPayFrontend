import { Location } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiService } from '../auth/authservice/api.service';
import { JwtAuthService } from '../auth/authservice/jwt-auth.service';
import { ToastrService } from 'ngx-toastr';
import { EmployeeService } from './Services/userDataService';

@Component({
  selector: 'app-client-employee',
  templateUrl: './client-employee.component.html',
  styleUrls: ['./client-employee.component.css', './dashboard/dashboard.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ClientEmployeeComponent implements OnInit {
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

  activeCouponTab: 'active' | 'used' | 'expired' = 'active';
  selectedOfferId = 1;
  toastMessage = '';
  showToast = false;
  copiedCouponCode = '';
  showSidebar = true;
  showNotificationPanel = false;
  showFaqPanel = false;
  faqOpenIndex = -1;
  selectedCategoryView = 'All';
  categorySearchTerm = '';
  walletView: 'coupon' | 'amount' = 'amount';

  walletBalance = 0;
  totalSavings = 0;
  userId = 0;
  companyId = 0;
  loggedInUserName = '';
  browseCoupons: any[] = [];
  browseCouponsLoading = false;
  userWalletCoupons: any[] = [];
  userWalletCouponsLoading = false;
  couponCounts: any = {
    purchasedCount: 0,
    assignedCount: 0,
    expiredCount: 0,
    totalCount: 0
  };

  showGrabDialog = false;
  grabDialogStep: 'confirm' | 'checkout' = 'confirm';
  grabDialogOffer: any = null;
  grabAmount: number | null = null;
  grabNotes = '';
  isProcessingGrab = false;
  grabResult: any = null;
  grabAmountError = '';

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
  ownedCoupons: any[] = [];

  monthlyCouponStats: Array<{ month: string; purchased: number; assigned: number; expired: number }> = [];
  walletTransactions: Array<{ date: string; description: string; type: string; amount: number }> = [];
  notifications: Array<{ message: string; time: string; unread: boolean }> = [];
  faqs: Array<{ question: string; answer: string }> = [];
  quickActions: Array<{
    title: string;
    description: string;
    action: 'browse' | 'categories' | 'my-coupons' | 'wallet';
    icon: string;
  }> = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private api: ApiService,
    private jwtAuthService: JwtAuthService,
    private toastr: ToastrService,
    private employeeService: EmployeeService
  ) {
    this.generateCaptcha();
  }

  private walletUpdatedHandler = (_: any) => {
    // refresh wallet balance and transactions when notified
    if (this.userId) {
      this.loadWalletBalance();
      this.loadWalletTransactions();
    }
  };

  ngOnInit(): void {
    setTimeout(() => {
      this.generateCaptcha();
    }, 0);

    const userData = JSON.parse(sessionStorage.getItem('currentLoggedInUserData') || '{}');
    this.userId = userData?.id || 0;
    this.companyId = userData?.companyId || userData?.clientId || 0;
    this.loggedInUserName =
      userData?.fullName ||
      userData?.name ||
      ((userData?.firstName || '') + (userData?.lastName ? ' ' + userData.lastName : '')) ||
      '-';

    if (this.userId) {
      this.loadWalletBalance();
      this.loadWalletTransactions();
      this.loadUserWalletCouponsByTab(this.activeCouponTab);
      this.loadCouponCounts();
    }

    if (this.companyId) {
      this.loadBrowseCoupons();
    }

    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.showFaqPanel = false;
      this.showNotificationPanel = false;
    });

    // listen for wallet updates from other components
    window.addEventListener('wallet-updated', this.walletUpdatedHandler as EventListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('wallet-updated', this.walletUpdatedHandler as EventListener);
  }

  get isDashboardRoute(): boolean {
    return this.router.url.includes('/clientEmployee/dashboard');
  }

  get isBrowseRoute(): boolean {
    return this.router.url.includes('/clientEmployee/browse');
  }

  get isMyCouponsRoute(): boolean {
    return this.router.url.includes('/clientEmployee/my-coupons');
  }

  get isWalletRoute(): boolean {
    return this.router.url.includes('/clientEmployee/wallet');
  }

  get isCartRoute(): boolean {
    return this.router.url.includes('/clientEmployee/cart');
  }

  get isDetailsView(): boolean {
    return this.router.url.includes('/clientEmployee/coupon-details/');
  }

  get showBackButton(): boolean {
    return !this.isDashboardRoute || this.isDetailsView;
  }

  get currentTitle(): string {
    if (this.isBrowseRoute) return 'Browse Coupons';
    if (this.isDetailsView) return 'Coupon Details';
    if (this.isCartRoute) return 'Cart';
    if (this.isMyCouponsRoute) return 'My Coupons';
    if (this.isWalletRoute) return 'Wallet & Savings';
    return 'Dashboard';
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
    const brand = b.brand || {};
    const name: string = brand.brandName || b.productName || '-';
    const logo = name.substring(0, 2).toUpperCase();
    const colorMap: Record<string, string> = {
      'E-COMMERCE': '#ff9900',
      GIFT_CARD: '#6c5ce7',
      RETAIL: '#2ecc71',
      'E-VOUCHER': '#00b894',
      FASHION: '#fd79a8'
    };
    const brandType = (brand.brandType || brand.serviceType || '').toUpperCase();
    const brandColor = colorMap[brandType] || '#2980b9';
    const discountPercent = b.discountPercent ?? brand.epayDiscount ?? 0;
    const discountBadge = discountPercent > 0 ? `${discountPercent}% OFF` : '-';
    const discountType = discountPercent > 0 ? 'Percentage' : 'Flat';
    const categoryName = b.category?.categoryName || '-';
    const category = this.categoryNameToLabel(categoryName);
    const expiryDate = b.expiryDate || '-';
    return {
      id: b.id ?? idx + 1,
      brand: name,
      title: b.description || brand.description || '-',
      validTill: expiryDate,
      expiryDate,
      discountPercent,
      discountBadge,
      discountType,
      category,
      categoryName,
      brandLogo: logo,
      brandColor,
      image: b.imageUrl || brand.brandImage || '',
      description: b.description || brand.description || '-',
      terms: brand.tnc || '-',
      redeemSteps: brand.importantInstruction ? [brand.importantInstruction] : ['-'],
      isTrending: brand.stockAvailable !== false,
      minValue: b.minValue ?? brand.epayMinValue,
      maxValue: b.maxValue ?? brand.epayMaxValue,
      redemptionUrl: brand.onlineRedemptionUrl || ''
    };
  }

  private categoryNameToLabel(categoryName: string): string {
    const map: Record<string, string> = {
      FOOD: 'Food & Dining',
      FOOD_AND_DINING: 'Food & Dining',
      TRAVEL: 'Travel',
      ELECTRONICS: 'Electronics',
      FASHION: 'Shopping',
      SHOPPING: 'Shopping',
      'E-COMMERCE': 'Shopping',
      GIFT_CARD: 'Shopping',
      RETAIL: 'Shopping',
      'E-VOUCHER': 'Shopping',
      ENTERTAINMENT: 'Entertainment',
      HEALTH: 'Health & Wellness',
      HEALTH_AND_WELLNESS: 'Health & Wellness',
      WELLNESS: 'Health & Wellness',
      UNCATEGORIZED: 'Other'
    };
    return map[(categoryName || '').toUpperCase()] || categoryName || 'Other';
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
          description: tx.notes || tx.referenceNo || '-',
          type: (tx.transactionType || 'CREDIT').toLowerCase(),
          amount: tx.amount
        }));
      },
      error: (err: any) => console.error('loadWalletTransactions error:', err)
    });
  }

  loadUserWalletCouponsByTab(tab: 'active' | 'used' | 'expired') {
    this.userWalletCouponsLoading = true;
    const request$ =
      tab === 'used'
        ? this.employeeService.getUserWalletsStatusUsedById(this.userId)
        : tab === 'expired'
        ? this.employeeService.getUserWalletsStatusExpiredById(this.userId)
        : this.employeeService.getUserWalletsStatusById(this.userId);

    request$.subscribe({
      next: (res: any) => {
        this.userWalletCouponsLoading = false;
        const walletData = res?.data || [];
        this.userWalletCoupons = walletData.map((item: any) => {
          const wallet = item.wallet || {};
          const brand = wallet.brand || {};
          const usageStatus = (item.usageStatus || '').toUpperCase();
          const status = (wallet.status || '').toUpperCase();
          const isExpired = item.isExpired || wallet.isExpired || false;
          const isRedeemed = item.isUsed || wallet.isRedeemed || false;

          let couponStatus: 'active' | 'used' | 'expired' | '-' = '-';
          if (isRedeemed || usageStatus === 'USED' || status === 'REDEEMED') {
            couponStatus = 'used';
          } else if (isExpired || usageStatus === 'EXPIRED' || status === 'EXPIRED') {
            couponStatus = 'expired';
          } else if (usageStatus === 'ACTIVE' || status === 'ACTIVE' || status === 'ALLOCATED' || status === 'PENDING') {
            couponStatus = 'active';
          }

          const expiresAt = wallet.expiresAt || '';
          const expiresOn = expiresAt ? new Date(expiresAt).toISOString().split('T')[0] : '';

          return {
            id: wallet.id,
            brand: brand.brandName || '-',
            title: brand.description || '-',
            code: wallet.voucherId || wallet.referenceNo || '-',
            status: couponStatus,
            expiresOn,
            redeemInstruction: isRedeemed
              ? `Redeemed on ${wallet.redeemedAt ? new Date(wallet.redeemedAt).toLocaleDateString() : 'N/A'}`
              : isExpired
              ? 'Offer validity ended'
              : brand.importantInstruction || '-',
            imageUrl: brand.brandImage || '',
            redemptionUrl: brand.onlineRedemptionUrl || '-',
            voucherId: wallet.voucherId,
            allocatedAt: wallet.allocatedAt,
            allocationSource: wallet.allocationSource
          };
        });
      },
      error: (err: any) => {
        this.userWalletCouponsLoading = false;
        console.error('loadUserWalletCouponsByTab error:', err);
        this.userWalletCoupons = [];
      }
    });
  }

  loadCouponCounts() {
    this.employeeService.totalCoupousCount(this.userId).subscribe({
      next: (res: any) => {
        if (res?.success && res?.data) {
          this.couponCounts = {
            purchasedCount: res.data.purchasedCount || 0,
            assignedCount: res.data.assignedCount || 0,
            expiredCount: res.data.expiredCount || 0,
            totalCount: res.data.totalCount || 0
          };
        }
      },
      error: (err: any) => {
        console.error('loadCouponCounts error:', err);
      }
    });
  }

  get activeOffers(): any[] {
    return this.browseCoupons;
  }

  get selectedOffer() {
    return this.activeOffers.find((offer) => offer.id === this.selectedOfferId) || this.activeOffers[0] || {};
  }

  get featuredOffers() {
    return this.activeOffers
      .filter((offer) => offer.isTrending)
      .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
      .slice(0, 2);
  }

  get uniqueBrands(): string[] {
    const seen = new Set<string>();
    return this.activeOffers
      .map((o) => o.brand as string)
      .filter((b) => b && !seen.has(b) && seen.add(b) !== undefined);
  }

  get unreadCount() {
    return this.notifications.filter((item) => item.unread).length;
  }

  get purchasedCount() {
    return this.couponCounts.purchasedCount || 0;
  }

  get assignedCount() {
    return this.couponCounts.assignedCount || 0;
  }

  get expiredCount() {
    return this.couponCounts.expiredCount || 0;
  }

  get filteredOffers() {
    return this.activeOffers.filter((offer) => {
      const searchMatch =
        this.searchTerm.trim().length === 0 ||
        offer.brand.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const brandMatch = this.selectedBrand === 'All' || offer.brand === this.selectedBrand;
      const categoryTabMatch = !this.selectedCategoryView || this.selectedCategoryView === 'All' || offer.category === this.selectedCategoryView;
      const discountTypeMatch = this.selectedDiscountType === 'All' || offer.discountType === this.selectedDiscountType;
      return searchMatch && brandMatch && categoryTabMatch && discountTypeMatch;
    });
  }

  get filteredOwnedCoupons() {
    return this.userWalletCoupons.filter((coupon) => coupon.status === this.activeCouponTab);
  }

  get filteredCategories() {
    const iconMap: Record<string, string> = {
      'Food & Dining': 'lunch_dining',
      Shopping: 'shopping_bag',
      Travel: 'flight_takeoff',
      Electronics: 'devices',
      Entertainment: 'movie',
      'Health & Wellness': 'self_improvement',
      Other: 'category'
    };
    const accentMap: Record<string, string> = {
      'Food & Dining': 'food',
      Shopping: 'shopping',
      Travel: 'travel',
      Electronics: 'electronics',
      Entertainment: 'entertainment',
      'Health & Wellness': 'wellness',
      Other: 'other'
    };
    const seen = new Set<string>();
    const dynamic: { icon: string; label: string; accent: string }[] = [];
    dynamic.push({ icon: 'apps', label: 'All', accent: 'all' });
    seen.add('All');
    for (const coupon of this.browseCoupons) {
      const label = coupon.category || 'Other';
      if (!seen.has(label)) {
        seen.add(label);
        dynamic.push({ icon: iconMap[label] ?? 'category', label, accent: accentMap[label] ?? 'other' });
      }
    }
    const query = this.categorySearchTerm.trim().toLowerCase();
    return query ? dynamic.filter((c) => c.label.toLowerCase().includes(query)) : dynamic;
  }

  get remainingAmount() {
    return this.walletBalance;
  }

  openCouponDetails(offerId: number) {
    this.selectedOfferId = offerId;
    this.router.navigate(['/clientEmployee/coupon-details', offerId]);
  }

  grabCoupon(offerId: number) {
    const offer = this.activeOffers.find((item) => item.id === offerId);
    if (!offer) return;
    this.grabDialogOffer = offer;
    this.grabAmount = offer.minValue || null;
    this.grabNotes = '';
    this.grabResult = null;
    this.grabAmountError = '';
    this.grabDialogStep = 'confirm';
    this.showGrabDialog = true;
  }

  validateGrabAmount() {
    this.grabAmountError = '';
    const amount = this.grabAmount;
    const min = this.grabDialogOffer?.minValue;
    const max = this.grabDialogOffer?.maxValue;
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      this.grabAmountError = 'Please enter a valid amount.';
    } else if (min !== undefined && min !== null && amount < min) {
      this.grabAmountError = `Amount is below the minimum voucher value of ₹${min}.`;
    } else if (max !== undefined && max !== null && amount > max) {
      this.grabAmountError = `Amount exceeds the maximum voucher value of ₹${max}.`;
    }
  }

  confirmPurchase() {
    if (!this.grabDialogOffer || !this.grabAmount) return;
    this.validateGrabAmount();
    if (this.grabAmountError) return;
    this.isProcessingGrab = true;
    const refNo = `REF-${Date.now()}`;
    const payload = {
      userId: this.userId,
      voucherId: this.grabDialogOffer.id,
      amount: this.grabAmount,
      referenceNo: refNo,
      notes: this.grabNotes || this.grabDialogOffer.title,
      allocationSource: 'PURCHASE',
      status: 'PENDING',
      redemptionChannel: this.grabDialogOffer.redemptionType || 'ONLINE'
    };
    this.employeeService.submitPurchase(payload).subscribe({
      next: (res: any) => {
        this.isProcessingGrab = false;
        this.grabResult = {
          refNo: res?.data?.referenceNo || refNo,
          message: res?.message || 'Voucher claimed successfully!',
          amount: this.grabAmount
        };
        this.grabDialogStep = 'checkout';
        this.loadUserWalletCouponsByTab(this.activeCouponTab);
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

  async copyCode(code: string) {
    if (!code) return;
    const value = String(code).trim();
    if (!value) return;

    this.copiedCouponCode = value;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        this.copyTextWithFallback(value);
      }
      this.showToastMessage(`Coupon code ${value} copied`);
      this.pushNotification(`Coupon ${value} copied`);
    } catch {
      try {
        this.copyTextWithFallback(value);
        this.showToastMessage(`Coupon code ${value} copied`);
        this.pushNotification(`Coupon ${value} copied`);
      } catch {
        this.showToastMessage('Unable to copy coupon code. Please copy manually.');
      }
    }

    setTimeout(() => {
      this.copiedCouponCode = '';
    }, 1200);
  }

  private copyTextWithFallback(text: string): void {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const copied = document.execCommand('copy');
    document.body.removeChild(textArea);
    if (!copied) {
      throw new Error('Copy command failed');
    }
  }

  getDaysLeft(dateValue: string) {
    const now = new Date();
    const expiry = new Date(dateValue);
    if (isNaN(expiry.getTime())) return 0;
    const diff = expiry.getTime() - now.getTime();
    return Math.max(Math.ceil(diff / (1000 * 60 * 60 * 24)), 0);
  }

  selectCouponTab(tab: 'active' | 'used' | 'expired') {
    this.activeCouponTab = tab;
    if (this.userId) {
      this.loadUserWalletCouponsByTab(tab);
    }
  }

  goBack() {
    this.location.back();
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
    this.router.navigate(['/clientEmployee/login']);
  }

  openProfile() {
    this.router.navigate(['/clientEmployee/profile']);
  }

  openCart() {
    this.router.navigate(['/clientEmployee/cart']);
  }

  toggleFaqItem(index: number) {
    this.faqOpenIndex = this.faqOpenIndex === index ? -1 : index;
  }

  onQuickAction(action: 'browse' | 'categories' | 'my-coupons' | 'wallet') {
    if (action === 'browse' || action === 'categories') {
      this.router.navigate(['/clientEmployee/browse']);
      return;
    }
    if (action === 'my-coupons') {
      this.router.navigate(['/clientEmployee/my-coupons']);
      return;
    }
    if (action === 'wallet') {
      this.router.navigate(['/clientEmployee/wallet']);
    }
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
      error: () => {
        this.isSendingOtp = false;
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
        const ok = res?.success || res?.message === 'User logged in successfully.';
        if (ok) {
          const tokenFromResp = res?.data?.token || res?.data;
          const userFromResp = res?.data?.user || null;

          if (tokenFromResp) {
            this.jwtAuthService.setToken(tokenFromResp);
          }

          if (userFromResp) {
            try {
              sessionStorage.setItem('currentLoggedInUserData', JSON.stringify(userFromResp));
            } catch {}
            const userTypeStr = (userFromResp.userType || '').toString().toUpperCase();
            const clientId = userFromResp.companyId || userFromResp.clientId || null;

            if (userTypeStr === 'CPOC') {
              this.router.navigate(['/cpoc', clientId]);
              sessionStorage.setItem('isCpoc', 'true');
              this.toastr.success('Your login was successful!!');
            } else if (userTypeStr === 'USER') {
              this.router.navigate(['/clientEmployee/dashboard']);
              this.toastr.success('Your login was successful!!');
            } else {
              this.toastr.error('Something went wrong!');
            }
          }

          this.showToastMessage('OTP verified successfully');
          this.pushNotification('You are logged in successfully');
        } else {
          this.authError = res?.message || 'OTP verification failed. Please try again.';
        }
      },
      error: () => {
        this.isVerifyingOtp = false;
        this.authError = 'OTP verification failed. Please try again later.';
      }
    });
  }
}
