import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-header">
      <h2>Customers</h2>
    </div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Address</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let customer of filteredCustomers">
            <td>{{customer.customerId || customer.id}}</td>
            <td>{{customer.name}}</td>
            <td>{{customer.email}}</td>
            <td>{{customer.phone}}</td>
            <td>{{customer.address}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .section-header { margin-bottom: 20px; }
    .data-table table { width: 100%; border-collapse: collapse; }
    .data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    .data-table th { background: #f8f9fa; }
  `]
})
export class CustomersComponent {
  customers = input<any[]>([]);
  searchTerm = input('');

  get filteredCustomers() {
    if (!this.searchTerm()) return this.customers();
    return this.customers().filter(customer => 
      ['name', 'email', 'phone'].some(field => 
        customer[field]?.toString().toLowerCase().includes(this.searchTerm().toLowerCase())
      )
    );
  }
}