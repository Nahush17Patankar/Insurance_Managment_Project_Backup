import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtService } from '../Services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  
  constructor(private jwtService: JwtService, private router: Router) {}

  canActivate(): boolean {
    const token = this.jwtService.getToken();
    console.log('GuestGuard - Token exists:', !!token);
    
    if (!token || token.trim() === '') {
      console.log('GuestGuard - Access granted (no token)');
      return true;
    } else {
      console.log('GuestGuard - Access denied, redirecting based on role');
      this.jwtService.redirectBasedOnRole();
      return false;
    }
  }
}