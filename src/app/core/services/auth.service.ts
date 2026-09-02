import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, catchError, of, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, RegisterRequest, LoginRequest, UpdateProfileRequest, UserRole, Subscription, JobPostingEligibility } from '../models/user.model';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'job_board_jwt_token';
  private readonly USER_KEY = 'job_board_current_user';
  private apiUrl = `${environment.apiUrl}/users`;

  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(!!this.getToken());
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private toast: ToastService
  ) {
    if (this.getToken()) {
      setTimeout(() => {
        if (this.getToken()) {
          this.loadUserProfile();
        }
      }, 0);
    }
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // ✅ فك تشفير آمن لـ JWT يدعم Base64Url ولا يمسح التوكن بالخطأ عند الـ Reload
  public getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return null;
    }
    return token;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      // تحويل Base64Url إلى Base64 قياسي لتفادي أخطاء atob()
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.exp ? (payload.exp * 1000 < Date.now()) : false;
    } catch {
      // في حال حدوث أي خطأ في الفك، لا نحذف التوكن ونعتبره سارياً لكي يمر الطلب للباك إند
      return false;
    }
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public getUserRole(): UserRole | null {
    const user = this.currentUserValue;
    return user ? user.role : null;
  }

  public hasRole(...roles: UserRole[]): boolean {
    const currentRole = this.getUserRole();
    if (!currentRole) return false;
    return roles.includes(currentRole);
  }

  public getUserId(): string | null {
    const user = this.currentUserValue;
    if (!user) return null;
    return user._id || user.id || null;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => {
        if (res && res.token) {
          this.setSession(res.token, res.user);
        }
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data).pipe(
      tap(res => {
        if (res && res.token) {
          this.setSession(res.token, res.user);
          // fetch full profile details to ensure fresh data
          this.getProfile().subscribe({
            next: (profileRes) => {
              if (profileRes && profileRes.user) {
                this.setUser(profileRes.user);
              }
            }
          });
        }
      })
    );
  }

  logout(): void {
    if (this.getToken()) {
      this.http.post(`${this.apiUrl}/logout`, {}).pipe(
        catchError(() => of(null))
      ).subscribe();
    }
    this.clearSession();
    this.toast.info('Logged Out', 'You have been successfully logged out.');
    this.router.navigate(['/auth/login']);
  }

  getProfile(): Observable<{ status: string; user: User }> {
    return this.http.get<{ status: string; user: User }>(`${this.apiUrl}/profile`).pipe(
      tap(res => {
        if (res && res.user) {
          this.setUser(res.user);
        }
      })
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<{ status: string; user: User; token?: string }> {
    return this.http.patch<{ status: string; user: User; token?: string }>(`${this.apiUrl}/profile`, data).pipe(
      tap(res => {
        if (res && res.user) {
          this.setUser(res.user);
        }
        if (res && res.token) {
          localStorage.setItem(this.TOKEN_KEY, res.token);
        }
      })
    );
  }

  getUserById(id: string): Observable<{ status: string; user: User }> {
    return this.http.get<{ status: string; user: User }>(`${this.apiUrl}/${id}`);
  }

  checkJobPostingEligibility(): Observable<JobPostingEligibility> {
    return this.http.get<JobPostingEligibility>(`${this.apiUrl}/job-posting-eligibility`).pipe(
      tap(res => {
        if (res && this.currentUserValue) {
          const updatedUser: User = {
            ...this.currentUserValue,
            jobCredits: res.jobCredits,
            subscription: res.subscription
          };
          this.setUser(updatedUser);
        }
      })
    );
  }

  updateUserCredits(credits: number, subscription?: Subscription): void {
    if (this.currentUserValue) {
      const updatedUser: User = {
        ...this.currentUserValue,
        jobCredits: credits,
        ...(subscription ? { subscription } : {})
      };
      this.setUser(updatedUser);
    }
  }

  public loadUserProfile(): void {
    this.getProfile().subscribe({
      error: (err: HttpErrorResponse) => {
        // Only clear the session when the server explicitly rejects the
        // token (401 = invalid/expired). Network errors, timeouts, or
        // 5xx server issues should NOT log the user out.
        if (err.status === 401) {
          this.clearSession();
        }
      }
    });
  }

  private setSession(token: string, user?: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    if (user) {
      this.setUser(user);
    }
    this.isAuthenticatedSubject.next(true);
  }

  public setUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
}