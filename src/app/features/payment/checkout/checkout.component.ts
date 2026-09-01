import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { PaymentService } from '../../../core/services/payment.service';
import { User } from '../../../core/models/user.model';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  plans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Single Job Post',
      price: 49,
      currency: 'EGP',
      period: 'per post',
      description: 'Perfect for small teams and startups hiring for a single open role.',
      features: [
        '30-Day Job Listing Visibility',
        'Automated Skill Match Scoring',
        'Direct Candidate Applications',
        'Standard Email Support'
      ]
    },
    {
      id: 'featured',
      name: 'Featured Employer',
      price: 129,
      currency: 'EGP',
      period: 'per post',
      popular: true,
      description: 'Maximize candidate reach with top-of-list highlighting and badge.',
      features: [
        'Highlighted on Homepage & Top of Search',
        '60-Day Job Listing Duration',
        'Priority Skill Match Scoring',
        'Dedicated Candidate Management Portal',
        'Priority 24/7 Support'
      ]
    },
    {
      id: 'unlimited',
      name: 'Unlimited Team Pro',
      price: 349,
      currency: 'EGP',
      period: 'per month',
      description: 'Ideal for scaling engineering departments and recruitment agencies.',
      features: [
        'Unlimited Active Job Posts',
        'Company Branding Page & Logo',
        'AI Match Score Filtering & Export',
        'Instant Candidate Resume Downloads',
        'Dedicated Account Manager'
      ]
    }
  ];

  selectedPlan: PricingPlan = this.plans[1]; // default to featured
  billingForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    const names = (this.currentUser?.name || '').split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    this.billingForm = this.fb.group({
      firstName: [firstName, [Validators.required]],
      lastName: [lastName, [Validators.required]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      phoneNumber: ['+201000000000', [Validators.required]],
      street: ['Main Street', [Validators.required]],
      building: ['12', [Validators.required]],
      city: ['Cairo', [Validators.required]],
      country: ['EGY', [Validators.required]]
    });

    const planParam = this.route.snapshot.queryParams['plan'];
    if (planParam) {
      const match = this.plans.find(p => p.id === planParam);
      if (match) this.selectedPlan = match;
    }
  }

  selectPlan(plan: PricingPlan): void {
    this.selectedPlan = plan;
  }

  onProceedToPay(): void {
    if (!this.authService.isLoggedIn()) {
      this.toast.info('Sign In Required', 'Please log in to purchase job credits.');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (this.billingForm.invalid) {
      this.billingForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const redirectionUrl = `${window.location.origin}/payment/success`;

    const payload = {
      amount: this.selectedPlan.price,
      currency: this.selectedPlan.currency,
      billingData: this.billingForm.value,
      items: [
        {
          name: this.selectedPlan.name,
          amount_cents: this.selectedPlan.price * 100,
          description: this.selectedPlan.description,
          quantity: 1
        }
      ],
      redirectionUrl: redirectionUrl
    };

    this.paymentService.createCheckout(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        const checkoutUrl = res.data?.checkoutUrl;
        if (checkoutUrl) {
          this.toast.info('Redirecting to Paymob', 'Opening secure payment gateway...');
          window.location.href = checkoutUrl;
        } else {
          // If no external URL, go to local success
          this.router.navigate(['/payment/success'], {
            queryParams: { paymentId: res.data?.paymentId, reference: res.data?.specialReference }
          });
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to initialize Paymob payment gateway. Please try again.';
      }
    });
  }
}
