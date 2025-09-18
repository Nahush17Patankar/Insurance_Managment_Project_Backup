import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginRegisterService {
  private apiUrl = 'http://localhost:8763/auth';

  constructor(private client: HttpClient) {}

  getJwt(email: string, password: string): Observable<any> {
    return this.client.post(
      `${this.apiUrl}/login`,
      { email: email, password: password }, 
      { responseType: 'text' as 'json' }
    );
  }

  signup(data: any): Observable<any> {
    return this.client.post(
      `${this.apiUrl}/register`,
      {
        customerId: data.customerId,
        name: data.name,
        email: data.email,
        password: data.password,
        gender: data.gender,
        date: data.date,
        aadharnumber: data.aadharnumber,
        phone: data.phone,
        address: data.address,
        role: data.role
      },
      { responseType: 'text' as 'json' }
    );
  }
}

export class CustomerDTO {
  customerId: number;
  name: string;
  email: string;
  password: string;
  gender: string;
  date: string;
  aadharnumber: number;
  phone: number;
  address: string;
  role: string;
  
  constructor(customerId: number, name: string, email: string, password: string, 
              gender: string, date: string, aadharnumber: number, phone: number, 
              address: string, role: string) {
    this.customerId = customerId;
    this.name = name;
    this.email = email;
    this.password = password;
    this.gender = gender;
    this.date = date;
    this.aadharnumber = aadharnumber;
    this.phone = phone;
    this.address = address;
    this.role = role;
  }
}