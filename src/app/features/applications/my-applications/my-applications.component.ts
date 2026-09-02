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

  // id بتاع الكارد اللي بيتحذف دلوقتي، عشان نعرض سبينر/تعطيل الزرار بتاعه بس
  deletingId: string | null = null;
  deleteError: string | null = null;

  // حالة الـ Modal الخاص بتأكيد الحذف
  showDeleteModal = false;
  appToDelete: any = null;

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

  // بيرجع الـ id بتاع الـ application نفسه (مش الجوب)
  getAppId(app: any): string | null {
    if (!app) return null;
    return app._id || app.id || null;
  }

  // بيفتح المودال ويحدد إنهي application هيتحذف
  openDeleteModal(app: any): void {
    this.appToDelete = app;
    this.deleteError = null;
    this.showDeleteModal = true;
  }

  // بيقفل المودال من غير ما يحذف حاجة
  closeDeleteModal(): void {
    if (this.deletingId) return; // منمنعش قفل المودال وهو بيحذف فعليًا
    this.showDeleteModal = false;
    this.appToDelete = null;
  }

  // بيتنفذ لما المستخدم يضغط "تأكيد الحذف" جوه المودال
  confirmDelete(): void {
    const appId = this.getAppId(this.appToDelete);
    if (!appId) return;

    this.deleteError = null;
    this.deletingId = appId;

    this.applicationService.deleteApplication(appId).subscribe({
      next: () => {
        this.applications = this.applications.filter(a => this.getAppId(a) !== appId);
        this.deletingId = null;
        this.showDeleteModal = false;
        this.appToDelete = null;
      },
      error: () => {
        this.deletingId = null;
        this.deleteError = 'حصل خطأ أثناء حذف الطلب، جرب تاني.';
      }
    });
  }
}