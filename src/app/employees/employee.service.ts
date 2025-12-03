import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from './employee.model';

function getApiBase(platformId: Object): string {
  try {
    if (isPlatformBrowser(platformId) && typeof window !== 'undefined' && (window as any).__API_BASE_URL__) {
      return (window as any).__API_BASE_URL__ as string;
    }
  } catch {}
  return 'http://localhost:8080';
}

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private readonly EMPLOYEES_URL = `${getApiBase(this.platformId)}/api/employees`;

  getAll(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.EMPLOYEES_URL);
  }

  getById(id: number): Observable<Employee> {
    return this.http.get<Employee>(`${this.EMPLOYEES_URL}/${id}`);
  }

  create(emp: Employee): Observable<Employee> {
    return this.http.post<Employee>(this.EMPLOYEES_URL, emp);
  }

  update(id: number, emp: Employee): Observable<Employee> {
    return this.http.put<Employee>(`${this.EMPLOYEES_URL}/${id}`, emp);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.EMPLOYEES_URL}/${id}`);
  }
}
