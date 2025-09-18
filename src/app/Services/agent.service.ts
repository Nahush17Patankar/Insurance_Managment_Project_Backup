import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AgentService {
  private baseUrl = 'http://localhost:8763';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
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