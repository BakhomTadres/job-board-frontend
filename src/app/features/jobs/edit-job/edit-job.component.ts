import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job, JobType } from '../../../core/models/job.model';

@Component({
  selector: 'app-edit-job',
  templateUrl: './edit-job.component.html',
  styleUrls: ['./edit-job.component.css']
})
export class EditJobComponent implements OnInit {
  jobForm!: FormGroup;
  jobId = '';
  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;

  skillsList: string[] = [];
  currentSkillInput = '';

  jobTypes: JobType[] = ['Full-time', 'Part-time', 'Remote', 'Freelance'];

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.jobId = this.route.snapshot.params['id'];

    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      location: ['', [Validators.required]],
      salary: [null, [Validators.min(0)]],
      type: ['Full-time' as JobType, [Validators.required]]
    });

    this.fetchJob();
  }

  get f() {
    return this.jobForm.controls;
  }

  fetchJob(): void {
    this.isLoading = true;
    this.jobService.getJobById(this.jobId).subscribe({
      next: (job: Job) => {
        this.jobForm.patchValue({
          title: job.title,
          companyName: job.companyName,
          description: job.description,
          location: job.location,
          salary: job.salary,
          type: job.type
        });
        this.skillsList = job.skills || [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load job details for editing.';
        this.isLoading = false;
      }
    });
  }

  addSkill(): void {
    const trimmed = this.currentSkillInput.trim();
    if (trimmed && !this.skillsList.includes(trimmed)) {
      this.skillsList.push(trimmed);
      this.currentSkillInput = '';
    }
  }

  removeSkill(index: number): void {
    this.skillsList.splice(index, 1);
  }

  onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkill();
    }
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (this.jobForm.invalid) {
      this.jobForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const payload = {
      ...this.jobForm.value,
      salary: this.jobForm.value.salary ? Number(this.jobForm.value.salary) : undefined,
      skills: this.skillsList
    };

    this.jobService.updateJob(this.jobId, payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.toast.success('Job Updated', 'The job details have been saved successfully.');
        this.router.navigate(['/jobs', this.jobId]);
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update job. Please check your data.';
      }
    });
  }
}
