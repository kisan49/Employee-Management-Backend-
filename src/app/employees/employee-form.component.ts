import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { EmployeeService } from './employee.service';
import { Employee } from './employee.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="container">
    <h2>{{ isEdit() ? 'Edit' : 'New' }} Employee</h2>

    <form (ngSubmit)="save()" #f="ngForm">
      <div class="grid">
        <label>First Name<input name="firstName" [(ngModel)]="model.firstName" required /></label>
        <label>Last Name<input name="lastName" [(ngModel)]="model.lastName" required /></label>
        <label>Email<input name="email" type="email" [(ngModel)]="model.email" required /></label>
        <label>Position<input name="position" [(ngModel)]="model.position" required /></label>
        <label>Salary<input name="salary" type="number" [(ngModel)]="model.salary" required min="0" /></label>
      </div>

      <div class="actions">
        <button type="submit" [disabled]="f.invalid">Save</button>
        <a [routerLink]="['/employees']">Cancel</a>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .container{ max-width: 700px; margin: 2rem auto; padding: 0 1rem; }
    form{ display: flex; flex-direction: column; gap: 1rem; }
    .grid{ display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: .75rem; }
    label{ display: flex; flex-direction: column; gap: .25rem; }
    input{ padding: .5rem; border: 1px solid #ccc; border-radius: 4px; }
    .actions{ display: flex; gap: .75rem; }
    button{ padding: .5rem .75rem; }
  `]
})
export class EmployeeFormComponent {
  private service = inject(EmployeeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  id?: number;
  model: Employee = { firstName: '', lastName: '', email: '', position: '', salary: 0 };
  readonly isEdit = signal(false);

  constructor(){
    const idParam = this.route.snapshot.paramMap.get('id');
    if(idParam){
      this.id = +idParam;
      this.isEdit.set(true);
      this.service.getById(this.id).subscribe(emp => this.model = emp);
    }
  }

  save(){
    const action = this.isEdit() && this.id
      ? this.service.update(this.id, this.model)
      : this.service.create(this.model);

    action.subscribe(() => this.router.navigate(['/employees']));
  }
}
