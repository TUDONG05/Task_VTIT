import { Injectable, signal } from '@angular/core';

const DEMO_ACCOUNT = { email: 'admin@gmail.com', password: 'Admin@123' };
const MAX_FAILED_ATTEMPTS = 5;
const SESSION_KEY = 'auth.isAuthenticated';

export interface LoginResult {
  success: boolean;
  message?: string;
  locked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly failedAttempts = signal(0);
  readonly isAuthenticated = signal(sessionStorage.getItem(SESSION_KEY) === 'true');

  login(email: string, password: string): LoginResult {
    if (this.failedAttempts() >= MAX_FAILED_ATTEMPTS) {
      return { success: false, locked: true, message: 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau.' };
    }

    if (email === DEMO_ACCOUNT.email && password === DEMO_ACCOUNT.password) {
      this.failedAttempts.set(0);
      this.isAuthenticated.set(true);
      sessionStorage.setItem(SESSION_KEY, 'true');
      return { success: true };
    }

    this.failedAttempts.update((n) => n + 1);
    const remaining = MAX_FAILED_ATTEMPTS - this.failedAttempts();

    if (remaining <= 0) {
      return {
        success: false,
        locked: true,
        message: 'Bạn đã nhập sai tài khoản hoặc mật khẩu quá 5 lần. Vui lòng thử lại sau.'
      };
    }

    return {
      success: false,
      locked: false,
      message: `Tài khoản hoặc mật khẩu không đúng. Bạn còn ${remaining} lần thử.`
    };
  }

  logout(): void {
    this.isAuthenticated.set(false);
    sessionStorage.removeItem(SESSION_KEY);
  }
}
