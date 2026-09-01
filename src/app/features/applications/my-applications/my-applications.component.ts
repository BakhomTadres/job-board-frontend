import { Component, OnInit } from '@angular/core';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth.service';
import { Application, ApplicationStatus } from '../../../core/models/application.model';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];
  isLoading = true;
  hasError = false;

  constructor(
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchApplications();
  }

  fetchApplications(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    this.applicationService.getMyApplications(userId).subscribe({
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

  getJobId(job: any): string | null {
    if (!job) return null;
    return typeof job === 'object' ? (job._id || job.id) : job;
  }
}
