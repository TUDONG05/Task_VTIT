import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected readonly formError = signal('');
  protected readonly isPasswordVisible = signal(false);
  protected readonly isLockedOut = signal(false);

  togglePasswordVisibility(): void {
    this.isPasswordVisible.update((v) => !v);
  }

  submit(): void {
    this.formError.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    const result = this.auth.login(email.trim(), password);

    if (result.success) {
      this.router.navigate(['/users']);
      return;
    }

    this.formError.set(result.message ?? '');
    if (result.locked) {
      this.isLockedOut.set(true);
    }
  }
}
