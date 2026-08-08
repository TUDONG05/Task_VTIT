import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const LOGIN_URL = `${environment.reqresApiUrl}/login`;
const MAX_FAILED_ATTEMPTS = 5;
const SESSION_KEY = 'auth.isAuthenticated';
const TOKEN_KEY = 'auth.token';

export interface LoginResult {
  success: boolean;
  message?: string;
  locked?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly failedAttempts = signal(0);
  readonly isAuthenticated = signal(sessionStorage.getItem(SESSION_KEY) === 'true');

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResult> {
    if (this.failedAttempts() >= MAX_FAILED_ATTEMPTS) {
      return of({ success: false, locked: true, message: 'Bạn đã nhập sai quá 5 lần. Vui lòng thử lại sau.' });
    }

    return this.http.post<{ token: string }>(LOGIN_URL, { email, password }).pipe(
      tap((res) => {
        this.failedAttempts.set(0);
        this.isAuthenticated.set(true);
        sessionStorage.setItem(SESSION_KEY, 'true');
        sessionStorage.setItem(TOKEN_KEY, res.token);
      }),
      map((): LoginResult => ({ success: true })),
      catchError((err: HttpErrorResponse) => {
        this.failedAttempts.update((n) => n + 1);
        const remaining = MAX_FAILED_ATTEMPTS - this.failedAttempts();
        const apiMessage = (err.error as { error?: string } | null)?.error;

        if (remaining <= 0) {
          return of({
            success: false,
            locked: true,
            message: 'Bạn đã nhập sai tài khoản hoặc mật khẩu quá 5 lần. Vui lòng thử lại sau.'
          });
        }

        return of({
          success: false,
          locked: false,
          message: apiMessage
            ? `${apiMessage}. Bạn còn ${remaining} lần thử.`
            : `Tài khoản hoặc mật khẩu không đúng. Bạn còn ${remaining} lần thử.`
        });
      })
    );
  }

  logout(): void {
    this.isAuthenticated.set(false);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  }
}
