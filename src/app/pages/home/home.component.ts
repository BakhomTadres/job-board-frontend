import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models/job.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  featuredJobs: Job[] = [];
  recommendedJobs: Job[] = [];
  isLoading = true;
  hasError = false;
  searchKeyword = '';
  searchLocation = '';

  popularCategories = [
    { name: 'Remote Jobs', icon: 'fa-solid fa-laptop-code', type: 'Remote', count: '1,240+' },
    { name: 'Full-Time', icon: 'fa-solid fa-briefcase', type: 'Full-time', count: '3,800+' },
    { name: 'Freelance / Contract', icon: 'fa-solid fa-handshake', type: 'Freelance', count: '850+' },
    { name: 'Part-Time', icon: 'fa-regular fa-clock', type: 'Part-time', count: '420+' }
  ];

  stats = [
    { label: 'Live Openings', value: '12,500+' },
    { label: 'Verified Companies', value: '1,800+' },
    { label: 'Active Candidates', value: '45,000+' },
    { label: 'Match Rate', value: '94%' }
  ];

  isLoadingRecommended = false;
  isJobSeeker = false;

  constructor(
    private jobService: JobService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchFeaturedJobs();
    
    // Check role immediately & reactively
    if (this.authService.isLoggedIn() && this.authService.hasRole('job seeker')) {
      this.isJobSeeker = true;
      this.fetchRecommendedJobs();
    }

    this.authService.currentUser$.subscribe(user => {
      const isSeeker = this.authService.isLoggedIn() && (user?.role === 'job seeker' || this.authService.hasRole('job seeker'));
      this.isJobSeeker = isSeeker;
      if (isSeeker && this.recommendedJobs.length === 0 && !this.isLoadingRecommended) {
        this.fetchRecommendedJobs();
      }
    });
  }

  fetchFeaturedJobs(): void {
    this.isLoading = true;
    this.hasError = false;
    this.jobService.getAllJobs({ limit: 6 }).subscribe({
      next: (res) => {
        this.featuredJobs = res.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  fetchRecommendedJobs(): void {
    this.isLoadingRecommended = true;
    this.jobService.getRecommendedJobs().subscribe({
      next: (res) => {
        if (res && res.data && res.data.jobs) {
          this.recommendedJobs = res.data.jobs.slice(0, 3);
        }
        this.isLoadingRecommended = false;
      },
      error: () => {
        this.isLoadingRecommended = false;
      }
    });
  }

  onSearch(): void {
    this.router.navigate(['/jobs'], {
      queryParams: {
        search: this.searchKeyword.trim() || undefined,
        location: this.searchLocation.trim() || undefined
      }
    });
  }

  filterByType(type: string): void {
    this.router.navigate(['/jobs'], {
      queryParams: { type }
    });
  }
}
