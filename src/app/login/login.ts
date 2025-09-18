import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtService } from '../Services/jwt.service';
@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  showPassword = false;
  isLoading = false;
  showNotification = false;
  notificationMessage = '';
  notificationType: 'success' | 'error' = 'success';
  loginType = ''; // 'customer' or 'agent'
  showForm = false;

  constructor(private router: Router, private http: HttpClient, private jwtService: JwtService) {}

  onLogin() {
    // Validate inputs
    if (!this.email || !this.password) {
      this.showNotificationMessage('Please enter email and password', 'error');
      return;
    }

    if (this.email.trim() === '' || this.password.trim() === '') {
      this.showNotificationMessage('Fields cannot be empty', 'error');
      return;
    }

    this.isLoading = true;
    
    // Clear any existing tokens before login
    this.jwtService.cleanupTokens();
    localStorage.removeItem('jwt');

    const loginData = {
      email: this.email.trim(),
      password: this.password.trim(),
    };

    console.log('Sending login data:', { email: loginData.email, password: '***' });

      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      });

      const loginUrl = this.loginType === 'agent' 
        ? 'http://localhost:8763/auth/agentlogin' 
        : 'http://localhost:8763/auth/login';

      this.http
        .post(loginUrl, loginData, {
          headers,
          responseType: 'text',
        })
        .subscribe({
          next: (response) => {
            console.log('Login successful:', response);
            console.log('Login type:', this.loginType);
            localStorage.setItem('jwt', response.trim());
            console.log('Token saved to localStorage');
            
            this.showNotificationMessage('Login successful!', 'success');
            
            setTimeout(() => {
              if (this.loginType === 'agent') {
                console.log('Agent login detected - redirecting to /agent');
                this.router.navigate(['/agent']);
              } else {
                console.log('Customer login - using JWT service redirect');
                this.jwtService.redirectBasedOnRole();
              }
            }, 1000);
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Login failed:', error);
            let errorMessage = 'Invalid credentials';
            
            if (error.status === 500) {
              errorMessage = 'Invalid username or password';
            } else if (error.status === 401) {
              errorMessage = 'Invalid email or password';
            } else if (error.error && error.error.includes('Invalid')) {
              errorMessage = 'Invalid email or password';
            }
            
            this.showNotificationMessage(errorMessage, 'error');
            this.isLoading = false;
          },
        });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  navigateToSignup() {
    this.router.navigate(['/signup']);
  }

  navigateToHome() {
    this.router.navigate(['/']);
  }

  goToCustomerLogin() {
    this.loginType = 'customer';
    this.showForm = true;
  }

  goToAgentLogin() {
    this.loginType = 'agent';
    this.showForm = true;
  }

  showNotificationMessage(message: string, type: 'success' | 'error') {
    this.notificationMessage = message;
    this.notificationType = type;
    this.showNotification = true;
    
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }
}
