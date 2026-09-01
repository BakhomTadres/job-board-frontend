import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApplicationService, Application } from '../../../core/services/application.service';

@Component({
  selector: 'app-job-applications',
  templateUrl: './job-applications.component.html',
  styleUrls: ['./job-applications.component.css']
})
export class JobApplicationsComponent implements OnInit {
  jobId = '';
  applications: Application[] = [];
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private applicationService: ApplicationService
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['jobId'];
    if (this.jobId) {
      this.applicationService.getJobApplications(this.jobId).subscribe({
        next: (res) => {
          this.applications = res.data || [];
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
