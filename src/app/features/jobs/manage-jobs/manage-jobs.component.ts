import { Component, OnInit } from '@angular/core';
import { JobService } from '../../../core/services/job.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-manage-jobs',
  templateUrl: './manage-jobs.component.html',
  styleUrls: ['./manage-jobs.component.css']
})
export class ManageJobsComponent implements OnInit {
  jobs: Job[] = [];
  isLoading = true;
  jobToDelete: Job | null = null;
  isConfirmModalOpen = false;

  constructor(
    private jobService: JobService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.isLoading = true;
    this.jobService.getAllJobs().subscribe({
      next: (res) => {
        const currentUserId = this.authService.getUserId();
        const role = this.authService.getUserRole();
        if (role === 'admin') {
          this.jobs = res.data;
        } else {
          this.jobs = res.data.filter(j => {
            const empId = typeof j.employer === 'object' ? j.employer?._id : j.employer;
            return empId === currentUserId;
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  confirmDelete(job: Job): void {
    this.jobToDelete = job;
    this.isConfirmModalOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.jobToDelete) return;
    const id = this.jobToDelete._id || this.jobToDelete.id;
    if (!id) return;

    this.jobService.deleteJob(id).subscribe({
      next: () => {
        this.toast.success('Job Deleted', 'The job posting was successfully removed.');
        this.isConfirmModalOpen = false;
        this.jobToDelete = null;
        this.loadJobs();
      },
      error: (err) => {
        this.toast.error('Error', err.error?.message || 'Failed to delete job.');
        this.isConfirmModalOpen = false;
      }
    });
  }

  onDeleteCancelled(): void {
    this.isConfirmModalOpen = false;
    this.jobToDelete = null;
  }
}
