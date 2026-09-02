import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface UserListResponse {
  results?: number;
  data: User[];
}

export interface UserResponse {
  data: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // يجيب كل اليوزرز - مخصص لصفحة الادمن
  getAllUsers(params?: { limit?: number; page?: number; role?: string }): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(`${this.apiUrl}/users`, { params: params as any });
  }

  getUserById(id: string): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.apiUrl}/users/${id}`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}