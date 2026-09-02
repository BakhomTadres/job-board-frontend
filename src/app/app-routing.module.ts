import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { NonAuthGuard } from './core/guards/non-auth.guard';
import { HasJobCreditGuard } from './core/guards/has-job-credit.guard';

// Components
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { JobListComponent } from './features/jobs/job-list/job-list.component';
import { JobDetailsComponent } from './features/jobs/job-details/job-details.component';
import { CreateJobComponent } from './features/jobs/create-job/create-job.component';
import { EditJobComponent } from './features/jobs/edit-job/edit-job.component';
import { ManageJobsComponent } from './features/jobs/manage-jobs/manage-jobs.component';
import { MyApplicationsComponent } from './features/applications/my-applications/my-applications.component';
import { JobApplicationsComponent } from './features/applications/job-applications/job-applications.component';
import { UserProfileComponent } from './features/profile/user-profile/user-profile.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard/admin-dashboard.component';
import { CheckoutComponent } from './features/payment/checkout/checkout.component';
import { PaymentSuccessComponent } from './features/payment/payment-success/payment-success.component';
import { PaymentFailureComponent } from './features/payment/payment-failure/payment-failure.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

const routes: Routes = [
  // Public Landing
  { path: '', component: HomeComponent },

  // Auth Routes
  { path: 'auth/login', component: LoginComponent, canActivate: [NonAuthGuard] },
  { path: 'auth/register', component: RegisterComponent, canActivate: [NonAuthGuard] },

  // Jobs Routes
  { path: 'jobs', component: JobListComponent },
  {
    path: 'jobs/create',
    component: CreateJobComponent,
    canActivate: [AuthGuard, RoleGuard, HasJobCreditGuard],
    data: { roles: ['employer', 'admin'] }
  },
  {
    path: 'jobs/manage',
    component: ManageJobsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['employer', 'admin'] }
  },
  {
    path: 'jobs/:jobId/applications',
    component: JobApplicationsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['employer', 'admin'] }
  },
  { path: 'jobs/:id', component: JobDetailsComponent },
  {
    path: 'jobs/:id/edit',
    component: EditJobComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['employer', 'admin'] }
  },

  // Applications
  {
    path: 'applications/my',
    component: MyApplicationsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['job seeker', 'admin'] }
  },

  // Profile
  {
    path: 'profile',
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },

  // Admin Dashboard
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },

  // Payment / Pricing
  { path: 'pricing', component: CheckoutComponent },
  { path: 'payment/checkout', component: CheckoutComponent },
  { path: 'payment/success', component: PaymentSuccessComponent },
  { path: 'payment/failure', component: PaymentFailureComponent },

  // Wildcard 404
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}