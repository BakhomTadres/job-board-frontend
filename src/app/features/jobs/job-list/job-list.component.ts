import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { distinctUntilChanged } from 'rxjs/operators';
import { JobService } from '../../../core/services/job.service';
import { Job, JobFilters, JobType } from '../../../core/models/job.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-job-list',
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  isLoading = true;
  hasError = false;
  totalJobs = 0;

  // Filter state
  searchQuery = '';
  locationQuery = '';
  companyQuery = '';
  selectedType = '';
  currentPage = 1;
  pageSize = 10;

  jobTypes: { label: string; value: string }[] = [
    { label: 'All Types', value: '' },
    { label: 'Full-time', value: 'Full-time' },
    { label: 'Part-time', value: 'Part-time' },
    { label: 'Remote', value: 'Remote' },
    { label: 'Freelance', value: 'Freelance' }
  ];

  constructor(
    private jobService: JobService,
    public authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.pipe(
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(params => {
      this.searchQuery = params['search'] || '';
      this.locationQuery = params['location'] || '';
      this.companyQuery = params['companyName'] || '';
      this.selectedType = params['type'] || '';
      this.currentPage = params['page'] ? Number(params['page']) : 1;
      this.fetchJobs();
    });
  }

  fetchJobs(): void {
    this.isLoading = true;
    this.hasError = false;

    const filters: JobFilters = {
      search: this.searchQuery || undefined,
      location: this.locationQuery || undefined,
      companyName: this.companyQuery || undefined,
      type: this.selectedType || undefined,
      page: this.currentPage,
      limit: this.pageSize
    };

    this.jobService.getAllJobs(filters).subscribe({
      next: (res) => {
        this.jobs = res.data || [];
        this.totalJobs = res.results >= this.pageSize 
          ? this.currentPage * this.pageSize + 1 
          : (this.currentPage - 1) * this.pageSize + (res.results || 0);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.updateUrlParams();
  }

  onTypeSelect(type: string): void {
    this.selectedType = type;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.locationQuery = '';
    this.companyQuery = '';
    this.selectedType = '';
    this.currentPage = 1;
    this.updateUrlParams();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updateUrlParams();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateUrlParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.searchQuery.trim() || null,
        location: this.locationQuery.trim() || null,
        companyName: this.companyQuery.trim() || null,
        type: this.selectedType || null,
        page: this.currentPage > 1 ? this.currentPage : null
      },
      queryParamsHandling: 'merge'
    });
  }

  get isEmployer(): boolean {
    return this.authService.hasRole('employer', 'admin');
  }
}
