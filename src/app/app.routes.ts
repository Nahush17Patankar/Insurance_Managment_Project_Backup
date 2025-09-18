import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { Login } from './login/login';
import { SignupComponent } from './signup/signup';
import { Customer } from './customer/customer';
import { Admin } from './admin/admin';
import { Agent } from './agent/agent';
import { GuestGuard } from './guards/guest.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: Login, canActivate: [GuestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [GuestGuard] },
  { path: 'admin', component: Admin, canActivate: [RoleGuard], data: { role: 'ADMIN' } },
  { path: 'customer', component: Customer, canActivate: [RoleGuard], data: { role: 'CUSTOMER' } },
  { path: 'agent', component: Agent, canActivate: [RoleGuard], data: { role: 'AGENT' } },
  { path: '**', redirectTo: '/home' }
];