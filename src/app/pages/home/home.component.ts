import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models/job.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredJobs: Job[] = [];
  recommendedJobs: Job[] = [];
  isLoading = true;
  hasError = false;
  searchKeyword = '';
  searchLocation = '';

  popularCategories = [
    { name: 'Remote Jobs', icon: 'fa-solid fa-laptop-code', type: 'Remote', count: 0 },
    { name: 'Full-Time', icon: 'fa-solid fa-briefcase', type: 'Full-time', count: 0 },
    { name: 'Freelance / Contract', icon: 'fa-solid fa-handshake', type: 'Freelance', count: 0 },
    { name: 'Part-Time', icon: 'fa-regular fa-clock', type: 'Part-time', count: 0 }
  ];

  stats = [
    { label: 'Live Openings', value: '10+' },
    { label: 'Verified Companies', value: '5+' },
    { label: 'Active Candidates', value: '15+' },
    { label: 'Match Rate', value: '94%' }
  ];

  totalJobsCount = 0;
  isLoadingStats = true;
  isLoadingRecommended = false;
  isJobSeeker = false;

  private userSub?: Subscription;

  constructor(
    private jobService: JobService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchFeaturedJobs();
    this.fetchPlatformStats();
    
    // Check role immediately & reactively
    if (this.authService.isLoggedIn() && this.authService.hasRole('job seeker')) {
      this.isJobSeeker = true;
      this.fetchRecommendedJobs();
    }

    this.userSub = this.authService.currentUser$.subscribe(user => {
      const isSeeker = this.authService.isLoggedIn() && (user?.role === 'job seeker' || this.authService.hasRole('job seeker'));
      this.isJobSeeker = isSeeker;
      if (isSeeker && this.recommendedJobs.length === 0 && !this.isLoadingRecommended) {
        this.fetchRecommendedJobs();
      }
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
    this.animFrameIds.forEach(id => {
      if (id) cancelAnimationFrame(id);
    });
  }

  private readonly STATS_STORAGE_KEY = 'careerhub_cached_stats';
  private animFrameIds: number[] = [0, 0, 0, 0];

  fetchPlatformStats(): void {
    // Reset to starting base so user sees the count-up effect clearly
    this.stats[0].value = '0+';
    this.stats[1].value = '0+';
    this.stats[2].value = '0+';
    this.stats[3].value = '0%';

    let hasStartedAnimation = false;

    // 1. If we have cached stats, start count-up immediately without waiting for network
    try {
      const cached = sessionStorage.getItem(this.STATS_STORAGE_KEY);
      if (cached) {
        const d = JSON.parse(cached);
        this.applyStatsData(d);
        hasStartedAnimation = true;
      }
    } catch (e) {}

    // 2. Fetch fresh data from backend
    this.isLoadingStats = true;
    this.jobService.getPlatformStats().subscribe({
      next: (res) => {
        this.isLoadingStats = false;
        if (res && res.data) {
          const d = res.data;
          try {
            sessionStorage.setItem(this.STATS_STORAGE_KEY, JSON.stringify(d));
          } catch (e) {}
          
          if (!hasStartedAnimation) {
            this.applyStatsData(d);
          } else {
            // Update total jobs count and categories smoothly in background
            this.totalJobsCount = d.totalJobs;
            const counts = d.categoryCounts || {};
            this.popularCategories = this.popularCategories.map(cat => ({
              ...cat,
              count: counts[cat.type] ?? 0
            }));
          }
        }
      },
      error: (err) => {
        this.isLoadingStats = false;
        if (!hasStartedAnimation) {
          console.warn('Could not load dynamic platform stats, using fallback', err);
        }
      }
    });
  }

  private applyStatsData(d: any): void {
    this.totalJobsCount = d.totalJobs;

    // Calm and steady count-up animation (~1.6 seconds) so users can easily observe it
    this.animateStat(0, d.totalJobs, '+', (val) => {
      this.stats[0].value = val;
    });
    this.animateStat(1, d.verifiedCompanies, '+', (val) => {
      this.stats[1].value = val;
    });
    this.animateStat(2, d.activeCandidates, '+', (val) => {
      this.stats[2].value = val;
    });
    this.animateStat(3, d.matchRate, '%', (val) => {
      this.stats[3].value = val;
    });

    // Dynamic category counts
    const counts = d.categoryCounts || {};
    this.popularCategories = this.popularCategories.map(cat => ({
      ...cat,
      count: counts[cat.type] ?? 0
    }));
  }

  private animateStat(index: number, targetValue: number, suffix: string, updateFn: (val: string) => void): void {
    if (this.animFrameIds[index]) {
      cancelAnimationFrame(this.animFrameIds[index]);
    }

    if (targetValue <= 0) {
      updateFn(`0${suffix === '%' ? '%' : ''}`);
      return;
    }

    // 1600ms duration for a calm, comfortable and noticeable counting pace
    const duration = 1600;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smooth ease-out cubic (starts steadily and settles gently)
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(ease * targetValue);

      updateFn(this.formatNumber(current, suffix));

      if (progress < 1) {
        this.animFrameIds[index] = requestAnimationFrame(step);
      } else {
        updateFn(this.formatNumber(targetValue, suffix));
        this.animFrameIds[index] = 0;
      }
    };

    this.animFrameIds[index] = requestAnimationFrame(step);
  }

  formatNumber(val: number, suffix: string): string {
    if (val >= 1000) {
      return val.toLocaleString() + suffix;
    }
    return suffix === '%' ? `${val}%` : `${val}${val > 0 ? suffix : ''}`;
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
