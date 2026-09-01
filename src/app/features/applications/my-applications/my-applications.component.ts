import { Component, OnInit } from '@angular/core';
import { ApplicationService, Application } from '../../../core/services/application.service';

@Component({
  selector: 'app-my-applications',
  templateUrl: './my-applications.component.html',
  styleUrls: ['./my-applications.component.css']
})
export class MyApplicationsComponent implements OnInit {
  applications: Application[] = [];
  isLoading = true;

  constructor(private applicationService: ApplicationService) {}

  ngOnInit(): void {
    this.applicationService.getMyApplications().subscribe({
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
