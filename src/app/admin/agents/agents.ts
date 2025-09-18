import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>Agents Management</h2>
      <button class="create-btn" (click)="toggleForm()">Create Agent</button>
    </div>

    <div *ngIf="showForm()" class="form-container">
      <h3>Create New Agent</h3>
      <form (ngSubmit)="onSubmit()">
        <input [(ngModel)]="form().name" name="name" placeholder="Name" required>
        <input [(ngModel)]="form().contactInfo" name="contactInfo" placeholder="Contact Email" required>
        <input [(ngModel)]="form().password" name="password" type="password" placeholder="Password" required>
        <select [(ngModel)]="form().gender" name="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <input [(ngModel)]="form().date" name="date" type="datetime-local" required>
        <input [(ngModel)]="form().aadharnumber" name="aadharnumber" type="number" placeholder="Aadhar Number" required>
        <input [(ngModel)]="form().phone" name="phone" type="number" placeholder="Phone" required>
        <input [(ngModel)]="form().address" name="address" placeholder="Address" required>
        <input [(ngModel)]="form().orgEmail" name="orgEmail" placeholder="Organization Email" required>
        <div class="form-actions">
          <button type="submit">Create Agent</button>
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
            <th>Email</th>
            <th>Phone</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let agent of filteredAgents">
            <td>{{agent.agentId || agent.id}}</td>
            <td>{{agent.name}}</td>
            <td>{{agent.contactInfo || agent.email}}</td>
            <td>{{agent.phone}}</td>
            <td>
              <button class="delete-btn" (click)="onDelete(agent.agentId || agent.id)">Delete</button>
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
    .form-container input, .form-container select { padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
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
export class AgentsComponent {
  agents = input<any[]>([]);
  searchTerm = input('');
  createAgent = output<any>();
  deleteAgent = output<number>();

  showForm = signal(false);
  form = signal({
    name: '', contactInfo: '', password: '', gender: 'male', date: '',
    aadharnumber: null, phone: null, address: '', role: 'AGENT', orgEmail: ''
  });

  get filteredAgents() {
    if (!this.searchTerm()) return this.agents();
    return this.agents().filter(agent => 
      ['name', 'contactInfo', 'phone'].some(field => 
        agent[field]?.toString().toLowerCase().includes(this.searchTerm().toLowerCase())
      )
    );
  }

  toggleForm() {
    this.showForm.set(!this.showForm());
  }

  onSubmit() {
    this.createAgent.emit(this.form());
    this.showForm.set(false);
    this.resetForm();
  }

  onDelete(id: number) {
    if (confirm('Are you sure you want to delete this agent?')) {
      this.deleteAgent.emit(id);
    }
  }

  resetForm() {
    this.form.set({
      name: '', contactInfo: '', password: '', gender: 'male', date: '',
      aadharnumber: null, phone: null, address: '', role: 'AGENT', orgEmail: ''
    });
  }
}