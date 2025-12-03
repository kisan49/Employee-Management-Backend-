import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';

interface User { id: number; firstName: string; lastName: string; email: string; password: string; }

let USERS: User[] = [
  { id: 1, firstName: 'Demo', lastName: 'User', email: 'user@example.com', password: 'Password123' },
  { id: 2, firstName: 'Admin', lastName: 'User', email: 'admin@example.com', password: 'Admin!234' }
];
let nextUserId = 3;

@Injectable()
export class AuthMockInterceptor implements HttpInterceptor {
  private readonly latency = 0;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let pathname: string;
    try {
      const u = new URL(req.url, 'http://localhost');
      pathname = u.pathname;
    } catch {
      pathname = req.url;
    }

    // Register
    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const body = req.body as Partial<User>;
      if (!body.email || !body.password || !body.firstName || !body.lastName) {
        return of(new HttpResponse({ status: 400, body: { message: 'Missing fields' } }));
      }
      const exists = USERS.some(u => u.email.toLowerCase() === body.email!.toLowerCase());
      if (exists) {
        return of(new HttpResponse({ status: 409, body: { message: 'Email already registered' } }));
      }
      const user: User = { id: nextUserId++, firstName: body.firstName!, lastName: body.lastName!, email: body.email!, password: body.password! };
      USERS.push(user);
      return of(new HttpResponse({ status: 201 }));
    }

    // Login
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const { email, password } = req.body as { email: string; password: string };
      const found = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (!found) {
        return of(new HttpResponse({ status: 401, body: { message: 'Invalid credentials' } }));
      }
      return of(new HttpResponse({ status: 200, body: { token: 'dev-mock-token' } }));
    }

    return next.handle(req);
  }
}
