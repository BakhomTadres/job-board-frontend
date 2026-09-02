import { Component, Input } from '@angular/core';
import { Job } from '../../../core/models/job.model';

@Component({
  selector: 'app-job-card',
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css']
})
export class JobCardComponent {
  @Input() job!: Job;
  @Input() showActions = true;

  getJobTypeBadgeClass(type: string): string {
    switch (type) {
      case 'Full-time': return 'badge-primary';
      case 'Remote': return 'badge-success';
      case 'Part-time': return 'badge-warning';
      case 'Freelance': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getSalaryFormatted(salary?: number): string {
    if (!salary) return 'Negotiable';
    return `$${salary.toLocaleString()}/yr`;
  }
}
