import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { JwtService } from '../Services/jwt.service';
import { AdminService } from '../Services/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  
  // Reactive Forms
  agentForm: FormGroup;
  updateForm: FormGroup;
  policyForm: FormGroup;
  searchForm: FormGroup;

  constructor(
    private jwtService: JwtService, 
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      contactInfo: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      gender: ['male', Validators.required],
      aadharnumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      orgEmail: ['', [Validators.required, Validators.email]]
    });

    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      contactInfo: ['', [Validators.required, Validators.email]],
      gender: ['male', Validators.required],
      date: ['', Validators.required],
      aadharnumber: ['', [Validators.required, Validators.pattern('^[0-9]{12}$')]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      address: ['', Validators.required],
      orgEmail: ['', [Validators.required, Validators.email]]
    });

    this.policyForm = this.fb.group({
      name: ['', Validators.required],
      policyType: ['', Validators.required],
      premiumAmount: ['', [Validators.required, Validators.min(1)]],
      coverageamount: ['', [Validators.required, Validators.min(1)]],
      coverageDetails: ['', Validators.required]
    });

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

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
    if (this.agentForm.invalid) {
      this.showNotificationMessage('Please fill all required fields correctly', 'error');
      this.agentForm.markAllAsTouched();
      return;
    }

    const formValue = this.agentForm.value;
    
    // Check for duplicate contact info
    const existingContactInfo = this.agents().find(agent => 
      agent.contactInfo === formValue.contactInfo || agent.email === formValue.contactInfo
    );
    
    if (existingContactInfo) {
      this.showNotificationMessage('Contact info already exists', 'error');
      return;
    }
    
    // Check for duplicate organizational email
    const existingOrgEmail = this.agents().find(agent => 
      agent.orgEmail === formValue.orgEmail
    );
    
    if (existingOrgEmail) {
      this.showNotificationMessage('Organisational Email already exists', 'error');
      return;
    }
    
    const agentData = {
      ...formValue,
      role: 'AGENT',
      date: new Date().toISOString()
    };
    
    this.adminService.createAgent(agentData).subscribe({
      next: () => {
        this.showNotificationMessage('Agent created successfully!', 'success');
        this.adminService.getAllAgents().subscribe({
          next: data => this.agents.set(data || []),
          error: () => this.agents.set([])
        });
        this.showAgentForm.set(false);
        this.agentForm.reset();
      },
      error: (error) => {
        console.error('Create agent error:', error);
        this.showNotificationMessage('Failed to create agent', 'error');
      }
    });
  }

  openUpdateForm(agent: any) {
    this.selectedAgent.set(agent);
    this.updateForm.patchValue({
      name: agent.name || '',
      contactInfo: agent.contactInfo || agent.email || '',
      gender: agent.gender || 'male',
      date: agent.date || '',
      aadharnumber: agent.aadharnumber || '',
      phone: agent.phone || '',
      address: agent.address || '',
      orgEmail: agent.orgEmail || ''
    });
    this.showUpdateForm.set(true);
  }

  updateAgent() {
    if (this.updateForm.invalid) {
      this.showNotificationMessage('Please fill all required fields correctly', 'error');
      this.updateForm.markAllAsTouched();
      return;
    }

    const agentId = this.selectedAgent()?.agentId || this.selectedAgent()?.id;
    if (!agentId) {
      this.showNotificationMessage('Agent ID not found', 'error');
      return;
    }

    this.adminService.updateAgent(agentId, this.updateForm.value).subscribe({
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



  // Policy methods
  togglePolicyForm() {
    this.showPolicyForm.set(!this.showPolicyForm());
  }

  createPolicy() {
    if (this.policyForm.invalid) {
      this.showNotificationMessage('Please fill all required fields correctly', 'error');
      this.policyForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.policyForm.value;
    const policyData = {
      name: formValue.name,
      policyType: formValue.policyType,
      premiumAmount: Number(formValue.premiumAmount),
      coverageamount: Number(formValue.coverageamount),
      coverageDetails: formValue.coverageDetails
    };
    
    this.adminService.createPolicyList(policyData).subscribe(() => {
      this.showNotificationMessage('Policy created successfully!', 'success');
      this.adminService.getAllPolicyList().subscribe({
        next: data => this.policies.set(data || []),
        error: () => this.policies.set([])
      });
      this.showPolicyForm.set(false);
      this.policyForm.reset();
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





  getFilteredPolicies() {
    if (!this.selectedPolicyType()) return this.policies();
    return this.policies().filter(policy => 
      (policy.policyType || policy[5] || policy.policy_type || policy.type) === this.selectedPolicyType()
    );
  }

  getFieldError(form: FormGroup, fieldName: string): string {
    const field = form.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
      if (field.errors['pattern']) {
        if (fieldName === 'phone') return 'Enter valid 10-digit phone number';
        if (fieldName === 'aadharnumber') return 'Enter valid 12-digit Aadhaar number';
      }
      if (field.errors['min']) return 'Value must be greater than 0';
    }
    return '';
  }

  getFilteredAgents() {
    const searchValue = this.searchForm.get('searchTerm')?.value || '';
    if (!searchValue) return this.agents();
    return this.agents().filter(agent => 
      agent.name?.toLowerCase().includes(searchValue.toLowerCase())
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
