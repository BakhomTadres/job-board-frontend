import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { User, UserRole } from '../../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  isAuthenticated = false;
  isMobileMenuOpen = false;
  isUserDropdownOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.authService.isAuthenticated$.subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.isUserDropdownOpen = false;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  logout(): void {
    this.closeMobileMenu();
    this.authService.logout();
  }

  get isEmployer(): boolean {
    return this.authService.hasRole('employer', 'admin');
  }

  // زي isEmployer بس بيستثني الـ admin - يستخدم في الأماكن اللي admin مش المفروض يشوفها زي Pricing
  get isEmployerOnly(): boolean {
    return this.authService.hasRole('employer');
  }

  get isAdmin(): boolean {
    return this.authService.hasRole('admin');
  }

  get isJobSeeker(): boolean {
    return this.authService.hasRole('job seeker');
  }
}