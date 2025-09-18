import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class JwtService {
  constructor(private router: Router) {}

  getToken(): string | null {
    return localStorage.getItem('jwt');
  }

  decodeToken(token: string): any {
    try {
      if (!token || token.split('.').length !== 3) {
        console.error('Invalid JWT format');
        return null;
      }
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      // Check multiple possible role field names
      return decoded?.role || decoded?.authorities || decoded?.authority || decoded?.roles || 'CUSTOMER';
    }
    return null;
  }

  getUserName(): string | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded?.sub || 'User';
    }
    return null;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  redirectBasedOnRole(): void {
    const role = this.getUserRole();
    console.log('User role:', role);
    
    switch (role?.toUpperCase()) {
      case 'CUSTOMER':
      case 'USER':
        console.log('Navigating to customer');
        this.router.navigate(['/customer']);
        break;
      case 'AGENT':
        console.log('Navigating to agent');
        this.router.navigate(['/agent']);
        break;
      case 'ADMIN':
        console.log('Navigating to admin');
        this.router.navigate(['/admin']);
        break;
      default:
        console.log('No matching role, redirecting to login');
        this.router.navigate(['/login']);
    }
  }

  logout(): void {
    localStorage.removeItem('jwt');
    // localStorage.removeItem('authToken');
    this.router.navigate(['/home']);
  }

  cleanupTokens(): void {
    // Remove old authToken if it exists
    localStorage.removeItem('authToken');
  }

  getCustomerId(): number | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded?.customerId || null;
    }
    return null;
  }
  
  getAgentId(): number | null {
    const token = this.getToken();
    if (token) {
      const decoded = this.decodeToken(token);
      return decoded?.agentId || null;
    }
    return null;
  }
}
