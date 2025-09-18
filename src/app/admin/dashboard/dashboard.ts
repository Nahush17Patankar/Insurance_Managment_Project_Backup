import { Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Agents</h3>
        <p>{{agentsCount()}}</p>
      </div>
      <div class="stat-card">
        <h3>Total Policies</h3>
        <p>{{policiesCount()}}</p>
      </div>
      <div class="stat-card">
        <h3>Total Claims</h3>
        <p>{{claimsCount()}}</p>
      </div>
      <div class="stat-card">
        <h3>Total Customers</h3>
        <p>{{customersCount()}}</p>
      </div>
    </div>
  `,
  styles: `
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }
    .stat-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e0e0e0;
    }
    .stat-card h3 {
      margin: 0 0 10px 0;
      color: #666;
      font-size: 14px;
    }
    .stat-card p {
      margin: 0;
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
  `
})
export class DashboardComponent {
  agentsCount = input(0);
  policiesCount = input(0);
  claimsCount = input(0);
  customersCount = input(0);
}