import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Employee } from './employees/employee.model';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  // Note: configure apiBase to '/api/' when registering the module so this
  // dataset responds to the same paths as the backend (e.g., /api/employees)
  createDb(): { employees: Employee[] } {
    const employees: Employee[] = [
      { id: 1, firstName: 'Alice', lastName: 'Johnson', email: 'alice@example.com', position: 'Developer', salary: 80000 },
      { id: 2, firstName: 'Bob', lastName: 'Smith', email: 'bob@example.com', position: 'Designer', salary: 70000 },
      { id: 3, firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com', position: 'QA', salary: 65000 }
    ];
    return { employees };
  }

  // Ensure auto-increment ids for POST when client omits id
  genId(employees: Employee[]): number {
    return employees.length ? Math.max(...employees.map(e => e.id ?? 0)) + 1 : 1;
  }
}
