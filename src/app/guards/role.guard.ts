import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { JwtService } from '../Services/jwt.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(private jwtService: JwtService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const token = this.jwtService.getToken();
    
    if (!token || token.trim() === '') {
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = this.jwtService.getUserRole()?.toUpperCase();
    const requiredRole = route.data['role']?.toUpperCase();
    
    console.log('User role:', userRole, 'Required role:', requiredRole);
    
    if (userRole === requiredRole) {
      return true;
    } else {
      // Redirect to user's appropriate dashboard
      this.jwtService.redirectBasedOnRole();
      return false;
    }
  }
}