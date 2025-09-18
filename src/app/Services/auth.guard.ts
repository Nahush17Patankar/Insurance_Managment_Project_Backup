import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { JwtService } from './jwt.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private router: Router) {}

  canActivate(): boolean {
    const token = this.jwtService.getToken();
    if (token) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService, private router: Router) {}

  canActivate(): boolean {
    const role = this.jwtService.getUserRole();
    console.log('AdminGuard - checking role:', role);
    if (role === 'ADMIN') {
      console.log('AdminGuard - access granted');
      return true;
    }
    console.log('AdminGuard - access denied, redirecting to login');
    this.router.navigate(['/login']);
    return false;
  }
}