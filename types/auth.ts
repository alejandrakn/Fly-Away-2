// auth.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}