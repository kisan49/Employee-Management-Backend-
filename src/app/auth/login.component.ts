import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-container">
    <div class="card">
      <h2>Sign in</h2>
      <p class="help" *ngIf="info">{{ info }}</p>
      <form (ngSubmit)="submit()" #f="ngForm">
        <label>
          Email
          <input name="email" [(ngModel)]="email" type="email" required #emailCtrl="ngModel" />
        </label>
        <small class="error" *ngIf="emailCtrl.invalid && emailCtrl.touched">Enter a valid email.</small>

        <label>
          Password
          <input name="password" [(ngModel)]="password" type="password" required minlength="4" #passCtrl="ngModel" />
        </label>
        <small class="error" *ngIf="passCtrl.invalid && passCtrl.touched">Password is required (min 4 characters).</small>

        <button type="submit" [disabled]="f.invalid || loading">{{ loading ? 'Signing in...' : 'Sign in' }}</button>
        <p class="muted">No account? <a routerLink="/register">Create one</a></p>
        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .auth-container{ min-height: 100vh; display:flex; align-items:center; justify-content:center; background: #f6f7fb; padding: 1rem; }
    .card{ width: 100%; max-width: 400px; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.08); padding:2rem; }
    h2{ margin:0 0 1rem; }
    form{ display:flex; flex-direction:column; gap:.75rem; }
    label{ display:flex; flex-direction:column; gap:.25rem; font-size:.9rem; }
    input{ padding:.6rem .75rem; border:1px solid #d6d8e1; border-radius:8px; }
    button{ margin-top:.5rem; padding:.6rem .75rem; border:none; border-radius:8px; background:#1976d2; color:#fff; cursor:pointer; }
    button[disabled]{ opacity:.6; cursor:not-allowed; }
    .muted{ color:#6b7280; font-size:.85rem; }
    .error{ color:#d32f2f; font-size:.85rem; }
  `]
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = false;
  error = '';
  info = '';

  constructor(){
    this.route.queryParamMap.subscribe(q => {
      if (q.get('signedOut') === '1') this.info = 'You have been signed out.';
      if (q.get('registered') === '1') this.info = 'Account created. Please sign in.';
    });
  }

  submit(){
    this.error = '';
    this.loading = true;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: ok => {
        if (ok) this.router.navigate(['/employees']);
        else this.error = 'Invalid credentials';
      },
      error: () => this.error = 'Unable to sign in. Please try again.',
      complete: () => this.loading = false
    });
  }
}
