import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private baseUrl = 'http://localhost:8763';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  // Agent operations
  createAgent(agentData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/registeragent`, agentData, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  getAllAgents(): Observable<any> {
    return this.http.get(`${this.baseUrl}/agents/all`, { headers: this.getHeaders() });
  }

  deleteAgent(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/agents/delete/${id}`, { headers: this.getHeaders() });
  }

  updateAgent(id: number, agentData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/agents/update/${id}`, agentData, {
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }

  // Claims operations
  getAllClaims(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/claims/claims/all`, { headers: this.getHeaders() });
  }

  // Customer operations
  getAllCustomers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/customer/getAllCustomer`, { headers: this.getHeaders() });
  }

  // Policy operations
  getAllPolicyList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/policylist`, { headers: this.getHeaders() });
  }

  deletePolicyList(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/api/policylist/${id}`, { headers: this.getHeaders() });
  }

  createPolicyList(policyData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/policylist`, policyData, {
      headers: this.getHeaders(),
    });
  }

  // Policy logs
  getAllPolicies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/policies`, { headers: this.getHeaders() });
  }

  // Communication
  sendCustomMail(mailData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/mail/send`, mailData, {
      headers: this.getHeaders(),
    });
  }

  sendCustomSMS(smsData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/sms/send`, smsData, { headers: this.getHeaders() });
  }
  
  getNotifications(agentId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/notify/agent/${agentId}`, { headers: this.getHeaders() });
  }
  
  deleteNotification(notificationId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/notify/delete/${notificationId}`, { 
      headers: this.getHeaders(),
      responseType: 'text'
    });
  }
}
