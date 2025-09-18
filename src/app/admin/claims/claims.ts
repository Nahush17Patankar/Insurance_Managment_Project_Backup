import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-header">
      <h2>Claims Management</h2>
    </div>
    <div class="data-table">
      <table>
        <thead>
          <tr>
            <th>Claim ID</th>
            <th>Policy ID</th>
            <th>Customer ID</th>
            <th>Agent ID</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let claim of filteredClaims">
            <td>{{claim.claimId}}</td>
            <td>{{claim.policyId}}</td>
            <td>{{claim.customerId}}</td>
            <td>{{claim.agentId}}</td>
            <td>{{claim.claimAmount}}</td>
            <td>{{claim.status}}</td>
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
export class ClaimsComponent {
  claims = input<any[]>([]);
  searchTerm = input('');

  get filteredClaims() {
    if (!this.searchTerm()) return this.claims();
    return this.claims().filter(claim => 
      ['claimId', 'policyId', 'status'].some(field => 
        claim[field]?.toString().toLowerCase().includes(this.searchTerm().toLowerCase())
      )
    );
  }
}