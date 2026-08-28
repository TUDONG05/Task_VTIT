import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { UserService } from '../../../core/services/user';
import { AuthService } from '../../../core/services/auth';
import { debounceTime, distinctUntilChanged, finalize, map, startWith } from 'rxjs';
const PAGE_SIZE = 10;

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .trim();
}

@Component({
  selector: 'app-user-list',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzAlertModule,
    NzAvatarModule,
    NzButtonModule,
    NzCardModule,
    NzPaginationModule,
    NzPopconfirmModule,
    NzInputModule,
    NzTableModule,
  ],
  templateUrl: './user-list.html',
  styleUrl: './user-list.scss',
})
export class UserList implements OnInit {
  private readonly userService = inject(UserService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly users = this.userService.list;
  protected readonly total = this.userService.total;
  protected readonly pageSize = PAGE_SIZE;
  protected readonly page = signal(0);
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly deletingId = signal<number | null>(null);
  private readonly searchTerm = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      map(normalizeSearchText),
      distinctUntilChanged(),
      startWith(''),
    ),
    { initialValue: '' },
  );
  protected readonly filteredUsers = computed(() => {
    const term = this.searchTerm();
    if (!term) return this.users();

    return this.users().filter((user) => {
      const fullName = normalizeSearchText(`${user.firstName} ${user.lastName}`);
      const reversedName = normalizeSearchText(`${user.lastName} ${user.firstName}`);
      return fullName.includes(term) || reversedName.includes(term);
    });
  });
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

  goToPage(pageNumber: number): void {
    this.page.set(pageNumber - 1);
    this.loadPage();
  }

  removeUser(id: number): void {
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
