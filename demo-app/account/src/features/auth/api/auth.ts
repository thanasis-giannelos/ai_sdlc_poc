import type { LoginCredentials, AuthResponse } from '../types';

// POC mock — accepts any non-empty credentials and returns a fake token
export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  await new Promise<void>((resolve) => setTimeout(resolve, 600));
  if (!credentials.email || !credentials.password) {
    throw new Error('Email and password are required');
  }
  return { token: 'mock-token' };
}
