import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Application, CreateApplicationDto, ApplicationResponse, ApplicationListResponse, ApplicationStatus } from '../models/application.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  applyForJob(jobId: string, data: CreateApplicationDto): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(`${this.apiUrl}/jobs/${jobId}/apply`, data);
  }

  getMyApplications(userId: string): Observable<ApplicationListResponse> {
    return this.http.get<ApplicationListResponse>(`${this.apiUrl}/applications/user/${userId}`);
  }

  getJobApplications(jobId: string): Observable<ApplicationListResponse> {
    return this.http.get<ApplicationListResponse>(`${this.apiUrl}/jobs/${jobId}/applications`);
  }

  updateApplicationStatus(applicationId: string, status: ApplicationStatus): Observable<ApplicationResponse> {
    return this.http.patch<ApplicationResponse>(`${this.apiUrl}/applications/${applicationId}`, { status });
  }
}
