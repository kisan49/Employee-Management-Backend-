import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { EmployeeMockInterceptor } from './dev-mock/employee-mock.interceptor';
import { AuthInterceptor } from './auth/auth.interceptor';
import { DEV_MODE } from './config';
import { AuthMockInterceptor } from './dev-mock/auth-mock.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withInterceptorsFromDi(),
      withFetch()
    ),
    // Conditionally enable mocks in dev mode
    ...(DEV_MODE ? [
      { provide: HTTP_INTERCEPTORS, useClass: AuthMockInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: EmployeeMockInterceptor, multi: true }
    ] : []),
    // Attach token to requests when present
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]
};
