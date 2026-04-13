import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { PublicCartService } from '../../services/public-cart.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-header',
  templateUrl: './public-header.component.html',
  styleUrls: ['./public-header.component.css']
})
export class PublicHeaderComponent implements OnInit, OnDestroy {
  cartCount = 0;
  scrolled = false;
  mobileMenuOpen = false;
  showLoginModal = false;
  private sub!: Subscription;

  constructor(private cartService: PublicCartService, private router: Router) {}

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled = window.scrollY > 10;
  }

  ngOnInit(): void {
    this.sub = this.cartService.cartItemCount$.subscribe(count => {
      this.cartCount = count;
    });
    // header only handles navigation; active state is managed by routerLinkActive in template
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  // header only navigates; mobile menu helper

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  openLoginModal(): void {
    this.showLoginModal = true;
  }
}
