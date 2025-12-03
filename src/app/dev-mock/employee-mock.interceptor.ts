import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Employee } from '../employees/employee.model';

// Simple in-memory store for development
let EMPLOYEES: Employee[] = [
  { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', position: 'Developer', salary: 80000 },
  { id: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', position: 'Designer', salary: 70000 },
  { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', position: 'QA', salary: 65000 }
];
let nextId = 4;

@Injectable()
export class EmployeeMockInterceptor implements HttpInterceptor {
  private readonly apiBase = '/api/employees';
  private readonly latency = 0; // ms

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Normalize to pathname so both absolute and relative URLs are matched in SSR and browser
    let pathname: string;
    try {
      const u = new URL(req.url, 'http://localhost');
      pathname = u.pathname;
    } catch {
      pathname = req.url;
    }

    const isCollection = pathname === '/api/employees';
    const idMatch = pathname.match(/^\/api\/employees\/(\d+)$/);

    if (!isCollection && !idMatch) {
      return next.handle(req);
    }

    const { method } = req;

    // Route handling
    if (method === 'GET' && isCollection) {
      return of(new HttpResponse({ status: 200, body: EMPLOYEES.slice() }));
    }

    if (method === 'GET' && idMatch) {
      const id = Number(idMatch[1]);
      const found = EMPLOYEES.find(e => e.id === id);
      return of(new HttpResponse({ status: found ? 200 : 404, body: found ?? null }));
    }

    if (method === 'POST' && isCollection) {
      const body: Employee = req.body;
      const newEmp: Employee = { ...body, id: nextId++ };
      EMPLOYEES.push(newEmp);
      return of(new HttpResponse({ status: 201, body: newEmp }));
    }

    if (method === 'PUT' && idMatch) {
      const id = Number(idMatch[1]);
      const idx = EMPLOYEES.findIndex(e => e.id === id);
      if (idx === -1) {
        return of(new HttpResponse({ status: 404 }));
      }
      const updated: Employee = { ...req.body, id };
      EMPLOYEES[idx] = updated;
      return of(new HttpResponse({ status: 200, body: updated }));
    }

    if (method === 'DELETE' && idMatch) {
      const id = Number(idMatch[1]);
      EMPLOYEES = EMPLOYEES.filter(e => e.id !== id);
      return of(new HttpResponse({ status: 204 }));
    }

    // Fallback to real backend for non-mocked paths
    return next.handle(req);
  }
}
