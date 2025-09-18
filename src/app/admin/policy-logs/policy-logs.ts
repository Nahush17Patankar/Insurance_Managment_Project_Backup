import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-policy-logs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-header">
      <h2>Policy Logs</h2>
    </div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Policy ID</th>
            <th>Customer ID</th>
            <th>Agent ID</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of filteredLogs">
            <td>{{log.policyId}}</td>
            <td>{{log.customerId}}</td>
            <td>{{log.agentId}}</td>
            <td>{{log.status}}</td>
            <td>{{log.date | date}}</td>
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
export class PolicyLogsComponent {
  policyLogs = input<any[]>([]);
  searchTerm = input('');

  get filteredLogs() {
    if (!this.searchTerm()) return this.policyLogs();
    return this.policyLogs().filter(log => 
      ['policyId', 'customerId', 'status'].some(field => 
        log[field]?.toString().toLowerCase().includes(this.searchTerm().toLowerCase())
      )
    );
  }
}