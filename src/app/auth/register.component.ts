import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-container">
    <div class="card">
      <h2>Create account</h2>
      <form (ngSubmit)="submit()" #f="ngForm">
        <div class="grid">
          <label>First name<input name="firstName" [(ngModel)]="firstName" required /></label>
          <label>Last name<input name="lastName" [(ngModel)]="lastName" required /></label>
        </div>

        <label>
          Email
          <input name="email" type="email" [(ngModel)]="email" required #emailCtrl="ngModel" />
        </label>
        <small class="error" *ngIf="emailCtrl.invalid && emailCtrl.touched">Enter a valid email.</small>

        <div class="grid">
          <label>
            Password
            <input name="password" type="password" [(ngModel)]="password" required minlength="6" #passCtrl="ngModel" />
          </label>
          <label>
            Confirm
            <input name="confirm" type="password" [(ngModel)]="confirm" required minlength="6" #confirmCtrl="ngModel" />
          </label>
        </div>
        <small class="help">Use at least 6 characters.</small>
        <small class="error" *ngIf="passCtrl.invalid && passCtrl.touched">Password must be at least 6 characters.</small>
        <small class="error" *ngIf="confirmCtrl.invalid && confirmCtrl.touched">Confirm must be at least 6 characters.</small>
        <p class="error" *ngIf="password && confirm && password !== confirm">Passwords do not match</p>

        <button type="submit" [disabled]="loading">{{ loading ? 'Creating...' : 'Create account' }}</button>
        <p class="muted">Already have an account? <a routerLink="/login">Sign in</a></p>
        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .auth-container{ min-height: 100vh; display:flex; align-items:center; justify-content:center; background: #f6f7fb; padding: 1rem; }
    .card{ width: 100%; max-width: 440px; background:#fff; border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.08); padding:2rem; }
    h2{ margin:0 0 1rem; }
    form{ display:flex; flex-direction:column; gap:.75rem; }
    .grid{ display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:.75rem; }
    label{ display:flex; flex-direction:column; gap:.25rem; font-size:.9rem; }
    input{ padding:.6rem .75rem; border:1px solid #d6d8e1; border-radius:8px; }
    button{ margin-top:.5rem; padding:.6rem .75rem; border:none; border-radius:8px; background:#1976d2; color:#fff; cursor:pointer; }
    button[disabled]{ opacity:.6; cursor:not-allowed; }
    .muted{ color:#6b7280; font-size:.85rem; }
    .error{ color:#d32f2f; font-size:.85rem; }
  `]
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirm = '';
  loading = false;
  error = '';

  submit(){
    this.error = '';

    // Prevent double-submit
    if (this.loading) return;

    // Trim and compare passwords to avoid whitespace mismatches
    const pass = (this.password || '').trim();
    const conf = (this.confirm || '').trim();
    if (pass && conf && pass !== conf) {
      this.error = 'Passwords do not match';
      return;
    }

    this.loading = true;
    this.auth.register({ firstName: this.firstName, lastName: this.lastName, email: this.email, password: pass })
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: ok => {
          if (ok) this.router.navigate(['/login'], { queryParams: { registered: 1 } });
          else this.error = 'Registration failed';
        },
        error: (err) => {
          if (err?.status === 409) this.error = 'Email already registered';
          else if (err?.status === 400) this.error = 'Please check your details';
          else this.error = 'Registration failed';
        }
      });
  }
}
