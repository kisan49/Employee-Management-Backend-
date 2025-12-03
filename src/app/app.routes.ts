import { Routes } from '@angular/router';
import { EmployeeListComponent } from './employees/employee-list.component';
import { EmployeeFormComponent } from './employees/employee-form.component';
import { LoginComponent } from './auth/login.component';
import { RegisterComponent } from './auth/register.component';
import { LogoutComponent } from './auth/logout.component';
import { authGuard } from './auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'employees' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  { path: 'employees/new', component: EmployeeFormComponent, canActivate: [authGuard] },
  { path: 'employees/:id/edit', component: EmployeeFormComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'employees' }
];
