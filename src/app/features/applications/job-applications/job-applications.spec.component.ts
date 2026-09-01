import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { Application, ApplicationStatus } from '../../../core/models/application.model';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-applications',
  templateUrl: './job-applications.component.html',
  styleUrls: ['./job-applications.component.css']
})
export class JobApplicationsComponent implements OnInit {
  jobId = '';
  job: Job | null = null;
  applications: Application[] = [];
  isLoading = true;
  hasError = false;
  updatingAppId: string | null = null;

  statusOptions: ApplicationStatus[] = ['pending', 'accepted', 'rejected', 'hired'];

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private jobService: JobService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['jobId'] || this.route.snapshot.params['id'];
    this.fetchData();
  }

  fetchData(): void {
    this.isLoading = true;
    this.hasError = false;

    // Fetch job info
    this.jobService.getJobById(this.jobId).subscribe({
      next: (job) => {
        this.job = job;
      },
      error: () => {
        // quiet fallback
      }
    });

    // Fetch applications
    this.applicationService.getJobApplications(this.jobId).subscribe({
      next: (res) => {
        this.applications = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

 onStatusChange(app: Application, newStatus: ApplicationStatus): void {
  const appId = app._id || app.id;

  if (!appId || app.status === newStatus) return;

  this.updatingAppId = appId;

  this.applicationService.updateApplicationStatus(appId, newStatus).subscribe({
    next: (res) => {
      this.updatingAppId = null;

      // Get the actual data from backend again
      this.fetchData();

      this.toast.success(
        'Status Updated',
        `Application status updated to ${res.data.status}.`
      );
    },

    error: (err) => {
      this.updatingAppId = null;

      this.toast.error(
        'Update Failed',
        err.error?.message || 'Could not update status.'
      );
    }
  });
}

  getStatusBadgeClass(status: ApplicationStatus | string): string {
    switch (status) {
      case 'accepted':
      case 'hired':
        return 'badge-success';
      case 'rejected':
        return 'badge-danger';
      case 'pending':
      default:
        return 'badge-warning';
    }
  }

  getApplicantEmail(app: Application): string {
    if (typeof app.userId === 'object' && app.userId?.email) {
      return app.userId.email;
    }
    return 'Not provided';
  }

  getApplicantSkills(app: Application): string[] {
    if (typeof app.userId === 'object' && app.userId?.skills) {
      return app.userId.skills;
    }
    return [];
  }
}
