import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface LoginRequest { email: string; password: string; }
interface RegisterRequest { firstName: string; lastName: string; email: string; password: string; }

const TOKEN_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private readToken(): string | null {
    if (!this.isBrowser()) return null;
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  private writeToken(token: string | null): void {
    if (!this.isBrowser()) return;
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {}
  }

  // Real backend call: POST /api/auth/login -> { token }
  login(body: LoginRequest): Observable<boolean> {
    if (!body.email || !body.password) return of(false);
    return this.http.post<{ token: string }>('http://localhost:8080/api/auth/login', body).pipe(
      map(res => {
        if (res && res.token) {
          this.writeToken(res.token);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  // Real backend call: POST /api/auth/register
  register(body: RegisterRequest): Observable<boolean> {
    if (!body.email || !body.password || !body.firstName || !body.lastName) return of(false);
    return this.http.post<void>('http://localhost:8080/api/auth/register', body).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  logout(): void {
    this.writeToken(null);
  }

  get token(): string | null {
    return this.readToken();
  }

  isAuthenticated(): boolean {
    return !!this.readToken();
  }
}
