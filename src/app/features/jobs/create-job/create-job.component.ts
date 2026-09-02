import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobType } from '../../../core/models/job.model';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.css']
})
export class CreateJobComponent implements OnInit {
  jobForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  userCredits: number = 0;
  isSubscribed: boolean = false;
  subscriptionPlan: string = 'none';
  subscriptionExpiresAt: Date | string | null = null;
  isAdmin: boolean = false;
  isCheckingEligibility: boolean = true;

  skillsList: string[] = [];
  currentSkillInput = '';

  jobTypes: JobType[] = ['Full-time', 'Part-time', 'Remote', 'Freelance'];

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.hasRole('admin');

    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      location: ['', [Validators.required]],
      salary: [null, [Validators.min(0)]],
      type: ['Full-time' as JobType, [Validators.required]]
    });

    if (this.isAdmin) {
      this.isCheckingEligibility = false;
    } else {
      this.fetchEligibility();
    }
  }

  fetchEligibility(): void {
    this.isCheckingEligibility = true;
    this.jobService.checkJobPostingEligibility().subscribe({
      next: (res) => {
        this.isCheckingEligibility = false;
        this.userCredits = res.jobCredits || 0;
        this.isSubscribed = Boolean(res.isSubscribed);
        this.subscriptionPlan = res.subscription?.plan || 'none';
        this.subscriptionExpiresAt = res.subscription?.expiresAt || null;

        if (!res.canPost && !this.isAdmin) {
          this.toast.warning('Job Credits Required', 'You must purchase a job posting package to continue.');
          this.router.navigate(['/pricing'], { queryParams: { reason: 'credits_required' } });
        }
      },
      error: () => {
        this.isCheckingEligibility = false;
        // Check local state fallback
        const user = this.authService.currentUserValue;
        this.userCredits = user?.jobCredits || 0;
        this.isSubscribed = Boolean(
          user?.subscription?.isActive &&
          user?.subscription?.expiresAt &&
          new Date(user.subscription.expiresAt).getTime() > Date.now()
        );
      }
    });
  }

  get f() {
    return this.jobForm.controls;
  }

  addSkill(): void {
    const trimmed = this.currentSkillInput.trim();
    if (trimmed && !this.skillsList.includes(trimmed)) {
      this.skillsList.push(trimmed);
      this.currentSkillInput = '';
    }
  }

  removeSkill(index: number): void {
    this.skillsList.splice(index, 1);
  }

  onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkill();
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const payload = {
      ...this.jobForm.value,
      salary: this.jobForm.value.salary ? Number(this.jobForm.value.salary) : undefined,
      skills: this.skillsList
    };

    this.jobService.createJob(payload).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Deduct 1 credit locally if not admin and relying on single-job credits
        if (!this.isAdmin && !this.isSubscribed) {
          this.userCredits = Math.max(0, this.userCredits - 1);
          this.authService.updateUserCredits(this.userCredits);
        }

        this.toast.success('Job Published!', 'Your job posting is now live.');
        const newId = res.data?._id || res.data?.id;
        if (newId) {
          this.router.navigate(['/jobs', newId]);
        } else {
          this.router.navigate(['/jobs/manage']);
        }
      },
      error: (err) => {
        this.isLoading = false;

        // Check if backend rejected due to lack of credits / subscription
        if (err.status === 402 || err.error?.paymentRequired) {
          this.toast.error('Payment Required', 'Insufficient job credits to post a job. Please purchase a package.');
          this.router.navigate(['/pricing'], { queryParams: { reason: 'credits_required' } });
          return;
        }

        this.errorMessage = err.error?.message || 'Failed to create job posting. Please try again.';
      }
    });
  }
}
