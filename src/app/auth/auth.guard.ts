import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const auth = inject(AuthService);
  const router = inject(Router);

  // On server, allow and enforce on client to avoid SSR crashes
  if (!isPlatformBrowser(platformId)) return true;

  if (auth.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};
