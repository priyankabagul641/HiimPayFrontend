import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { PublicVoucherService } from '../../services/public-voucher.service';
import { PublicCartService } from '../../services/public-cart.service';
import { Voucher, VoucherCategory } from '../../models/voucher.model';

@Component({
  selector: 'app-voucher-list',
  templateUrl: './voucher-list.component.html',
  styleUrls: ['./voucher-list.component.css']
})
export class VoucherListComponent implements OnInit, OnDestroy {
  vouchers: Voucher[] = [];
  filteredVouchers: Voucher[] = [];
  loading = true;
  searchText = '';
  selectedCategory: VoucherCategory = 'All';
  selectedPriceRange = 'all';
  cartCount = 0;

  categories: VoucherCategory[] = [
    'All',
    'Food & Dining',
    'Shopping',
    'Travel',
    'Electronics',
    'Entertainment',
    'Health & Wellness'
  ];

  // Gyftr-style filter categories (displayed as text links)
  filterCategories: string[] = [
    'All', 'Dining', 'E-Commerce', 'Electronics', 'Entertainment',
    'Fashion', 'Gaming', 'Gifting', 'Home Needs', 'Travel', 'Wellness'
  ];

  priceRanges = [
    { label: 'All Prices', value: 'all' },
    { label: 'Under ₹500', value: '0-500' },
    { label: '₹500 - ₹1000', value: '500-1000' },
    { label: '₹1000 - ₹2500', value: '1000-2500' },
    { label: '₹2500 - ₹5000', value: '2500-5000' },
    { label: 'Above ₹5000', value: '5000-99999' }
  ];

  // Gyftr-style discount filter
  discountRanges = [
    { label: '1% - 5%', value: '1-5' },
    { label: '6% - 10%', value: '6-10' },
    { label: '11% - 25%', value: '11-25' },
    { label: '26% - Above', value: '26-100' }
  ];
  selectedDiscount = 'all';
  selectedBogo = 'all';
  selectedBrandType = 'all';

  skeletonItems = Array(10).fill(0);
  showFilterPanel = false;

  // Featured brands carousel
  featuredPage = 0;
  featuredPages: Voucher[][][] = [];

  // Flat discount section
  flatDiscountFilter = 'all';

  // Banner carousel
  currentSlide = 0;
  bannerSlides = [
    {
      title: 'Grocery Shopping, Made Easy',
      subtitle: 'Explore vouchers for daily essentials.',
      gradient: 'linear-gradient(135deg, #2b2e83 0%, #7b3fe4 60%, #a855f7 100%)',
      searchTerm: 'Food',
      brandCards: [
        { name: 'Swiggy', logo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg', rotate: '-4deg' },
        { name: 'Zomato', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png', rotate: '3deg' },
        { name: 'BigBasket', logo: 'https://upload.wikimedia.org/wikipedia/en/1/13/BigBasket_logo.svg', rotate: '-2deg' },
        { name: 'Zepto', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png', rotate: '5deg' },
      ]
    },
    {
      title: 'Shop Top Brands, Save More',
      subtitle: 'Gift cards from India\'s most loved shopping brands.',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #6366f1 100%)',
      searchTerm: 'Shopping',
      brandCards: [
        { name: 'Amazon', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', rotate: '3deg' },
        { name: 'Flipkart', logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg', rotate: '-3deg' },
        { name: 'Myntra', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Myntra_logo.svg', rotate: '4deg' },
        { name: 'Ajio', logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg', rotate: '-5deg' },
      ]
    }
  ];
  private slideInterval: any;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private voucherService: PublicVoucherService,
    private cartService: PublicCartService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'] as VoucherCategory;
      }
      if (params['search']) {
        this.searchText = params['search'];
      }
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });

    this.cartService.cartItemCount$.pipe(takeUntil(this.destroy$)).subscribe(count => {
      this.cartCount = count;
    });

    this.loadVouchers();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVouchers(): void {
    this.loading = true;
    this.voucherService.getVouchers({ size: 100 }).subscribe({
      next: (res: any) => {
        this.vouchers = res?.content || res || [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.vouchers = this.getMockVouchers();
        this.applyFilters();
        this.loading = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchText = value;
    this.searchSubject.next(value);
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category as VoucherCategory;
    this.applyFilters();
  }

  onPriceRangeChange(range: string): void {
    this.selectedPriceRange = range;
    this.applyFilters();
  }

  onDiscountChange(value: string): void {
    this.selectedDiscount = this.selectedDiscount === value ? 'all' : value;
    this.applyFilters();
  }

  onBogoChange(value: string): void {
    this.selectedBogo = this.selectedBogo === value ? 'all' : value;
    this.applyFilters();
  }

  onBrandTypeChange(value: string): void {
    this.selectedBrandType = this.selectedBrandType === value ? 'all' : value;
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.vouchers];

    if (this.selectedCategory !== 'All') {
      result = result.filter(v => v.category === this.selectedCategory);
    }

    if (this.searchText.trim()) {
      const term = this.searchText.toLowerCase().trim();
      result = result.filter(v =>
        v.name.toLowerCase().includes(term) ||
        v.brand.toLowerCase().includes(term) ||
        v.category.toLowerCase().includes(term)
      );
    }

    if (this.selectedPriceRange !== 'all') {
      const [min, max] = this.selectedPriceRange.split('-').map(Number);
      result = result.filter(v => v.price >= min && v.price <= max);
    }

    if (this.selectedDiscount !== 'all') {
      const [min, max] = this.selectedDiscount.split('-').map(Number);
      result = result.filter(v => v.discountPercent >= min && v.discountPercent <= max);
    }

    if (this.selectedBrandType !== 'all') {
      if (this.selectedBrandType !== 'both') {
        result = result.filter(v =>
          v.redemptionType?.toLowerCase() === this.selectedBrandType ||
          v.redemptionType?.toLowerCase() === 'both'
        );
      }
    }

    this.filteredVouchers = result;
    this.buildFeaturedPages();
  }

  get flatDiscountVouchers(): Voucher[] {
    if (this.flatDiscountFilter === 'all') return this.vouchers.slice(0, 4);
    const [min, max] = this.flatDiscountFilter.split('-').map(Number);
    return this.vouchers.filter(v => v.discountPercent >= min && v.discountPercent <= max).slice(0, 4);
  }

  private buildFeaturedPages(): void {
    const items = this.vouchers.slice(0, 20);
    const perPage = 10; // 2 rows x 5
    const pages: Voucher[][][] = [];
    for (let p = 0; p < items.length; p += perPage) {
      const pageItems = items.slice(p, p + perPage);
      const row1 = pageItems.slice(0, 5);
      const row2 = pageItems.slice(5, 10);
      const rows: Voucher[][] = [row1];
      if (row2.length) rows.push(row2);
      pages.push(rows);
    }
    this.featuredPages = pages.length ? pages : [[[]]];
  }

  nextFeatured(): void {
    if (this.featuredPage < this.featuredPages.length - 1) this.featuredPage++;
  }

  prevFeatured(): void {
    if (this.featuredPage > 0) this.featuredPage--;
  }

  viewDetails(voucher: Voucher): void {
    this.router.navigate(['/store/vouchers', voucher.id]);
  }

  quickAddToCart(voucher: Voucher, event: Event): void {
    event.stopPropagation();
    this.cartService.addItem({
      voucherId: voucher.id,
      name: voucher.name,
      brand: voucher.brand,
      brandLogo: voucher.brandLogo,
      image: voucher.image,
      price: voucher.price,
      discountPercent: voucher.discountPercent,
      discountedPrice: voucher.discountedPrice,
      quantity: 1,
      denomination: voucher.denomination?.[0] || voucher.price
    });
    this.toastr.success(`${voucher.name} added to cart`, 'Added!');
  }

  clearFilters(): void {
    this.searchText = '';
    this.selectedCategory = 'All';
    this.selectedPriceRange = 'all';
    this.selectedDiscount = 'all';
    this.selectedBogo = 'all';
    this.selectedBrandType = 'all';
    this.applyFilters();
  }

  // Banner carousel
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.bannerSlides.length;
  }
  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.bannerSlides.length) % this.bannerSlides.length;
  }
  goToSlide(index: number): void {
    this.currentSlide = index;
  }
  private startAutoSlide(): void {
    this.slideInterval = setInterval(() => this.nextSlide(), 5000);
  }
  private stopAutoSlide(): void {
    if (this.slideInterval) { clearInterval(this.slideInterval); }
  }

  trackByVoucherId(index: number, voucher: Voucher): number {
    return voucher.id;
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      'All': 'apps',
      'Food & Dining': 'restaurant',
      'Shopping': 'shopping_bag',
      'Travel': 'flight',
      'Electronics': 'devices',
      'Entertainment': 'movie',
      'Health & Wellness': 'favorite'
    };
    return icons[category] || 'label';
  }

  getCategoryBanner(category: string): string {
    const banners: Record<string, string> = {
      'Food & Dining': 'https://images.unsplash.com/photo-1622115837997-90c89ae689f9?w=1600&h=400&fit=crop',
      'Shopping': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=400&fit=crop',
      'Travel': 'https://images.unsplash.com/photo-1707343848552-893e05dba6ac?w=1600&h=400&fit=crop',
      'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=400&fit=crop',
      'Entertainment': 'https://images.unsplash.com/photo-1514533212735-5df27d970db0?w=1600&h=400&fit=crop',
      'Health & Wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&h=400&fit=crop',
      'Dining': 'https://images.unsplash.com/photo-1622115837997-90c89ae689f9?w=1600&h=400&fit=crop',
      'E-Commerce': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&h=400&fit=crop',
      'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&h=400&fit=crop',
      'Gaming': 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&h=400&fit=crop',
      'Gifting': 'https://images.unsplash.com/photo-1545785028-23ee5937cf69?w=1600&h=400&fit=crop',
      'Home Needs': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&h=400&fit=crop',
      'Wellness': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&h=400&fit=crop'
    };
    return banners[category] || 'https://images.unsplash.com/photo-1545785028-23ee5937cf69?w=1600&h=400&fit=crop';
  }

  private getMockVouchers(): Voucher[] {
    const brands = [
      { name: 'Amazon', category: 'Shopping', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
      { name: 'Swiggy', category: 'Food & Dining', logo: 'https://upload.wikimedia.org/wikipedia/en/1/12/Swiggy_logo.svg' },
      { name: 'Flipkart', category: 'Shopping', logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg' },
      { name: 'MakeMyTrip', category: 'Travel', logo: 'https://imgak.mmtcdn.com/pwa_v3/pwa_hotel_assets/header/mmtLogoWhite.png' },
      { name: 'Myntra', category: 'Shopping', logo: 'https://upload.wikimedia.org/wikipedia/en/a/a2/Myntra_logo.svg' },
      { name: 'Zomato', category: 'Food & Dining', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Zomato_logo.png' },
      { name: 'BookMyShow', category: 'Entertainment', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/82/BookMyShow_logo.png' },
      { name: 'Croma', category: 'Electronics', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Croma_logo.svg' },
      { name: 'Cleartrip', category: 'Travel', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Cleartrip_logo.svg' },
      { name: 'Nykaa', category: 'Health & Wellness', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Nykaa_logo.svg' },
      { name: 'Uber', category: 'Travel', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/58/Uber_logo_2018.svg' },
      { name: 'BigBasket', category: 'Food & Dining', logo: 'https://upload.wikimedia.org/wikipedia/en/1/13/BigBasket_logo.svg' }
    ];

    return brands.map((b, i) => ({
      id: i + 1,
      name: `${b.name} Gift Voucher`,
      brand: b.name,
      brandLogo: b.logo,
      image: b.logo,
      description: `Enjoy shopping with ${b.name} gift voucher. Redeemable across all ${b.name} platforms.`,
      shortDescription: `${b.name} digital gift voucher`,
      category: b.category,
      price: [500, 1000, 1500, 2000, 2500, 3000][i % 6],
      discountPercent: [5, 8, 10, 12, 7, 15][i % 6],
      discountedPrice: Math.round([500, 1000, 1500, 2000, 2500, 3000][i % 6] * (1 - [5, 8, 10, 12, 7, 15][i % 6] / 100)),
      denomination: [500, 1000, 2000, 5000],
      termsAndConditions: 'Valid for 12 months from date of purchase. Cannot be exchanged for cash.',
      howToRedeem: `Visit ${b.name} website or app. Apply voucher code at checkout.`,
      validity: '12 months',
      type: 'E-VOUCHER',
      redemptionType: 'ONLINE',
      status: 'ACTIVE'
    }));
  }
}
