import { Component, effect, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  template: `
  <div class="container">
    <h2>Employees</h2>
    <div class="toolbar">
      <a class="btn" [routerLink]="['/employees','new']">+ New Employee</a>
    </div>

    <table class="table" *ngIf="employees().length; else empty">
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Email</th>
          <th>Position</th>
          <th>Salary</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let e of employees(); let i = index">
          <td>{{ i + 1 }}</td>
          <td>{{ e.firstName }}</td>
          <td>{{ e.lastName }}</td>
          <td>{{ e.email }}</td>
          <td>{{ e.position }}</td>
          <td>{{ e.salary | currency }}</td>
          <td class="actions">
            <a [routerLink]="['/employees', e.id, 'edit']">Edit</a>
            <button (click)="remove(e)" class="link danger">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>

    <ng-template #empty>
      <p>No employees yet.</p>
    </ng-template>
  </div>
  `,
  styles: [`
    .container{ max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
    .toolbar{ margin: 1rem 0; }
    .btn{ padding: .5rem .75rem; border: 1px solid #444; border-radius: 4px; text-decoration: none; }
    .table{ width: 100%; border-collapse: collapse; }
    th, td{ border-bottom: 1px solid #eee; padding: .5rem; text-align: left; }
    .actions{ display: flex; gap: .5rem; }
    .link{ background: none; border: none; color: #1976d2; cursor: pointer; }
    .danger{ color: #d32f2f; }
  `]
})
export class EmployeeListComponent {
  private service = inject(EmployeeService);
  private router = inject(Router);

  readonly employees = signal<Employee[]>([]);

  constructor(){
    this.load();
  }

  load(){
    this.service.getAll().subscribe(data => this.employees.set(data));
  }

  remove(e: Employee){
    if(!e.id) return;
    if(confirm(`Delete ${e.firstName} ${e.lastName}?`)){
      this.service.delete(e.id).subscribe(() => this.load());
    }
  }
}
