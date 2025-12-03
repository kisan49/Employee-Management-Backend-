import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: '<p>Signing out...</p>'
})
export class LogoutComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  constructor(){
    this.auth.logout();
    this.router.navigate(['/login'], { queryParams: { signedOut: 1 } });
  }
}
