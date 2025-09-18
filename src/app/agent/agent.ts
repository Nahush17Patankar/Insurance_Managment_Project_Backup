import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '../Services/jwt.service';
import { AgentService } from '../Services/agent.service';

@Component({
  selector: 'app-agent',
  imports: [CommonModule],
  templateUrl: './agent.html',
  styleUrl: './agent.css'
})
export class Agent implements OnInit, OnDestroy {
  activeSection = 'claims';
  agentData: any = {};
  claims: any[] = [];
  isLoading = false;
  selectedClaim: any = null;
  showClaimModal = false;
  claimDetails: any = {};
  
  // Notifications
  notifications: any[] = [];
  showNotificationPanel = false;
  notificationInterval: any;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';

  constructor(private router: Router, private jwtService: JwtService, private http: HttpClient, private agentService: AgentService) {}

  ngOnInit() {
    this.loadAgentData();
    this.loadClaims();
    this.startNotificationPolling();
  }
  
  ngOnDestroy() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
  }

  loadAgentData() {
    const token = this.jwtService.getToken();
    console.log('JWT Token:', token);
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Loading agent data...');
    this.http.get('http://localhost:8763/agents/claims/all', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Agent data response:', response);
          this.agentData = response.agent;
          // Load notifications after we have agent data
          this.loadNotifications();
        },
        error: (error) => {
          console.error('Error loading agent data:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          // Still try to load notifications with fallback ID
          this.loadNotifications();
        }
      });
  }

  loadClaims() {
    const token = this.jwtService.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    console.log('Loading claims...');
    this.http.get('http://localhost:8763/agents/claims/all', { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Claims response:', response);
          const claims = response.claim || [];
          
          // Load updated status for each claim
          this.loadClaimsWithUpdatedStatus(claims, headers);
        },
        error: (error) => {
          console.error('Error loading claims:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
        }
      });
  }

  loadClaimsWithUpdatedStatus(claims: any[], headers: HttpHeaders) {
    if (claims.length === 0) {
      this.claims = [];
      return;
    }

    let completedRequests = 0;
    const updatedClaims = [...claims];

    claims.forEach((claim, index) => {
      this.http.get(`http://localhost:8763/api/claims/${claim.claimId}`, { headers })
        .subscribe({
          next: (claimData: any) => {
            updatedClaims[index] = { ...claim, status: claimData.status };
            completedRequests++;
            
            if (completedRequests === claims.length) {
              this.claims = updatedClaims;
              console.log('Updated claims with current status:', this.claims);
            }
          },
          error: (error) => {
            console.error(`Error loading status for claim ${claim.claimId}:`, error);
            completedRequests++;
            
            if (completedRequests === claims.length) {
              this.claims = updatedClaims;
            }
          }
        });
    });
  }

  openClaimModal(claim: any) {
    this.selectedClaim = claim;
    this.showClaimModal = true;
    this.loadClaimDetails(claim);
  }

  closeClaimModal() {
    this.showClaimModal = false;
    this.selectedClaim = null;
    this.claimDetails = {};
  }

  loadClaimDetails(claim: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.jwtService.getToken()}`,
      'Content-Type': 'application/json'
    });

    console.log('Loading claim details for:', claim);
    console.log('Customer ID:', claim.customerId);
    console.log('Policy ID:', claim.policyId);

    // Load customer details
    const customerUrl = `http://localhost:8763/customer/getCustomer/${claim.customerId}`;
    console.log('Fetching customer from:', customerUrl);
    
    this.http.get(customerUrl, { headers })
      .subscribe({
        next: (customer: any) => {
          console.log('Customer response:', customer);
          this.claimDetails.customer = customer;
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          console.error('Customer error status:', error.status);
          console.error('Customer error message:', error.message);
        }
      });

    // Load policy details
    const policyUrl = `http://localhost:8763/api/policies/${claim.policyId}`;
    console.log('Fetching policy from:', policyUrl);
    
    this.http.get(policyUrl, { headers })
      .subscribe({
        next: (response: any) => {
          console.log('Policy response:', response);
          this.claimDetails.policy = response;
          console.log('Extracted policy:', this.claimDetails.policy);
        },
        error: (error) => {
          console.error('Error loading policy:', error);
          console.error('Policy error status:', error.status);
          console.error('Policy error message:', error.message);
        }
      });
  }

  approveClaim(claimId: number) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.jwtService.getToken()}`,
      'Content-Type': 'application/json'
    });

    console.log('Approving claim:', claimId);
    this.http.put(`http://localhost:8763/agents/approve-claim/${claimId}`, {}, { headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Claim approved successfully:', response);
          this.showNotificationMessage('Claim approved successfully!', 'success');
          
          // Reload claims to get updated status from backend
          this.loadClaims();
          this.closeClaimModal();
        },
        error: (error) => {
          console.error('Error approving claim:', error);
          this.showNotificationMessage('Error approving claim. Please try again.', 'error');
        }
      });
  }

  rejectClaim(claimId: number) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.jwtService.getToken()}`,
      'Content-Type': 'application/json'
    });

    console.log('Rejecting claim:', claimId);
    this.http.put(`http://localhost:8763/agents/reject-claim/${claimId}`, {}, { headers, responseType: 'text' })
      .subscribe({
        next: (response) => {
          console.log('Claim rejected successfully:', response);
          this.showNotificationMessage('Claim rejected successfully!', 'success');
          
          // Reload claims to get updated status from backend
          this.loadClaims();
          this.closeClaimModal();
        },
        error: (error) => {
          console.error('Error rejecting claim:', error);
          this.showNotificationMessage('Error rejecting claim. Please try again.', 'error');
        }
      });
  }

  getAgentInitials(): string {
    return this.agentData?.name ? this.jwtService.getInitials(this.agentData.name) : 'AG';
  }

  isClaimProcessed(status: string): boolean {
    return status === 'APPROVED' || status === 'REJECTED';
  }

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  logout() {
    if (this.notificationInterval) {
      clearInterval(this.notificationInterval);
    }
    this.jwtService.logout();
  }

  loadNotifications() {
    // Use agent ID from agent data or fallback
    let agentId = this.agentData?.agentId || 17;
    
    console.log('Loading notifications for agent ID:', agentId);
    console.log('Agent data:', this.agentData);
    
    this.agentService.getNotifications(agentId).subscribe({
      next: (data) => {
        console.log('Agent notifications received:', data);
        this.notifications = data || [];
      },
      error: (error) => {
        console.error('Error loading agent notifications:', error);
        console.error('Error details:', error.status, error.message);
        this.notifications = [];
      }
    });
  }
  
  startNotificationPolling() {
    this.notificationInterval = setInterval(() => {
      this.loadNotifications();
    }, 10000); // Check every 10 seconds
  }
  
  toggleNotifications() {
    this.showNotificationPanel = !this.showNotificationPanel;
  }
  
  toggleNotificationExpand(index: number) {
    this.notifications[index].expanded = !this.notifications[index].expanded;
  }
  
  markAsRead(notification: any, event: Event) {
    event.stopPropagation();
    this.agentService.deleteNotification(notification.id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.id !== notification.id);
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
  }

  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    // Auto hide after 4 seconds
    setTimeout(() => {
      this.showNotification = false;
    }, 4000);
  }
}