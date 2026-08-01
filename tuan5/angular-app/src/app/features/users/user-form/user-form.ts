import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss'
})
export class UserForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    avatar: ['', [Validators.required]]
  });

  protected readonly userId = signal<number | null>(null);
  protected readonly isEditMode = signal(false);
  protected readonly isSaving = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) return;

    const id = Number(idParam);
    this.userId.set(id);
    this.isEditMode.set(true);
    this.isLoading.set(true);

    this.userService.fetchOne(id).subscribe({
      next: (user) => {
        this.isLoading.set(false);
        if (!user) {
          this.errorMessage.set('Không tìm thấy người dùng.');
          return;
        }
        this.form.setValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Không tải được thông tin người dùng.');
      }
    });
  }

  submit(): void {
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const value = this.form.getRawValue();
    const id = this.userId();

    const request = this.isEditMode() && id !== null ? this.userService.update(id, value) : this.userService.create(value);

    request.subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/users']);
      },
      error: () => {
        this.isSaving.set(false);
        this.errorMessage.set('Lưu người dùng thất bại. Vui lòng thử lại.');
      }
    });
  }
}
