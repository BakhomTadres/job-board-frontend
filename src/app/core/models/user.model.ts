export type UserRole = 'job seeker' | 'employer' | 'admin';

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  skills?: string[];
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  status: string;
  token?: string;
  user?: User;
  message?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  role: UserRole;
  skills?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  newEmail?: string;
  password?: string;
  passwordConfirm?: string;
  skills?: string[];
}
