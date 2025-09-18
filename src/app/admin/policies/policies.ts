import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>Policies Management</h2>
      <button class="create-btn" (click)="toggleForm()">Create Policy</button>
    </div>

    <div *ngIf="showForm()" class="form-container">
      <h3>Create New Policy</h3>
      <form (ngSubmit)="onSubmit()">
        <input [(ngModel)]="form().name" name="name" placeholder="Policy Name" required>
        <textarea [(ngModel)]="form().description" name="description" placeholder="Description" required></textarea>
        <input [(ngModel)]="form().premium" name="premium" type="number" placeholder="Premium" required>
        <input [(ngModel)]="form().coverage" name="coverage" type="number" placeholder="Coverage" required>
        <div class="form-actions">
          <button type="submit">Create Policy</button>
          <button type="button" (click)="toggleForm()">Cancel</button>
        </div>
      </form>
    </div>

    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Premium</th>
            <th>Coverage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let policy of filteredPolicies">
            <td>{{policy.id}}</td>
            <td>{{policy.name}}</td>
            <td>{{policy.description}}</td>
            <td>{{policy.premium}}</td>
            <td>{{policy.coverage}}</td>
            <td>
              <button class="delete-btn" (click)="onDelete(policy.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .create-btn { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
    .form-container { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .form-container form { display: grid; gap: 15px; }
    .form-container input, .form-container textarea { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
    .form-container textarea { min-height: 80px; resize: vertical; }
    .form-actions { display: flex; gap: 10px; }
    .form-actions button { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
    .form-actions button[type="submit"] { background: #007bff; color: white; }
    .form-actions button[type="button"] { background: #6c757d; color: white; }
    .data-table table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    .data-table th { background: #f8f9fa; }
    .delete-btn { background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
  `]
})
export class PoliciesComponent {
  policies = input<any[]>([]);
  searchTerm = input('');
  createPolicy = output<any>();
  deletePolicy = output<number>();

  showForm = signal(false);
  form = signal({ name: '', description: '', premium: null, coverage: null });

  get filteredPolicies() {
    if (!this.searchTerm()) return this.policies();
    return this.policies().filter(policy => 
      ['name', 'description'].some(field => 
        policy[field]?.toString().toLowerCase().includes(this.searchTerm().toLowerCase())
      )
    );
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
  }

  onSubmit() {
    this.createPolicy.emit(this.form());
    this.showForm.set(false);
    this.resetForm();
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this policy?')) {
      this.deletePolicy.emit(id);
    }
  }

  resetForm() {
    this.form.set({ name: '', description: '', premium: null, coverage: null });
  }
}