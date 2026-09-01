import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApplyJobRequest {
  jobTitle?: string;
  applicantName: string;
  cv: string;
}

export interface Application {
  _id: string;
  job: string | any;
  applicant: string | any;
  applicantName: string;
  cv: string;
  matchScore?: number;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = `${environment.apiUrl}/applications`;

  constructor(private http: HttpClient) {}

  applyForJob(jobId: string, data: ApplyJobRequest): Observable<{ message: string; data: Application }> {
    return this.http.post<{ message: string; data: Application }>(`${environment.apiUrl}/jobs/${jobId}/apply`, data);
  }

  getMyApplications(): Observable<{ results: number; data: Application[] }> {
    return this.http.get<{ results: number; data: Application[] }>(`${this.apiUrl}/my`);
  }

  getJobApplications(jobId: string): Observable<{ results: number; data: Application[] }> {
    return this.http.get<{ results: number; data: Application[] }>(`${environment.apiUrl}/jobs/${jobId}/applications`);
  }
}
