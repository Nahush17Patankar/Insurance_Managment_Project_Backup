import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtService } from '../Services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(private jwtService: JwtService, private router: Router) {}

  canActivate(): boolean {
    const token = this.jwtService.getToken();
    console.log('AuthGuard - Token exists:', !!token);
    
    if (token && token.trim() !== '') {
      console.log('AuthGuard - Access granted');
      return true;
    } else {
      console.log('AuthGuard - Access denied, redirecting to login');
      this.router.navigate(['/login']);
      return false;
    }
  }
}