import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { finalize } from 'rxjs';
import { User } from '../../../core/models/user';
import { UserService } from '../../../core/services/user';

@Component({
  selector: 'app-user-detail',
  imports: [
    RouterLink,
    NzAlertModule,
    NzAvatarModule,
    NzButtonModule,
    NzCardModule,
    NzDescriptionsModule,
    NzSpinModule,
  ],
  templateUrl: './user-detail.html',
  styleUrl: './user-detail.scss',
})
export class UserDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

  protected readonly user = signal<User | null>(null);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal('');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id === 0) {
      this.errorMessage.set('Mã người dùng không hợp lệ.');
      return;
    }

    this.isLoading.set(true);
    this.userService
      .fetchOne(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (user) => {
          if (!user) {
            this.errorMessage.set('Không tìm thấy người dùng.');
            return;
          }
          this.user.set(user);
        },
        error: () => {
          this.errorMessage.set('Không tải được thông tin người dùng. Vui lòng thử lại.');
        },
      });
  }
}
