import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job } from '../../../core/models/job.model';
import { User } from '../../../core/models/user.model';
import { Application } from '../../../core/models/application.model';
import { ApplicationService } from '../../../core/services/application.service';
import { UserService } from '../../../core/services/user.service';
@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  jobs: Job[] = [];
  applications: Application[] = [];
  currentUser: User | null = null;
  isLoading = true;
  hasError = false;

  totalJobsCount = 0;
  totalApplicationsCount = 0;
  totalUsersCount = 0;

  constructor(
    private jobService: JobService,
    private applicationService: ApplicationService,
    private userService: UserService,
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
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });

    this.applicationService.getAllApplications({ limit: 100 }).subscribe({
      next: (res) => {
        this.applications = res.data || [];
        this.totalApplicationsCount = res.data.length ?? this.applications.length;
      },
      error: () => {
        this.toast.error('Load Failed', 'Could not load applications.');
      }
    });

    this.userService.getAllUsers({ limit: 1 }).subscribe({
      next: (res) => {
        this.totalUsersCount = res.results ?? (res.data ? res.data.length : 0);
      },
      error: () => {
        this.toast.error('Load Failed', 'Could not load users count.');
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