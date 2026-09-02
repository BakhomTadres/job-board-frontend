import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Injectable({
  providedIn: 'root'
})
export class HasJobCreditGuard implements CanActivate {
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

    const role = this.authService.getUserRole();

    // Admins are exempt from payment restrictions
    if (role === 'admin') {
      return true;
    }

    if (role !== 'employer') {
      this.toast.error('Access Denied', 'Only employers and admins can post job openings.');
      return this.router.createUrlTree(['/']);
    }

    // Verify current eligibility with the backend API
    return this.authService.checkJobPostingEligibility().pipe(
      map((res) => {
        if (res && res.canPost) {
          return true;
        }

        this.toast.warning(
          'Job Credits Required',
          'You must purchase a job posting package to continue.'
        );
        return this.router.createUrlTree(['/pricing'], {
          queryParams: { reason: 'credits_required' }
        });
      }),
      catchError(() => {
        // Fallback: check locally stored user state if network error occurs
        const user = this.authService.currentUserValue;
        const isSubscribed = Boolean(
          user?.subscription?.isActive &&
          user?.subscription?.expiresAt &&
          new Date(user.subscription.expiresAt).getTime() > Date.now()
        );
        const hasCredits = typeof user?.jobCredits === 'number' && user.jobCredits > 0;

        if (isSubscribed || hasCredits) {
          return of(true);
        }

        this.toast.warning(
          'Job Credits Required',
          'You must purchase a job posting package to continue.'
        );
        return of(this.router.createUrlTree(['/pricing'], {
          queryParams: { reason: 'credits_required' }
        }));
      })
    );
  }
}
