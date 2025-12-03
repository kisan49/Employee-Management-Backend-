import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private auth = inject(AuthService);
  private router = inject(Router);
  protected readonly title = signal('employee-ui');
  protected readonly isAuthed = computed(() => this.auth.isAuthenticated());

  logout(){
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
