import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const expectedRoles = route.data['roles'] as UserRole[];
    const userRole = this.authService.getUserRole();

    if (expectedRoles && expectedRoles.length > 0) {
      if (userRole && expectedRoles.includes(userRole)) {
        return true;
      }

      this.toast.error('Access Denied', 'You do not have permission to access this page.');
      return this.router.createUrlTree(['/']);
    }

    return true;
  }
}
