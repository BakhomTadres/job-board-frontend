import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { JobType } from '../../../core/models/job.model';

@Component({
  selector: 'app-create-job',
  templateUrl: './create-job.component.html',
  styleUrls: ['./create-job.component.css']
})
export class CreateJobComponent implements OnInit {
  jobForm!: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  skillsList: string[] = [];
  currentSkillInput = '';

  jobTypes: JobType[] = ['Full-time', 'Part-time', 'Remote', 'Freelance'];

  constructor(
    private fb: FormBuilder,
    private jobService: JobService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.jobForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(20)]],
      location: ['', [Validators.required]],
      salary: [null, [Validators.min(0)]],
      type: ['Full-time' as JobType, [Validators.required]]
    });
  }

  get f() {
    return this.jobForm.controls;
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

    this.isLoading = true;

    const payload = {
      ...this.jobForm.value,
      salary: this.jobForm.value.salary ? Number(this.jobForm.value.salary) : undefined,
      skills: this.skillsList
    };

    this.jobService.createJob(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toast.success('Job Published!', 'Your job posting is now live.');
        const newId = res.data?._id || res.data?.id;
        if (newId) {
          this.router.navigate(['/jobs', newId]);
        } else {
          this.router.navigate(['/jobs/manage']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to create job posting. Please try again.';
      }
    });
  }
}
