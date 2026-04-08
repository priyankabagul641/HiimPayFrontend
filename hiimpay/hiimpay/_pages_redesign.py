"""GyFTR-style redesign: Voucher Detail, Cart, and Profile pages"""
import os

BASE = r"c:\Users\Priyanka jadhav\Documents\GitHub\HiimPayFrontend\hiimpay\hiimpay\src\app\public"
files = {}

# ===================================================================
# VOUCHER DETAILS — HTML (GyFTR product page style)
# ===================================================================
files[os.path.join(BASE, "vouchers", "voucher-details", "voucher-details.component.html")] = r'''<div class="detail-page" *ngIf="!loading && voucher">

  <!-- ===== PRODUCT HERO ===== -->
  <section class="product-hero">
    <div class="hero-inner">
      <!-- Left: Brand image -->
      <div class="hero-brand">
        <div class="hero-badge">
          <mat-icon>verified</mat-icon> Redeemable Outlet
        </div>
        <div class="hero-logo-box">
          <img [src]="voucher.brandLogo" [alt]="voucher.brand"
            (error)="$any($event.target).src='https://placehold.co/280x160/ffffff/334155?text='+voucher.brand" />
        </div>
      </div>

      <!-- Center: Info -->
      <div class="hero-info">
        <h1>{{ voucher.brand }}</h1>
        <p class="hero-subtitle">{{ voucher.name }} (Instant Vouchers)</p>
        <div class="hero-desc-wrap">
          <button class="hero-nav" (click)="goBack()"><mat-icon>chevron_left</mat-icon></button>
          <p class="hero-desc">{{ voucher.description }}</p>
          <button class="hero-nav"><mat-icon>chevron_right</mat-icon></button>
        </div>
        <a class="hero-tc">T&C*</a>
      </div>

      <!-- Right: Quick links -->
      <div class="hero-links">
        <button class="hl-item" (click)="activeTab='terms'">
          <mat-icon>description</mat-icon>
          <span>INSTRUCTIONS</span>
        </button>
        <button class="hl-item" *ngIf="voucher.redemptionType !== 'ONLINE'">
          <mat-icon>location_on</mat-icon>
          <span>STORE LOCATOR</span>
        </button>
        <button class="hl-item" (click)="activeTab='redeem'">
          <mat-icon>help_outline</mat-icon>
          <span>HOW TO REDEEM?</span>
        </button>
      </div>
    </div>
  </section>

  <!-- ===== COUPON CODE ===== -->
  <section class="coupon-section">
    <div class="coupon-inner">
      <div class="coupon-input-wrap">
        <mat-icon>confirmation_number</mat-icon>
        <input type="text" placeholder="Enter Code" [(ngModel)]="couponCode" />
      </div>
      <button class="coupon-apply" (click)="applyCoupon()">APPLY</button>
    </div>
  </section>

  <!-- ===== MAIN CONTENT: Payment + Denominations | Cart ===== -->
  <section class="main-section">
    <div class="main-inner">
      <div class="main-left">

        <!-- Payment method selector -->
        <div class="payment-methods">
          <span class="pm-label">I will pay using</span>
          <div class="pm-options">
            <button class="pm-opt" [class.active]="selectedPayment === 'upi'" (click)="selectedPayment='upi'">
              <span class="pm-icon upi">UPI</span> UPI
            </button>
            <button class="pm-opt" [class.active]="selectedPayment === 'cc'" (click)="selectedPayment='cc'">
              <mat-icon>credit_card</mat-icon> Credit Card
            </button>
            <button class="pm-opt" [class.active]="selectedPayment === 'epay'" (click)="selectedPayment='epay'">
              <mat-icon>account_balance_wallet</mat-icon> e-Pay
            </button>
            <button class="pm-opt" [class.active]="selectedPayment === 'dc'" (click)="selectedPayment='dc'">
              <mat-icon>payment</mat-icon> Debit Card
            </button>
          </div>
        </div>

        <!-- Denomination cards -->
        <div class="denom-cards">
          <div class="denom-card" *ngFor="let d of voucher.denomination"
            [class.active]="selectedDenomination === d">
            <div class="dc-price">&#8377; {{ d }}</div>
            <div class="dc-pay">
              <span class="dc-label">YOU PAY(&#8377;)</span>
              <span class="dc-amount">{{ getEffectivePrice(d) }}</span>
            </div>
            <button class="dc-add" (click)="addDenominationToCart(d)">ADD</button>
          </div>
        </div>

        <!-- T&C / How to redeem (collapsible) -->
        <div class="info-section" *ngIf="activeTab">
          <div class="info-card">
            <div class="info-header">
              <h3>{{ activeTab === 'terms' ? 'Terms & Conditions' : 'How to Redeem' }}</h3>
              <button class="info-close" (click)="activeTab=''"><mat-icon>close</mat-icon></button>
            </div>
            <p class="pre-wrap">{{ activeTab === 'terms' ? voucher.termsAndConditions : voucher.howToRedeem }}</p>
          </div>
        </div>
      </div>

      <!-- Right: Cart sidebar -->
      <aside class="cart-sidebar">
        <div class="cs-header">CART</div>
        <div class="cs-empty" *ngIf="cartItems.length === 0">
          <mat-icon>shopping_cart</mat-icon>
          <span>Your cart is empty</span>
        </div>
        <div class="cs-items" *ngIf="cartItems.length > 0">
          <div class="cs-item" *ngFor="let item of cartItems">
            <div class="csi-header">
              <span class="csi-brand">{{ item.brand }}</span>
              <button class="csi-remove" (click)="removeCartItem(item)"><mat-icon>delete</mat-icon></button>
            </div>
            <div class="csi-row">
              <span>&#8377; {{ item.price }}</span>
              <div class="csi-qty">
                <button (click)="decrementCartItem(item)"><mat-icon>remove</mat-icon></button>
                <span>{{ item.quantity }}</span>
                <button (click)="incrementCartItem(item)"><mat-icon>add</mat-icon></button>
              </div>
              <span class="csi-total">&#8377; {{ item.price * item.quantity }}</span>
            </div>
            <div class="csi-discount" *ngIf="item.discountPercent > 0">
              {{ item.discountPercent }}% Discount
              <span>&#8377; {{ (item.price - item.discountedPrice) * item.quantity }}</span>
            </div>
          </div>
        </div>
        <div class="cs-footer" *ngIf="cartItems.length > 0">
          <div class="csf-row total-val">
            <span>Total Value</span>
            <span>&#8377; {{ cartTotalValue }}</span>
          </div>
          <div class="csf-row save-row" *ngIf="cartTotalSavings > 0">
            <span>You Save</span>
            <span>&#8377; {{ cartTotalSavings }}</span>
          </div>
          <div class="csf-row pay-row">
            <span>You Pay</span>
            <span>&#8377; {{ cartTotalPay }}</span>
          </div>
          <button class="cs-checkout" (click)="goToCart()">Go to Cart</button>
        </div>
      </aside>
    </div>
  </section>
</div>

<!-- Loading skeleton -->
<div class="detail-page loading-page" *ngIf="loading">
  <section class="product-hero">
    <div class="hero-inner">
      <div class="hero-brand"><div class="skel" style="width:240px;height:150px;border-radius:12px"></div></div>
      <div class="hero-info"><div class="skel" style="width:60%;height:28px;margin-bottom:12px"></div><div class="skel" style="width:90%;height:60px"></div></div>
      <div class="hero-links"><div class="skel" style="width:100%;height:120px;border-radius:8px"></div></div>
    </div>
  </section>
</div>
'''

# ===================================================================
# VOUCHER DETAILS — CSS (GyFTR style)
# ===================================================================
files[os.path.join(BASE, "vouchers", "voucher-details", "voucher-details.component.css")] = r''':host { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.detail-page { background: #fafafa; min-height: 80vh; padding-bottom: 48px; }

/* ===== PRODUCT HERO (Gyftr style) ===== */
.product-hero { background: #fff; border-bottom: 1px solid #e5e7eb; }
.hero-inner {
  max-width: 1200px; margin: 0 auto; padding: 28px 32px;
  display: grid; grid-template-columns: 280px 1fr 200px; gap: 32px;
  align-items: start;
}

/* Brand box */
.hero-brand { position: relative; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 600; color: #16a34a;
  margin-bottom: 12px;
}
.hero-badge mat-icon { font-size: 16px; width: 16px; height: 16px; color: #16a34a; }
.hero-logo-box {
  width: 240px; height: 150px; border-radius: 12px;
  border: 1px solid #e5e7eb; background: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.hero-logo-box img { max-height: 90px; max-width: 190px; object-fit: contain; }

/* Info center */
.hero-info { padding-top: 4px; }
.hero-info h1 {
  font-size: 24px; font-weight: 700; color: #1e293b;
  margin: 0 0 4px; letter-spacing: -0.3px;
}
.hero-subtitle { font-size: 14px; color: #6b7280; margin: 0 0 16px; }
.hero-desc-wrap {
  display: flex; align-items: flex-start; gap: 12px;
}
.hero-nav {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 50%;
  width: 32px; height: 32px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #6b7280; transition: all 0.2s; margin-top: 4px;
}
.hero-nav:hover { border-color: #9ca3af; color: #374151; }
.hero-nav mat-icon { font-size: 20px; width: 20px; height: 20px; }
.hero-desc {
  font-size: 13px; line-height: 1.7; color: #6b7280; margin: 0;
  flex: 1;
}
.hero-tc {
  display: inline-block; margin-top: 10px;
  font-size: 12px; color: #3b82f6; cursor: pointer;
  text-decoration: none; font-weight: 500;
}
.hero-tc:hover { text-decoration: underline; }

/* Quick links */
.hero-links { display: flex; flex-direction: column; gap: 0; }
.hl-item {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 0; border: none; background: none;
  cursor: pointer; font-size: 13px; font-weight: 600; color: #374151;
  border-bottom: 1px solid #f1f5f9; transition: color 0.2s;
  font-family: 'Inter', sans-serif; text-transform: uppercase;
  letter-spacing: 0.3px;
}
.hl-item:last-child { border-bottom: none; }
.hl-item:hover { color: #7c3aed; }
.hl-item mat-icon { font-size: 22px; width: 22px; height: 22px; color: #6b7280; }
.hl-item:hover mat-icon { color: #7c3aed; }

/* ===== COUPON ===== */
.coupon-section { max-width: 1200px; margin: 0 auto; padding: 20px 32px 0; }
.coupon-inner {
  display: flex; align-items: center; gap: 0;
  max-width: 420px;
}
.coupon-input-wrap {
  flex: 1; display: flex; align-items: center; gap: 8px;
  border: 1px solid #d1d5db; border-right: none;
  border-radius: 4px 0 0 4px; padding: 0 12px; height: 42px;
  background: #fff;
}
.coupon-input-wrap mat-icon { font-size: 18px; width: 18px; height: 18px; color: #9ca3af; }
.coupon-input-wrap input {
  flex: 1; border: none; outline: none; background: transparent;
  font-size: 14px; color: #374151; font-family: 'Inter', sans-serif;
}
.coupon-input-wrap input::placeholder { color: #9ca3af; }
.coupon-apply {
  padding: 0 24px; height: 42px; border: 1px solid #d1d5db;
  border-radius: 0 4px 4px 0; background: #f3f4f6;
  font-size: 13px; font-weight: 700; color: #374151;
  cursor: pointer; transition: all 0.2s;
  font-family: 'Inter', sans-serif; letter-spacing: 0.5px;
}
.coupon-apply:hover { background: #e5e7eb; }

/* ===== MAIN SECTION ===== */
.main-section { max-width: 1200px; margin: 0 auto; padding: 24px 32px 0; }
.main-inner { display: grid; grid-template-columns: 1fr 280px; gap: 28px; align-items: start; }
.main-left { min-width: 0; }

/* Payment methods */
.payment-methods {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 20px; margin-bottom: 24px;
}
.pm-label { font-size: 14px; font-weight: 500; color: #374151; display: block; margin-bottom: 14px; }
.pm-options { display: flex; gap: 0; }
.pm-opt {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px 12px; border: 1px solid #e5e7eb;
  background: #fff; cursor: pointer; font-size: 13px; font-weight: 500;
  color: #6b7280; transition: all 0.2s; font-family: 'Inter', sans-serif;
}
.pm-opt:first-child { border-radius: 6px 0 0 6px; }
.pm-opt:last-child { border-radius: 0 6px 6px 0; }
.pm-opt + .pm-opt { border-left: none; }
.pm-opt:hover { background: #f9fafb; }
.pm-opt.active {
  background: #ecfdf5; border-color: #86efac; color: #16a34a;
  position: relative;
}
.pm-opt.active::after {
  content: ''; position: absolute; top: 6px; right: 6px;
  width: 14px; height: 14px; border-radius: 50%;
  background: #16a34a;
}
.pm-opt mat-icon { font-size: 20px; width: 20px; height: 20px; }
.pm-icon.upi {
  display: inline-block; padding: 2px 6px; border-radius: 3px;
  font-size: 10px; font-weight: 800; background: #3b82f6; color: #fff;
  letter-spacing: 0.5px;
}

/* Denomination cards */
.denom-cards { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
.denom-card {
  flex: 1; min-width: 180px; max-width: 250px;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 20px; text-align: center;
  transition: all 0.2s;
}
.denom-card:hover { border-color: #d1d5db; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
.denom-card.active { border-color: #7c3aed; }
.dc-price { font-size: 22px; font-weight: 800; color: #1e293b; margin-bottom: 12px; }
.dc-pay { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
.dc-label { font-size: 11px; font-weight: 600; color: #3b82f6; text-transform: uppercase; }
.dc-amount { font-size: 16px; font-weight: 700; color: #1e293b; }
.dc-add {
  width: 100%; padding: 10px; border: 1px solid #e5e7eb;
  border-radius: 4px; background: #fff; font-size: 14px;
  font-weight: 700; color: #374151; cursor: pointer;
  transition: all 0.2s; font-family: 'Inter', sans-serif;
  letter-spacing: 0.5px;
}
.dc-add:hover { background: #f3f4f6; border-color: #d1d5db; }

/* Info section */
.info-section { margin-bottom: 24px; }
.info-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  padding: 20px; animation: fadeIn 0.25s ease-out;
}
.info-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.info-header h3 { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0; }
.info-close { background: none; border: none; cursor: pointer; color: #9ca3af; padding: 4px; border-radius: 6px; }
.info-close:hover { background: #f3f4f6; color: #374151; }
.info-close mat-icon { font-size: 20px; width: 20px; height: 20px; }
.pre-wrap { white-space: pre-line; font-size: 13px; line-height: 1.8; color: #6b7280; margin: 0; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

/* ===== CART SIDEBAR ===== */
.cart-sidebar {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  overflow: hidden; position: sticky; top: 100px;
}
.cs-header {
  background: #1e293b; color: #fff; padding: 14px 18px;
  font-size: 14px; font-weight: 800; letter-spacing: 1px;
}
.cs-empty {
  padding: 32px 18px; text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: #9ca3af; font-size: 13px;
}
.cs-empty mat-icon { font-size: 32px; width: 32px; height: 32px; color: #d1d5db; }
.cs-items { max-height: 400px; overflow-y: auto; }
.cs-item { padding: 14px 18px; border-bottom: 1px solid #f1f5f9; }
.csi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.csi-brand { font-size: 14px; font-weight: 700; color: #1e293b; }
.csi-remove { background: none; border: none; cursor: pointer; color: #ef4444; padding: 2px; }
.csi-remove mat-icon { font-size: 18px; width: 18px; height: 18px; }
.csi-row { display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: #374151; }
.csi-qty { display: flex; align-items: center; gap: 6px; }
.csi-qty button {
  width: 24px; height: 24px; border-radius: 4px; border: 1px solid #e5e7eb;
  background: #fff; cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 14px; color: #374151; padding: 0;
}
.csi-qty button mat-icon { font-size: 14px; width: 14px; height: 14px; }
.csi-qty span { font-size: 13px; font-weight: 600; min-width: 16px; text-align: center; }
.csi-total { font-weight: 700; }
.csi-discount { font-size: 12px; color: #16a34a; margin-top: 4px; display: flex; justify-content: space-between; }

/* Footer */
.cs-footer { padding: 14px 18px; border-top: 1px solid #e5e7eb; }
.csf-row { display: flex; justify-content: space-between; font-size: 13px; color: #374151; padding: 3px 0; }
.csf-row.total-val { font-weight: 700; }
.csf-row.save-row { color: #16a34a; font-weight: 600; }
.csf-row.pay-row { font-size: 15px; font-weight: 800; color: #1e293b; margin-top: 6px; padding-top: 8px; border-top: 1px solid #f1f5f9; }
.cs-checkout {
  width: 100%; margin-top: 12px; padding: 11px;
  border: none; border-radius: 6px;
  background: #1e293b; color: #fff;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background 0.2s; font-family: 'Inter', sans-serif;
}
.cs-checkout:hover { background: #334155; }

/* Skeleton */
.skel {
  background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
  background-size: 200% 100%; animation: shimmer 1.8s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

/* RESPONSIVE */
@media (max-width: 900px) {
  .hero-inner { grid-template-columns: 1fr; gap: 20px; }
  .hero-logo-box { width: 200px; height: 120px; }
  .hero-links { flex-direction: row; flex-wrap: wrap; gap: 0; }
  .hl-item { border-bottom: none; border-right: 1px solid #f1f5f9; padding: 10px 16px; }
  .main-inner { grid-template-columns: 1fr; }
  .cart-sidebar { position: static; }
}
@media (max-width: 640px) {
  .hero-inner, .coupon-inner, .main-section { padding-left: 16px; padding-right: 16px; }
  .pm-options { flex-wrap: wrap; }
  .pm-opt { flex: 1 1 45%; }
  .pm-opt:first-child { border-radius: 6px 0 0 0; }
  .pm-opt:nth-child(2) { border-radius: 0 6px 0 0; border-left: none; }
  .pm-opt:nth-child(3) { border-radius: 0 0 0 6px; border-top: none; }
  .pm-opt:last-child { border-radius: 0 0 6px 0; border-top: none; border-left: none; }
  .denom-cards { flex-direction: column; }
  .denom-card { max-width: 100%; }
  .hero-desc-wrap { flex-direction: column; }
  .hero-nav { display: none; }
}
'''

# ===================================================================
# CART PAGE — HTML (GyFTR cart/checkout hybrid)
# ===================================================================
files[os.path.join(BASE, "vouchers", "cart", "cart.component.html")] = r'''<div class="cart-page">
  <div class="cart-container">

    <!-- Empty Cart -->
    <div class="cart-empty" *ngIf="cartItems.length === 0">
      <div class="ce-graphic"><mat-icon>shopping_cart</mat-icon></div>
      <h2>Your cart is empty</h2>
      <p>Explore our gift cards and find something special</p>
      <button class="ce-btn" (click)="continueShopping()"><mat-icon>storefront</mat-icon> Browse Gift Cards</button>
    </div>

    <!-- Filled Cart -->
    <div class="cart-grid" *ngIf="cartItems.length > 0">

      <!-- LEFT: Cart items -->
      <div class="cart-left">

        <!-- Payment Details header -->
        <div class="pd-header">
          <span>Payment Details</span>
          <div class="pd-method">
            <span class="pd-upi">UPI</span>
          </div>
        </div>

        <!-- Cart items -->
        <div class="ci-list">
          <div class="ci-card" *ngFor="let item of cartItems">
            <div class="ci-top">
              <div class="ci-brand-area">
                <div class="ci-logo">
                  <img [src]="item.brandLogo" [alt]="item.brand"
                    (error)="$any($event.target).src='https://placehold.co/80x60/ffffff/334155?text='+item.brand" />
                </div>
                <div class="ci-info">
                  <h3>{{ item.brand }}</h3>
                  <span class="ci-type">E-Gift Card (Instant Vouchers)</span>
                  <span class="ci-discount" *ngIf="item.discountPercent > 0">{{ item.discountPercent }}% OFF</span>
                </div>
              </div>
              <div class="ci-summary">
                <div class="ci-summary-row">
                  <span class="ci-save-label">Savings</span>
                  <span class="ci-save-val">&#8377; {{ (item.price - item.discountedPrice) * item.quantity }}</span>
                </div>
                <div class="ci-summary-row">
                  <span>You Pay</span>
                  <span class="ci-pay-val">&#8377;{{ item.discountedPrice * item.quantity }}</span>
                </div>
              </div>
            </div>
            <div class="ci-bottom">
              <div class="ci-detail">
                <div class="ci-d-col">
                  <span class="ci-d-label">Value</span>
                  <span class="ci-d-value">&#8377; {{ item.price }}</span>
                </div>
                <div class="ci-d-col">
                  <span class="ci-d-label">Quantity</span>
                  <div class="ci-qty">
                    <button (click)="decrementQty(item)" [disabled]="item.quantity <= 1">&mdash;</button>
                    <span>{{ item.quantity }}</span>
                    <button (click)="incrementQty(item)" [disabled]="item.quantity >= 10">+</button>
                  </div>
                </div>
                <div class="ci-d-col">
                  <span class="ci-d-label">Total Value</span>
                  <span class="ci-d-value">&#8377; {{ item.price * item.quantity }}</span>
                </div>
              </div>
              <button class="ci-remove" (click)="removeItem(item)">
                <mat-icon>delete</mat-icon> Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Payment Summary -->
      <aside class="cart-right">
        <div class="ps-card">
          <div class="ps-header">Payment Summary</div>
          <div class="ps-voucher-row">
            <span>Voucher Value</span>
            <span class="ps-val">&#8377; {{ total + totalSavings }}</span>
          </div>

          <table class="ps-table">
            <thead>
              <tr>
                <th>Payment Method</th>
                <th>Surcharge/<br>Savings(&#8377;)</th>
                <th>Payable(&#8377;)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><mat-icon>credit_card</mat-icon> Credit Card</td>
                <td class="surcharge">{{ totalSavings }}</td>
                <td>{{ total }}</td>
              </tr>
              <tr>
                <td><mat-icon>payment</mat-icon> Debit Card</td>
                <td class="surcharge">{{ totalSavings }}</td>
                <td>{{ total }}</td>
              </tr>
              <tr class="highlight">
                <td><span class="upi-badge">UPI</span> UPI</td>
                <td class="surcharge best">{{ totalSavings }}</td>
                <td class="best">{{ total }}</td>
              </tr>
            </tbody>
          </table>

          <button class="ps-pay-btn" (click)="proceedToCheckout()">
            PAY &#8377; {{ total }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</div>
'''

# ===================================================================
# CART PAGE — CSS (GyFTR style)
# ===================================================================
files[os.path.join(BASE, "vouchers", "cart", "cart.component.css")] = r''':host { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.cart-page { background: #fafafa; min-height: 70vh; padding: 28px 0 64px; }
.cart-container { max-width: 1200px; margin: 0 auto; padding: 0 32px; }

/* Empty */
.cart-empty { text-align: center; padding: 80px 24px; }
.ce-graphic mat-icon { font-size: 80px; width: 80px; height: 80px; color: #d1d5db; margin-bottom: 16px; }
.cart-empty h2 { font-size: 22px; font-weight: 700; color: #334155; margin: 0 0 8px; }
.cart-empty p { font-size: 15px; color: #9ca3af; margin: 0 0 24px; }
.ce-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 32px; border-radius: 8px; border: none;
  background: #1e293b; color: #fff; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif;
}
.ce-btn:hover { background: #334155; }

/* Grid */
.cart-grid { display: grid; grid-template-columns: 1fr 340px; gap: 28px; align-items: start; }

/* LEFT */
.cart-left { min-width: 0; }

/* Payment Details header */
.pd-header {
  display: flex; align-items: center; justify-content: space-between;
  background: #1e293b; color: #fff; padding: 14px 20px;
  border-radius: 8px 8px 0 0; font-size: 15px; font-weight: 700;
}
.pd-method { display: flex; align-items: center; gap: 8px; }
.pd-upi {
  display: inline-block; padding: 2px 8px; border-radius: 3px;
  font-size: 11px; font-weight: 800; background: #3b82f6; color: #fff;
  letter-spacing: 0.5px;
}

/* Cart item cards */
.ci-list { background: #fff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
.ci-card { padding: 20px; border-bottom: 1px solid #f1f5f9; }
.ci-card:last-child { border-bottom: none; }

.ci-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.ci-brand-area { display: flex; gap: 16px; align-items: flex-start; }
.ci-logo {
  width: 80px; height: 60px; border-radius: 8px;
  border: 1px solid #f1f5f9; background: #fff;
  display: flex; align-items: center; justify-content: center;
  padding: 8px; flex-shrink: 0;
}
.ci-logo img { max-width: 60px; max-height: 40px; object-fit: contain; }
.ci-info h3 { font-size: 15px; font-weight: 700; color: #1e293b; margin: 0 0 2px; }
.ci-type { display: block; font-size: 12px; color: #6b7280; margin-bottom: 4px; }
.ci-discount {
  display: inline-block; font-size: 11px; font-weight: 700;
  color: #16a34a; padding: 2px 8px; border-radius: 3px;
  background: #f0fdf4;
}

.ci-summary { text-align: right; }
.ci-summary-row { display: flex; gap: 12px; justify-content: flex-end; align-items: baseline; margin-bottom: 4px; }
.ci-save-label { font-size: 12px; color: #6b7280; }
.ci-save-val { font-size: 14px; font-weight: 700; color: #1e293b; }
.ci-pay-val { font-size: 16px; font-weight: 800; color: #1e293b; }

.ci-bottom { display: flex; align-items: center; justify-content: space-between; }
.ci-detail { display: flex; gap: 32px; }
.ci-d-col { display: flex; flex-direction: column; gap: 2px; }
.ci-d-label { font-size: 11px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: 0.3px; }
.ci-d-value { font-size: 14px; font-weight: 700; color: #374151; }

.ci-qty { display: flex; align-items: center; gap: 0; }
.ci-qty button {
  width: 28px; height: 28px; border: 1px solid #e5e7eb; background: #fff;
  cursor: pointer; font-size: 14px; font-weight: 600; color: #374151;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.ci-qty button:first-child { border-radius: 4px 0 0 4px; }
.ci-qty button:last-child { border-radius: 0 4px 4px 0; }
.ci-qty button:hover:not(:disabled) { background: #f3f4f6; }
.ci-qty button:disabled { opacity: 0.3; cursor: not-allowed; }
.ci-qty span {
  min-width: 32px; height: 28px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 600; color: #1e293b;
}

.ci-remove {
  display: flex; align-items: center; gap: 4px;
  background: none; border: none; cursor: pointer;
  color: #ef4444; font-size: 12px; font-weight: 600;
  font-family: 'Inter', sans-serif; padding: 6px 8px; border-radius: 4px;
  transition: background 0.15s;
}
.ci-remove:hover { background: #fef2f2; }
.ci-remove mat-icon { font-size: 16px; width: 16px; height: 16px; }

/* RIGHT: Payment Summary */
.ps-card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
  overflow: hidden; position: sticky; top: 100px;
}
.ps-header {
  background: #1e293b; color: #fff; padding: 14px 18px;
  font-size: 14px; font-weight: 800; letter-spacing: 0.5px;
}
.ps-voucher-row {
  display: flex; justify-content: space-between; padding: 16px 18px;
  border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #374151;
}
.ps-val { font-weight: 800; color: #1e293b; }

/* Payment table */
.ps-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.ps-table th {
  padding: 10px 14px; text-align: left;
  font-size: 11px; font-weight: 700; color: #9ca3af;
  text-transform: uppercase; letter-spacing: 0.3px;
  border-bottom: 1px solid #f1f5f9; background: #fafafa;
}
.ps-table td {
  padding: 12px 14px; color: #374151; font-weight: 500;
  border-bottom: 1px solid #f1f5f9;
}
.ps-table td mat-icon { font-size: 18px; width: 18px; height: 18px; vertical-align: middle; margin-right: 6px; color: #6b7280; }
.ps-table .surcharge { color: #16a34a; font-weight: 700; }
.ps-table .best { color: #16a34a; font-weight: 800; }
.ps-table tr.highlight { background: #f0fdf4; }
.upi-badge {
  display: inline-block; padding: 1px 5px; border-radius: 3px;
  font-size: 9px; font-weight: 800; background: #3b82f6; color: #fff;
  letter-spacing: 0.5px; vertical-align: middle; margin-right: 6px;
}

.ps-pay-btn {
  display: block; width: calc(100% - 36px); margin: 16px 18px;
  padding: 13px; border: none; border-radius: 6px;
  background: #1e293b; color: #fff; font-size: 14px; font-weight: 800;
  cursor: pointer; transition: background 0.2s; font-family: 'Inter', sans-serif;
  letter-spacing: 0.5px;
}
.ps-pay-btn:hover { background: #334155; }

/* RESPONSIVE */
@media (max-width: 900px) { .cart-grid { grid-template-columns: 1fr; } .ps-card { position: static; } }
@media (max-width: 640px) {
  .cart-container { padding: 0 16px; }
  .ci-top { flex-direction: column; gap: 12px; }
  .ci-summary { text-align: left; }
  .ci-detail { gap: 16px; flex-wrap: wrap; }
  .ci-bottom { flex-direction: column; align-items: flex-start; gap: 12px; }
}
'''

# ===================================================================
# PROFILE PAGE — TS
# ===================================================================
PROFILE_DIR = os.path.join(BASE, "vouchers", "profile")
os.makedirs(PROFILE_DIR, exist_ok=True)

files[os.path.join(PROFILE_DIR, "profile.component.ts")] = r'''import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-public-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class PublicProfileComponent implements OnInit {
  activeTab = 'profile';
  tabs = [
    { id: 'profile', label: 'My Profile' },
    { id: 'transactions', label: 'My Transactions' },
    { id: 'epay', label: 'e-Pay Transactions' },
    { id: 'autopay', label: 'AutoPay' },
    { id: 'helpdesk', label: 'Helpdesk' }
  ];

  profile = {
    name: '---',
    mobile: '---',
    email: '---',
    state: '---',
    city: '---',
    dob: '---',
    password: '********'
  };

  isEditing = false;
  editForm = { ...this.profile };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    try {
      const saved = localStorage.getItem('publicUserProfile');
      if (saved) {
        this.profile = { ...this.profile, ...JSON.parse(saved) };
        this.editForm = { ...this.profile };
      }
    } catch {}
  }

  saveProfile(): void {
    this.profile = { ...this.editForm };
    try {
      localStorage.setItem('publicUserProfile', JSON.stringify(this.profile));
    } catch {}
    this.isEditing = false;
  }

  startEdit(): void {
    this.editForm = { ...this.profile };
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  goBack(): void {
    this.router.navigate(['/store']);
  }
}
'''

# ===================================================================
# PROFILE PAGE — HTML (GyFTR style)
# ===================================================================
files[os.path.join(PROFILE_DIR, "profile.component.html")] = r'''<div class="profile-page">
  <div class="profile-container">

    <!-- Tab nav -->
    <div class="tab-nav">
      <button *ngFor="let tab of tabs"
        class="tab-item" [class.active]="activeTab === tab.id"
        (click)="activeTab = tab.id">
        {{ tab.label }}
      </button>
    </div>

    <!-- Profile Tab -->
    <div class="tab-content" *ngIf="activeTab === 'profile'">
      <div class="profile-grid">

        <!-- Left: Details -->
        <div class="profile-details">
          <h2>Profile Details</h2>

          <!-- View mode -->
          <div class="pd-table" *ngIf="!isEditing">
            <div class="pd-row">
              <span class="pd-label">Name</span>
              <span class="pd-value">{{ profile.name }}</span>
            </div>
            <div class="pd-row">
              <span class="pd-label">Mobile</span>
              <span class="pd-value">{{ profile.mobile }}</span>
            </div>
            <div class="pd-row">
              <span class="pd-label">E-mail</span>
              <span class="pd-value">{{ profile.email }}</span>
            </div>
            <div class="pd-row">
              <span class="pd-label">State</span>
              <span class="pd-value">{{ profile.state }}</span>
            </div>
            <div class="pd-row">
              <span class="pd-label">City</span>
              <span class="pd-value">{{ profile.city }}</span>
            </div>
            <div class="pd-row">
              <span class="pd-label">DOB</span>
              <span class="pd-value">{{ profile.dob }}</span>
            </div>
            <div class="pd-row">
              <span class="pd-label">Password</span>
              <span class="pd-value">{{ profile.password }}</span>
            </div>
          </div>

          <!-- Edit mode -->
          <div class="pd-edit" *ngIf="isEditing">
            <div class="pe-row">
              <label>Name</label>
              <input type="text" [(ngModel)]="editForm.name" />
            </div>
            <div class="pe-row">
              <label>Mobile</label>
              <input type="text" [(ngModel)]="editForm.mobile" />
            </div>
            <div class="pe-row">
              <label>E-mail</label>
              <input type="email" [(ngModel)]="editForm.email" />
            </div>
            <div class="pe-row">
              <label>State</label>
              <input type="text" [(ngModel)]="editForm.state" />
            </div>
            <div class="pe-row">
              <label>City</label>
              <input type="text" [(ngModel)]="editForm.city" />
            </div>
            <div class="pe-row">
              <label>DOB</label>
              <input type="date" [(ngModel)]="editForm.dob" />
            </div>
          </div>

          <!-- Action buttons -->
          <div class="pd-actions">
            <button class="pd-btn primary" *ngIf="!isEditing" (click)="startEdit()">EDIT</button>
            <button class="pd-btn primary" *ngIf="isEditing" (click)="saveProfile()">SAVE</button>
            <button class="pd-btn secondary" *ngIf="isEditing" (click)="cancelEdit()">CANCEL</button>
            <button class="pd-btn outline" *ngIf="!isEditing">CHANGE PASSWORD</button>
            <button class="pd-btn danger" *ngIf="!isEditing">DELETE ACCOUNT</button>
          </div>
        </div>

        <!-- Right: Illustration -->
        <div class="profile-illustration">
          <div class="pi-graphic">
            <mat-icon>account_circle</mat-icon>
            <div class="pi-circle c1"></div>
            <div class="pi-circle c2"></div>
            <div class="pi-decor">
              <mat-icon>credit_card</mat-icon>
              <mat-icon>card_giftcard</mat-icon>
              <mat-icon>shopping_bag</mat-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Other tabs placeholder -->
    <div class="tab-content placeholder-tab" *ngIf="activeTab !== 'profile'">
      <div class="pt-inner">
        <mat-icon>construction</mat-icon>
        <h3>{{ activeTab === 'transactions' ? 'My Transactions' : activeTab === 'epay' ? 'e-Pay Transactions' : activeTab === 'autopay' ? 'AutoPay' : 'Helpdesk' }}</h3>
        <p>This section is coming soon.</p>
      </div>
    </div>
  </div>
</div>
'''

# ===================================================================
# PROFILE PAGE — CSS (GyFTR style)
# ===================================================================
files[os.path.join(PROFILE_DIR, "profile.component.css")] = r''':host { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
.profile-page { background: #fafafa; min-height: 70vh; padding: 28px 0 64px; }
.profile-container { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

/* Tab nav — GyFTR style */
.tab-nav {
  display: flex; gap: 0; border-bottom: 2px solid #e5e7eb;
  margin-bottom: 0; background: #fff;
  border-radius: 8px 8px 0 0; padding: 0 8px;
}
.tab-item {
  padding: 16px 28px; border: none; background: none;
  font-size: 14px; font-weight: 500; color: #6b7280;
  cursor: pointer; border-bottom: 3px solid transparent;
  margin-bottom: -2px; transition: all 0.2s;
  font-family: 'Inter', sans-serif; white-space: nowrap;
}
.tab-item:hover { color: #374151; }
.tab-item.active {
  color: #1e293b; font-weight: 700;
  border-bottom-color: #1e293b;
}

/* Tab content */
.tab-content {
  background: #fff; border: 1px solid #e5e7eb; border-top: none;
  border-radius: 0 0 8px 8px; padding: 32px;
}

/* Profile grid */
.profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; }

/* Details */
.profile-details h2 {
  font-size: 18px; font-weight: 800; color: #1e293b;
  margin: 0 0 24px; letter-spacing: -0.2px;
}

/* Table rows */
.pd-table { margin-bottom: 28px; }
.pd-row {
  display: grid; grid-template-columns: 140px 1fr;
  padding: 10px 0; border-bottom: 1px solid #f8f9fa;
}
.pd-label { font-size: 14px; font-weight: 600; color: #1e293b; }
.pd-value { font-size: 14px; color: #6b7280; }

/* Edit form */
.pd-edit { margin-bottom: 28px; }
.pe-row { margin-bottom: 16px; }
.pe-row label {
  display: block; font-size: 12px; font-weight: 600; color: #374151;
  text-transform: uppercase; letter-spacing: 0.3px; margin-bottom: 6px;
}
.pe-row input {
  width: 100%; padding: 10px 14px; border: 1px solid #d1d5db;
  border-radius: 6px; font-size: 14px; color: #1e293b;
  font-family: 'Inter', sans-serif; transition: border-color 0.2s;
  box-sizing: border-box;
}
.pe-row input:focus { outline: none; border-color: #7c3aed; }

/* Action buttons — GyFTR wide rectangular */
.pd-actions { display: flex; flex-direction: column; gap: 10px; }
.pd-btn {
  width: 100%; padding: 14px; border-radius: 4px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  text-transform: uppercase; letter-spacing: 0.8px;
  font-family: 'Inter', sans-serif; transition: all 0.2s;
  text-align: center;
}
.pd-btn.primary {
  background: #1e293b; color: #fff; border: none;
}
.pd-btn.primary:hover { background: #334155; }
.pd-btn.secondary {
  background: #fff; color: #6b7280; border: 1px solid #d1d5db;
}
.pd-btn.secondary:hover { background: #f9fafb; }
.pd-btn.outline {
  background: #fff; color: #1e293b; border: 1px solid #1e293b;
}
.pd-btn.outline:hover { background: #f8fafc; }
.pd-btn.danger {
  background: #fff; color: #ef4444; border: 1px solid #ef4444;
}
.pd-btn.danger:hover { background: #fef2f2; }

/* Illustration area */
.profile-illustration {
  display: flex; align-items: center; justify-content: center;
  min-height: 300px;
}
.pi-graphic {
  position: relative; width: 240px; height: 240px;
  display: flex; align-items: center; justify-content: center;
}
.pi-graphic > mat-icon {
  font-size: 120px; width: 120px; height: 120px; color: #e2e8f0;
}
.pi-circle {
  position: absolute; border-radius: 50%; border: 2px dashed #e5e7eb;
}
.pi-circle.c1 { width: 200px; height: 200px; top: 20px; left: 20px; }
.pi-circle.c2 { width: 240px; height: 240px; top: 0; left: 0; }
.pi-decor {
  position: absolute; width: 100%; height: 100%;
}
.pi-decor mat-icon {
  position: absolute; font-size: 28px; width: 28px; height: 28px;
  color: #a78bfa; opacity: 0.6;
}
.pi-decor mat-icon:nth-child(1) { top: 0; right: 30px; }
.pi-decor mat-icon:nth-child(2) { bottom: 10px; left: 20px; }
.pi-decor mat-icon:nth-child(3) { top: 50%; right: 0; }

/* Placeholder tab */
.placeholder-tab { text-align: center; padding: 80px 24px; }
.pt-inner mat-icon { font-size: 64px; width: 64px; height: 64px; color: #d1d5db; margin-bottom: 16px; }
.pt-inner h3 { font-size: 20px; font-weight: 700; color: #374151; margin: 0 0 8px; }
.pt-inner p { font-size: 14px; color: #9ca3af; margin: 0; }

/* RESPONSIVE */
@media (max-width: 900px) { .profile-grid { grid-template-columns: 1fr; } .profile-illustration { display: none; } }
@media (max-width: 640px) {
  .profile-container { padding: 0 16px; }
  .tab-nav { overflow-x: auto; }
  .tab-item { padding: 12px 18px; font-size: 13px; }
  .tab-content { padding: 20px 16px; }
  .pd-row { grid-template-columns: 100px 1fr; }
}
'''

# Write all files
for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written: {os.path.relpath(path, BASE)}")

print("\nAll page files written!")
