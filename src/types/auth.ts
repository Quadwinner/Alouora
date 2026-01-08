/**
 * Authentication Types
 */

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface SignInCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
  message?: string
}

export interface AuthSession {
  user: User
  access_token: string
  refresh_token: string
  expires_at: number
}

export interface AuthError {
  message: string
  status: number
}
