import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptor
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';

// Shared Components
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { JobCardComponent } from './shared/components/job-card/job-card.component';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from './shared/components/empty-state/empty-state.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';
import { PaginationComponent } from './shared/components/pagination/pagination.component';
import { SplashScreenComponent } from './shared/components/splash-screen/splash-screen.component';

// Pages
import { HomeComponent } from './pages/home/home.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

// Auth Features
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';

// Job Features
import { JobListComponent } from './features/jobs/job-list/job-list.component';
import { JobDetailsComponent } from './features/jobs/job-details/job-details.component';
import { CreateJobComponent } from './features/jobs/create-job/create-job.component';
import { EditJobComponent } from './features/jobs/edit-job/edit-job.component';
import { ManageJobsComponent } from './features/jobs/manage-jobs/manage-jobs.component';

// Application Features
import { MyApplicationsComponent } from './features/applications/my-applications/my-applications.component';
import { JobApplicationsComponent } from './features/applications/job-applications/job-applications.component';

// User Profile Feature
import { UserProfileComponent } from './features/profile/user-profile/user-profile.component';

// Admin Feature
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';

// Payment Features
import { CheckoutComponent } from './features/payment/checkout/checkout.component';
import { PaymentSuccessComponent } from './features/payment/payment-success/payment-success.component';
import { PaymentFailureComponent } from './features/payment/payment-failure/payment-failure.component';

@NgModule({
  declarations: [
    AppComponent,
    // Shared
    NavbarComponent,
    FooterComponent,
    JobCardComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ToastComponent,
    ConfirmModalComponent,
    PaginationComponent,
    SplashScreenComponent,
    // Pages
    HomeComponent,
    NotFoundComponent,
    // Features
    LoginComponent,
    RegisterComponent,
    JobListComponent,
    JobDetailsComponent,
    CreateJobComponent,
    EditJobComponent,
    ManageJobsComponent,
    MyApplicationsComponent,
    JobApplicationsComponent,
    UserProfileComponent,
    AdminDashboardComponent,
    CheckoutComponent,
    PaymentSuccessComponent,
    PaymentFailureComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
