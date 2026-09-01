import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Job, JobFilters, JobListResponse, CreateJobDto, UpdateJobDto, RecommendedJobsResponse } from '../models/job.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = `${environment.apiUrl}/jobs`;

  constructor(private http: HttpClient) {}

  getAllJobs(filters?: JobFilters): Observable<JobListResponse> {
    let params = new HttpParams();
    if (filters) {
      if (filters.search) params = params.set('search', filters.search.trim());
      if (filters.location) params = params.set('location', filters.location.trim());
      if (filters.companyName) params = params.set('companyName', filters.companyName.trim());
      if (filters.type) params = params.set('type', filters.type);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }
    return this.http.get<JobListResponse>(this.apiUrl, { params });
  }

  getJobById(id: string): Observable<Job> {
    return this.http.get<Job>(`${this.apiUrl}/${id}`);
  }

  getRecommendedJobs(): Observable<RecommendedJobsResponse> {
    return this.http.get<RecommendedJobsResponse>(`${this.apiUrl}/recommended`);
  }

  createJob(data: CreateJobDto): Observable<{ message: string; data: Job }> {
    return this.http.post<{ message: string; data: Job }>(this.apiUrl, data);
  }

  updateJob(id: string, data: UpdateJobDto): Observable<Job> {
    return this.http.put<Job>(`${this.apiUrl}/${id}`, data);
  }

  deleteJob(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
