import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job } from '../../../core/models/job.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  jobs: Job[] = [];
  currentUser: User | null = null;
  isLoading = true;
  hasError = false;

  totalJobsCount = 0;
  totalApplicationsEstimate = 0;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;

    this.jobService.getAllJobs({ limit: 50 }).subscribe({
      next: (res) => {
        this.jobs = res.data || [];
        this.totalJobsCount = res.results || this.jobs.length;
        this.totalApplicationsEstimate = this.jobs.length * 3 + 12;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  deleteJob(id?: string): void {
    if (!id) return;
    if (confirm('Are you sure you want to delete this job as an administrator?')) {
      this.jobService.deleteJob(id).subscribe({
        next: () => {
          this.toast.success('Job Removed', 'The job has been removed by administrator action.');
          this.jobs = this.jobs.filter(j => (j._id || j.id) !== id);
          this.totalJobsCount--;
        },
        error: (err) => {
          this.toast.error('Action Failed', err.error?.message || 'Could not delete job.');
        }
      });
    }
  }
}
