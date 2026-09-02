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

  // يجيب كل الطلبات (Applications) - مخصص لصفحة الادمن
  getAllApplications(params?: { limit?: number; page?: number; status?: ApplicationStatus }): Observable<ApplicationListResponse> {
    return this.http.get<ApplicationListResponse>(`${this.apiUrl}/applications`, { params: params as any });
  }

  // بترجع نفس بيانات getAllApplications، متسابة عشان اي حد تاني بيستخدمها القديمة يفضل شغال
  getApplicationsCount(): Observable<ApplicationListResponse> {
    return this.getAllApplications({ limit: 1 });
  }
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

  // بيمسح طلب تقديم معين - GET /api/applications/:id
  deleteApplication(applicationId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/applications/${applicationId}`);
  }
}