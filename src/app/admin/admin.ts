import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtService } from '../Services/jwt.service';
import { AdminService } from '../Services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class Admin implements OnInit {
  activeTab = signal('dashboard');
  searchTerm = signal('');
  adminName = signal('');
  adminInitials = signal('');
  
  // Data
  agents = signal<any[]>([]);
  claims = signal<any[]>([]);
  customers = signal<any[]>([]);
  policies = signal<any[]>([]);
  policyLogs = signal<any[]>([]);
  
  // Filters
  selectedPolicyType = signal('');
  
  // Forms
  showAgentForm = signal(false);
  showPolicyForm = signal(false);
  showUpdateForm = signal(false);
  selectedAgent = signal<any>(null);
  
  // Loading states
  isCreatingAgent = signal(false);
  isCreatingPolicy = signal(false);
  
  // Notifications
  showNotification = signal(false);
  notificationMessage = signal('');
  notificationType = signal<'success' | 'error'>('success');
  

  agentForm = signal({
    name: '', contactInfo: '', password: '', gender: 'male',
    aadharnumber: null, phone: null, address: '', role: 'AGENT', orgEmail: ''
  });
  updateForm = signal({
    name: '', contactInfo: '', gender: 'male', date: '',
    aadharnumber: null, phone: null, address: '', orgEmail: ''
  });
  policyForm = signal({
    name: '', policyType: '', premiumAmount: null, coverageamount: null, coverageDetails: ''
  });

  constructor(private jwtService: JwtService, private adminService: AdminService) {}

  ngOnInit() {
    this.loadUserData();
    this.loadData();

  }

  loadUserData() {
    const name = this.jwtService.getUserName();
    if (name) {
      this.adminName.set(name);
      this.adminInitials.set(this.jwtService.getInitials(name));
    }
  }

  loadData() {
    this.adminService.getAllAgents().subscribe({
      next: data => this.agents.set(data || []),
      error: () => this.agents.set([])
    });
    
    this.adminService.getAllClaims().subscribe({
      next: data => this.claims.set(data || []),
      error: () => this.claims.set([])
    });
    
    this.adminService.getAllCustomers().subscribe({
      next: data => this.customers.set(data || []),
      error: () => this.customers.set([])
    });
    
    this.adminService.getAllPolicyList().subscribe({
      next: data => this.policies.set(data || []),
      error: () => this.policies.set([])
    });
    
    this.adminService.getAllPolicies().subscribe({
      next: data => this.policyLogs.set(data || []),
      error: () => this.policyLogs.set([])
    });
  }

  setActiveTab(tab: string) {
    this.activeTab.set(tab);
  }

  logout() {
    this.jwtService.logout();
  }

  // Agent functions
  toggleAgentForm() {
    this.showAgentForm.set(!this.showAgentForm());
  }

  createAgent() {
    const form = this.agentForm();
    
    // Check for duplicate contact info
    const existingContactInfo = this.agents().find(agent => 
      agent.contactInfo === form.contactInfo || agent.email === form.contactInfo
    );
    
    if (existingContactInfo) {
      this.showNotificationMessage('Contact info already exists', 'error');
      return;
    }
    
    // Check for duplicate organizational email
    const existingOrgEmail = this.agents().find(agent => 
      agent.orgEmail === form.orgEmail
    );
    
    if (existingOrgEmail) {
      this.showNotificationMessage('Organisational Email already exists', 'error');
      return;
    }
    
    const agentData = {
      ...form,
      date: new Date().toISOString()
    };
    
    this.adminService.createAgent(agentData).subscribe({
      next: () => {
        this.showNotificationMessage('Agent created successfully!', 'success');
        // Only reload agents data for faster response
        this.adminService.getAllAgents().subscribe({
          next: data => this.agents.set(data || []),
          error: () => this.agents.set([])
        });
        this.showAgentForm.set(false);
        this.resetAgentForm();
      },
      error: (error) => {
        console.error('Create agent error:', error);
        this.showNotificationMessage('Failed to create agent', 'error');
      }
    });
  }

  openUpdateForm(agent: any) {
    this.selectedAgent.set(agent);
    this.updateForm.set({
      name: agent.name || '',
      contactInfo: agent.contactInfo || agent.email || '',
      gender: agent.gender || 'male',
      date: agent.date || '',
      aadharnumber: agent.aadharnumber || null,
      phone: agent.phone || null,
      address: agent.address || '',
      orgEmail: agent.orgEmail || ''
    });
    this.showUpdateForm.set(true);
  }

  updateAgent() {
    const agentId = this.selectedAgent()?.agentId || this.selectedAgent()?.id;
    if (!agentId) {
      this.showNotificationMessage('Agent ID not found', 'error');
      return;
    }

    this.adminService.updateAgent(agentId, this.updateForm()).subscribe({
      next: () => {
        this.showNotificationMessage('Agent updated successfully!', 'success');
        this.adminService.getAllAgents().subscribe({
          next: data => this.agents.set(data || []),
          error: () => this.agents.set([])
        });
        this.closeUpdateForm();
      },
      error: (error) => {
        console.error('Update error:', error);
        this.showNotificationMessage('Failed to update agent', 'error');
      }
    });
  }

  closeUpdateForm() {
    this.showUpdateForm.set(false);
    this.selectedAgent.set(null);
  }

  resetAgentForm() {
    this.agentForm.set({
      name: '', contactInfo: '', password: '', gender: 'male',
      aadharnumber: null, phone: null, address: '', role: 'AGENT', orgEmail: ''
    });
  }

  // Policy methods
  togglePolicyForm() {
    this.showPolicyForm.set(!this.showPolicyForm());
  }

  createPolicy() {
    const form = this.policyForm();
    
    // Validation
    if (!form.name || !form.policyType || !form.premiumAmount || !form.coverageamount || !form.coverageDetails) {
      this.showNotificationMessage('Please fill all required fields', 'error');
      return;
    }
    
    // Convert to exact backend format
    const policyData = {
      name: form.name,
      policyType: form.policyType,
      premiumAmount: Number(form.premiumAmount),
      coverageamount: Number(form.coverageamount),
      coverageDetails: form.coverageDetails
    };
    
    this.adminService.createPolicyList(policyData).subscribe(() => {
      this.showNotificationMessage('Policy created successfully!', 'success');
      // Only reload policies data for faster response
      this.adminService.getAllPolicyList().subscribe({
        next: data => this.policies.set(data || []),
        error: () => this.policies.set([])
      });
      this.showPolicyForm.set(false);
      this.resetPolicyForm();
    });
  }

  deletePolicy(id: any) {
    const policyId = id || 'unknown';
    if (confirm(`Delete policy ${policyId}?`)) {
      if (!id) {
        alert('Policy ID is missing');
        return;
      }
      this.adminService.deletePolicyList(id).subscribe(() => {
        // Only reload policies data for faster response
        this.adminService.getAllPolicyList().subscribe({
          next: data => this.policies.set(data || []),
          error: () => this.policies.set([])
        });
      });
    }
  }

  resetPolicyForm() {
    this.policyForm.set({
      name: '', policyType: '', premiumAmount: null, coverageamount: null, coverageDetails: ''
    });
  }

  updatePolicyForm(field: string, value: any) {
    let processedValue = value;
    
    // Convert numeric fields to numbers
    if (field === 'premiumAmount' || field === 'coverageamount') {
      processedValue = value ? Number(value) : null;
    }
    
    this.policyForm.update(form => ({ ...form, [field]: processedValue }));
  }

  getFilteredPolicies() {
    if (!this.selectedPolicyType()) return this.policies();
    return this.policies().filter(policy => 
      (policy.policyType || policy[5] || policy.policy_type || policy.type) === this.selectedPolicyType()
    );
  }

  updateAgentForm(field: string, value: any) {
    this.agentForm.update(form => ({ ...form, [field]: value }));
  }

  updateFormField(field: string, value: any) {
    this.updateForm.update(form => ({ ...form, [field]: value }));
  }

  onUpdateInputChange(event: Event, field: string) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.updateFormField(field, target.value);
  }

  onInputChange(event: Event, field: string) {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    this.updateAgentForm(field, target.value);
  }

  getFilteredAgents() {
    if (!this.searchTerm()) return this.agents();
    return this.agents().filter(agent => 
      agent.name?.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  }

  getFormattedDate(log: any): string {
    // Check all possible date fields
    const date = log.createdDate || log.date || log.updatedDate || log.created_at || log.timestamp || log.policyDate || log.startDate || log.endDate || log.issueDate;
    
    if (!date) {
      // If no date found, return current date as fallback
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  }
  
  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage.set(message);
    this.notificationType.set(type);
    this.showNotification.set(true);
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      this.showNotification.set(false);
    }, 3000);
  }
  

}
