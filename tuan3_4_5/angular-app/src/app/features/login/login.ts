import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AuthLayout } from '../../shared/auth-layout/auth-layout';
import { AuthService } from '../../core/services/auth';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthLayout,
    NzAlertModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly formError = signal('');
  protected readonly isPasswordVisible = signal(false);
  protected readonly isLockedOut = signal(false);
  protected readonly isSubmitting = signal(false);

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

    this.isSubmitting.set(true);

    this.auth
      .login(email.trim(), password)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe((result) => {
        if (result.success) {
          this.router.navigate(['/users']);
          return;
        }

        this.formError.set(result.message ?? '');
        this.isLockedOut.set(result.locked ?? false);
      });
  }
}
