import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage: string | null = null;

  skillsList: string[] = [];
  currentSkillInput = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      newEmail: ['', [Validators.email]],
      password: ['', [Validators.minLength(6)]],
      passwordConfirm: ['']
    }, { validators: this.passwordMatchValidator });

    this.fetchProfile();
  }

  get f() {
    return this.profileForm.controls;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('passwordConfirm')?.value;
    if (password && password !== confirmPassword) {
      control.get('passwordConfirm')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  fetchProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (res) => {
        this.currentUser = res.user;
        this.profileForm.patchValue({
          name: res.user.name,
          newEmail: res.user.email
        });
        this.skillsList = [...(res.user.skills || [])];
        this.isLoading = false;
      },
      error: () => {
        this.currentUser = this.authService.currentUserValue;
        if (this.currentUser) {
          this.profileForm.patchValue({
            name: this.currentUser.name,
            newEmail: this.currentUser.email
          });
          this.skillsList = [...(this.currentUser.skills || [])];
        }
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

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const { name, newEmail, password, passwordConfirm } = this.profileForm.value;
    const payload: any = {
      name: name.trim(),
      skills: this.skillsList
    };

    if (newEmail && newEmail !== this.currentUser?.email) {
      payload.newEmail = newEmail.trim();
    }

    if (password) {
      payload.password = password;
      payload.passwordConfirm = passwordConfirm;
    }

    this.authService.updateProfile(payload).subscribe({
      next: (res) => {
        this.currentUser = res.user;
        this.isSaving = false;
        this.toast.success('Profile Saved', 'Your profile details have been successfully updated.');
        this.profileForm.patchValue({ password: '', passwordConfirm: '' });
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.message || 'Failed to update profile. Please try again.';
      }
    });
  }
}
