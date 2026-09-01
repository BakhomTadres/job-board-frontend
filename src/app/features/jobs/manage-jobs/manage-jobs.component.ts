import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job } from '../../../core/models/job.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.css']
})
export class ManageJobsComponent implements OnInit {
  jobs: Job[] = [];
  isLoading = true;
  hasError = false;
  currentUser: User | null = null;

  // Delete modal state
  isDeleteModalOpen = false;
  jobToDelete: Job | null = null;
  isDeleting = false;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.fetchMyJobs();
      }
    });
  }

  fetchMyJobs(): void {
    this.isLoading = true;
    this.hasError = false;

    this.jobService.getAllJobs({ limit: 100 }).subscribe({
      next: (res) => {
        const allJobs = res.data || [];
        const currentUserId = this.currentUser?._id || this.currentUser?.id;

        if (this.currentUser?.role === 'admin') {
          // Admin can see and manage all jobs
          this.jobs = allJobs;
        } else {
          // Employer sees only their own jobs
          this.jobs = allJobs.filter(job => {
            const empId = typeof job.employer === 'object' ? job.employer?._id : job.employer;
            return empId === currentUserId;
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  promptDeleteJob(job: Job): void {
    this.jobToDelete = job;
    this.isDeleteModalOpen = true;
  }

  cancelDelete(): void {
    this.isDeleteModalOpen = false;
    this.jobToDelete = null;
  }

  confirmDelete(): void {
    if (!this.jobToDelete) return;

    const id = this.jobToDelete._id || this.jobToDelete.id;
    if (!id) return;

    this.isDeleting = true;

    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.isDeleting = false;
        this.isDeleteModalOpen = false;
        this.toast.success('Job Deleted', 'The job posting has been permanently removed.');
        this.jobs = this.jobs.filter(j => (j._id || j.id) !== id);
        this.jobToDelete = null;
      },
      error: (err) => {
        this.isDeleting = false;
        this.toast.error('Deletion Failed', err.error?.message || 'Could not delete job.');
      }
    });
  }
}
