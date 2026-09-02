import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { PaymentRecord } from '../../../core/models/payment.model';
import { User, Subscription } from '../../../core/models/user.model';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.css']
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string | null = null;
  reference: string | null = null;
  paymentDetails: PaymentRecord | null = null;
  currentUser: User | null = null;
  userCredits: number | null = null;
  isSubscribed: boolean = false;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.paymentId = params['paymentId'] || null;
      this.reference = params['reference'] || params['merchant_order_id'] || params['special_reference'] || null;
      const transactionId = params['id'] || params['transaction_id'] || null;
      const orderId = params['order'] || params['order_id'] || null;
      const isSuccess = params['success'] !== 'false';

      this.isLoading = true;

      // Automatically confirm the session with the backend so credits/subscription are applied immediately!
      this.paymentService.confirmPaymentSession({
        paymentId: this.paymentId || undefined,
        reference: this.reference || undefined,
        transactionId: transactionId || undefined,
        orderId: orderId || undefined,
        success: isSuccess
      }).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.paymentDetails = res.data;
          if (res.user) {
            this.userCredits = res.user.jobCredits ?? 0;
            this.isSubscribed = Boolean(res.user.subscription?.isActive);
            this.authService.updateUserCredits(this.userCredits, res.user.subscription);
          }
          this.refreshUserProfile();
        },
        error: () => {
          this.isLoading = false;
          const lookupId = this.paymentId || this.reference || transactionId;
          if (lookupId) {
            this.fetchPaymentRecord(lookupId);
          } else {
            this.refreshUserProfile();
          }
        }
      });
    });
  }

  refreshUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (res) => {
        if (res && res.user) {
          this.currentUser = res.user;
          this.userCredits = typeof res.user.jobCredits === 'number' ? res.user.jobCredits : 0;
          this.isSubscribed = Boolean(
            res.user.subscription?.isActive &&
            res.user.subscription?.expiresAt &&
            new Date(res.user.subscription.expiresAt).getTime() > Date.now()
          );
        }
      }
    });
  }

  fetchPaymentRecord(id: string): void {
    this.isLoading = true;
    this.paymentService.getPaymentById(id).subscribe({
      next: (res) => {
        this.paymentDetails = res.data;
        this.isLoading = false;
        // Re-refresh profile once payment record confirms success
        this.refreshUserProfile();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
