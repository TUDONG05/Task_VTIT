import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/services/user';
import { AuthService } from '../../../core/services/auth';
import { finalize } from 'rxjs';
const PAGE_SIZE = 10;

@Component({
  selector: 'app-user-list',
  imports: [RouterLink],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly users = this.userService.list;
  protected readonly page = signal(0);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly deletingId = signal<number | null>(null);

  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.userService.total() / PAGE_SIZE)),
  );

  ngOnInit(): void {
    this.loadPage();
  }

  private loadPage(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.userService
      .fetchPage(this.page() * PAGE_SIZE, PAGE_SIZE)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        error: () => {
          this.errorMessage.set('Không thể tải danh sách người dùng. Vui lòng thử lại.');
        },
      });
  }

  goToPage(delta: number): void {
    const next = this.page() + delta;
    if (next < 0 || next >= this.totalPages()) return;
    this.page.set(next);
    this.loadPage();
  }

  removeUser(id: number): void {
    if (!confirm('Bạn có chắc muốn xóa người dùng này?')) return;

    this.deletingId.set(id);
    this.errorMessage.set('');

    this.userService
      .delete(id)
      .pipe(finalize(() => this.deletingId.set(null)))
      .subscribe({
        error: () => {
          this.errorMessage.set('Xóa người dùng thất bại. Vui lòng thử lại.');
        },
      });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/dang-nhap']);
  }
}
