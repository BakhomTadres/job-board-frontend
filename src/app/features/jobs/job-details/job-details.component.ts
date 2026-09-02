import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job } from '../../../core/models/job.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  job: Job | null = null;
  currentUser: User | null = null;
  isLoading = true;
  hasError = false;
  jobId = '';

  // Apply Modal
  isApplyModalOpen = false;
  applyForm!: FormGroup;
  isSubmitting = false;
  hasApplied = false;

  // Match score calculation
  matchScore: number | null = null;

  // Similar Jobs
  similarJobs: Job[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private jobService: JobService,
    private applicationService: ApplicationService,
    public authService: AuthService,
    private toast: ToastService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];
    this.currentUser = this.authService.currentUserValue;

    this.initApplyForm();
    this.fetchJobDetails();
  }

  initApplyForm(): void {
    this.applyForm = this.fb.group({
      applicantName: [this.currentUser?.name || '', [Validators.required, Validators.minLength(3)]],
      cv: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  fetchJobDetails(): void {
    this.isLoading = true;
    this.hasError = false;

    this.jobService.getJobById(this.jobId).subscribe({
      next: (job) => {
        this.job = job;
        this.isLoading = false;
        this.calculateLocalMatchScore();
        // Fetch similar jobs for logged-in job seekers
        if (this.authService.isLoggedIn() && this.authService.hasRole('job seeker')) {
          this.fetchSimilarJobs();
        }
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  fetchSimilarJobs(): void {
    this.jobService.getRecommendedJobs().subscribe({
      next: (res) => {
        if (res && res.data && res.data.jobs) {
          // Exclude the current job from the list and limit to 3
          const currentId = this.job?._id || this.job?.id;
          this.similarJobs = res.data.jobs
            .filter(j => (j._id || j.id) !== currentId)
            .slice(0, 3);
        }
      },
      error: () => {
        // Silent fallback — section simply won't appear
      }
    });
  }

  get isJobSeeker(): boolean {
    return this.authService.isLoggedIn() && this.authService.hasRole('job seeker');
  }

  calculateLocalMatchScore(): void {
    // Match score is only applicable for Job Seekers
    if (!this.isJobSeeker) {
      this.matchScore = null;
      return;
    }

    if (!this.job || !this.currentUser || !this.job.skills || this.job.skills.length === 0) {
      this.matchScore = null;
      return;
    }

    const userSkills = (this.currentUser.skills || []).map(s => s.toLowerCase().trim());
    const jobSkills = this.job.skills.map(s => s.toLowerCase().trim());

    if (jobSkills.length === 0) {
      this.matchScore = null;
      return;
    }

    const matched = jobSkills.filter(js => userSkills.includes(js)).length;
    this.matchScore = Math.round((matched / jobSkills.length) * 100);
  }

  openApplyModal(): void {
    if (this.isEmployerOrAdmin) {
      this.toast.warning('Not Allowed', 'Employers and administrators cannot apply to jobs.');
      return;
    }

    if (!this.authService.isLoggedIn()) {
      this.toast.info('Sign In Required', 'Please log in to apply for this job.');
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (!this.authService.hasRole('job seeker')) {
      this.toast.warning('Job Seekers Only', 'Only job seeker accounts can submit applications.');
      return;
    }

    this.applyForm.patchValue({
      applicantName: this.currentUser?.name || ''
    });
    this.isApplyModalOpen = true;
    this.renderer.setStyle(document.body, 'overflow', 'hidden');
  }

  closeApplyModal(): void {
    this.isApplyModalOpen = false;
    this.renderer.removeStyle(document.body, 'overflow');
  }

  submitApplication(): void {
    if (this.applyForm.invalid || !this.job) {
      this.applyForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const payload = {
      jobTitle: this.job.title,
      applicantName: this.applyForm.value.applicantName.trim(),
      cv: this.applyForm.value.cv.trim()
    };

    this.applicationService.applyForJob(this.jobId, payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isApplyModalOpen = false;
        this.renderer.removeStyle(document.body, 'overflow');
        this.hasApplied = true;
        this.toast.success(
          'Application Submitted!',
          `Successfully applied to ${this.job?.title}. Match score: ${res.data?.matchScore ?? this.matchScore ?? 0}%`
        );
      },
      error: (err) => {
        this.isSubmitting = false;
        this.isApplyModalOpen = false;
        this.renderer.removeStyle(document.body, 'overflow');
        const rawMsg = err.error?.message || '';

        // Detect duplicate application (MongoDB E11000 duplicate key)
        if (rawMsg.includes('E11000') || rawMsg.includes('duplicate key')) {
          this.hasApplied = true;
          this.toast.warning('Already Applied', 'You have already submitted an application for this job.');
        } else {
          const msg = rawMsg || 'Failed to submit application. Please try again.';
          this.toast.error('Application Error', msg);
        }
      }
    });
  }

  get isOwner(): boolean {
    if (!this.job || !this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    const employerId = typeof this.job.employer === 'object' ? this.job.employer?._id : this.job.employer;
    return employerId === (this.currentUser._id || this.currentUser.id);
  }

  get isEmployerOrAdmin(): boolean {
    const role = this.currentUser?.role;
    return role === 'employer' || role === 'admin';
  }

  get canApply(): boolean {
    if (this.isEmployerOrAdmin) return false;
    if (this.isOwner) return false;
    if (this.hasApplied) return false;
    return true;
  }

  getSalaryFormatted(salary?: number): string {
    if (!salary) return 'Competitive / Negotiable';
    return `$${salary.toLocaleString()}/year`;
  }
}
