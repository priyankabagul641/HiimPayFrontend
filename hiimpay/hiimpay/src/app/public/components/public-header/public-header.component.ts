import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { PublicCartService } from '../../services/public-cart.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.css']
})
export class PublicHeaderComponent implements OnInit, OnDestroy {
  cartCount = 0;
  scrolled = false;
  mobileMenuOpen = false;
  activeCategory = 'All';
  private sub!: Subscription;
  private routeSub!: Subscription;

  constructor(private cartService: PublicCartService, private router: Router, private route: ActivatedRoute) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 10;
  }

  ngOnInit(): void {
    this.sub = this.cartService.cartItemCount$.subscribe(count => {
      this.cartCount = count;
    });
    this.routeSub = this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      if (url.includes('/vouchers')) {
        const cat = this.route.firstChild?.firstChild?.snapshot?.queryParams?.['category'];
        this.activeCategory = cat || 'All';
      } else {
        this.activeCategory = '';
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
