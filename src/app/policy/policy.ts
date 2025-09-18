import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface PolicyModel {
  policyId?: number;
  name: string;
  premiumAmount: number;
  coverageDetails: string;
  validityPeriod: number;
  customerId: number;
  agentId: number;
  entryDate?: Date;
  expiryDate?: Date;
}

export interface PolicyAgent {
  policyId: number;
  agentId: number;
  agentName: string;
  agentEmail: string;
}

export interface Customer {
  customerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

@Component({
  selector: 'app-policy',
  imports: [CommonModule, FormsModule],
  templateUrl: './policy.html',
  styleUrl: './policy.css'
})
export class Policy {
  private apiUrl = 'http://localhost:8763/api/policies';
  
  constructor(private router: Router, private http: HttpClient) {
    this.loadPolicies();
  }

  policies: PolicyModel[] = [];
  
  samplePolicies: PolicyModel[] = [
    {
      policyId: 1,
      name: 'Health Insurance Premium',
      premiumAmount: 25000,
      coverageDetails: 'Comprehensive health coverage including hospitalization, surgery, and critical illness',
      validityPeriod: 1,
      customerId: 101,
      agentId: 201,
      entryDate: new Date('2024-01-15'),
      expiryDate: new Date('2025-01-15')
    },
    {
      policyId: 2,
      name: 'Life Insurance Policy',
      premiumAmount: 50000,
      coverageDetails: 'Term life insurance with accidental death benefit and disability coverage',
      validityPeriod: 20,
      customerId: 102,
      agentId: 202,
      entryDate: new Date('2024-02-01'),
      expiryDate: new Date('2044-02-01')
    },
    {
      policyId: 3,
      name: 'Auto Insurance Coverage',
      premiumAmount: 15000,
      coverageDetails: 'Comprehensive auto insurance with collision, theft, and third-party liability',
      validityPeriod: 1,
      customerId: 103,
      agentId: 203,
      entryDate: new Date('2024-03-10'),
      expiryDate: new Date('2025-03-10')
    }
  ];

  loadPolicies() {
    this.http.get<PolicyModel[]>(`${this.apiUrl}`).subscribe({
      next: (data) => this.policies = data,
      error: () => this.policies = this.samplePolicies
    });
  }

  newPolicy: PolicyModel = {
    name: '',
    premiumAmount: 0,
    coverageDetails: '',
    validityPeriod: 1,
    customerId: 0,
    agentId: 0
  };

  showAddForm = false;
  showEditForm = false;
  editingPolicy: PolicyModel | null = null;
  searchValue = '';
  searchType = 'customer';
  expandedCards: Set<number> = new Set();
  cardDetails: { [key: number]: { customerName: string, agentName: string } } = {};

  toggleAddForm() {
    this.showAddForm = !this.showAddForm;
    this.showEditForm = false;
  }

  toggleEditForm(policy: PolicyModel) {
    this.editingPolicy = { ...policy };
    this.showEditForm = true;
    this.showAddForm = false;
  }

  addPolicy() {
    console.log('Form submitted:', this.newPolicy);
    if (this.newPolicy.name && this.newPolicy.premiumAmount > 0 && this.newPolicy.customerId > 0 && this.newPolicy.agentId > 0) {
      console.log('Sending to API:', this.newPolicy);
      
      const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      };
      
      this.http.post<PolicyModel>(`${this.apiUrl}/create`, this.newPolicy, { headers }).subscribe({
        next: (createdPolicy) => {
          console.log('Policy created:', createdPolicy);
          this.policies.push(createdPolicy);
          this.resetForm();
        },
        error: (error) => {
          console.error('API Error:', error);
          // Fallback: Add locally if API fails
          const localPolicy: PolicyModel = {
            ...this.newPolicy,
            policyId: this.policies.length + 1,
            entryDate: new Date(),
            expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + this.newPolicy.validityPeriod))
          };
          this.policies.push(localPolicy);
          this.resetForm();
          alert('API unavailable. Policy added locally.');
        }
      });
    } else {
      alert('Please fill all required fields');
    }
  }

  resetForm() {
    this.newPolicy = {
      name: '',
      premiumAmount: 0,
      coverageDetails: '',
      validityPeriod: 1,
      customerId: 0,
      agentId: 0
    };
    this.showAddForm = false;
  }

  deletePolicy(policyId: number) {
    this.http.delete(`${this.apiUrl}/${policyId}`).subscribe({
      next: () => {
        this.policies = this.policies.filter(p => p.policyId !== policyId);
      },
      error: () => {
        this.policies = this.policies.filter(p => p.policyId !== policyId);
      }
    });
  }

  updatePolicy() {
    if (this.editingPolicy && this.editingPolicy.policyId) {
      this.http.put<PolicyModel>(`${this.apiUrl}/${this.editingPolicy.policyId}`, this.editingPolicy).subscribe({
        next: (updatedPolicy) => {
          const index = this.policies.findIndex(p => p.policyId === updatedPolicy.policyId);
          if (index !== -1) {
            this.policies[index] = updatedPolicy;
          }
          this.cancelEdit();
        },
        error: () => {
          const index = this.policies.findIndex(p => p.policyId === this.editingPolicy!.policyId);
          if (index !== -1) {
            this.policies[index] = this.editingPolicy!;
          }
          this.cancelEdit();
        }
      });
    }
  }

  cancelEdit() {
    this.showEditForm = false;
    this.editingPolicy = null;
  }

  search() {
    if (!this.searchValue) return;
    
    let endpoint = '';
    if (this.searchType === 'customer') {
      endpoint = `${this.apiUrl}/getCustomerPolicyDetails/${this.searchValue}`;
    } else if (this.searchType === 'agent') {
      endpoint = `${this.apiUrl}/agentAll/${this.searchValue}`;
    } else if (this.searchType === 'policy') {
      endpoint = `${this.apiUrl}/${this.searchValue}`;
    }
    
    if (this.searchType === 'policy') {
      this.http.get<PolicyModel>(endpoint).subscribe({
        next: (data) => this.policies = [data],
        error: () => this.policies = []
      });
    } else {
      this.http.get<PolicyModel[]>(endpoint).subscribe({
        next: (data) => this.policies = data,
        error: () => this.policies = []
      });
    }
  }

  toggleCardDetails(policyId: number) {
    if (this.expandedCards.has(policyId)) {
      this.expandedCards.delete(policyId);
    } else {
      this.expandedCards.add(policyId);
      if (!this.cardDetails[policyId]) {
        this.loadCardDetails(policyId);
      }
    }
  }

  loadCardDetails(policyId: number) {
    // Load both customer and agent details
    Promise.all([
      this.http.get<Customer>(`${this.apiUrl}/getCustomerDetails/${policyId}`).toPromise().catch(() => ({ customerName: 'N/A' })),
      this.http.get<PolicyAgent>(`${this.apiUrl}/getAgentDetails/${policyId}`).toPromise().catch(() => ({ agentName: 'N/A' }))
    ]).then(([customer, agent]) => {
      this.cardDetails[policyId] = {
        customerName: (customer as any)?.customerName || 'N/A',
        agentName: (agent as any)?.agentName || 'N/A'
      };
    });
  }

  isCardExpanded(policyId: number): boolean {
    return this.expandedCards.has(policyId);
  }

  navigateToHome() {
    this.router.navigate(['/home']);
  }
}
