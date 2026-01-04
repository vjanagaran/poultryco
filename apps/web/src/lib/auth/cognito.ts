/**
 * AWS Cognito Authentication Utilities
 * NOTE: Cognito is NOT used - all authentication is handled via API backend
 * This file is kept for backward compatibility but all functions are no-ops
 */

import { apiClient } from '../api/client';

// Cognito is disabled - userPool is always null
export const userPool = null;

export interface SignUpParams {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

export interface AuthResult {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    profile?: any;
  };
}

// Type placeholder for CognitoUserSession (not actually used)
type CognitoUserSession = any;

/**
 * Sign up a new user - uses API backend (not Cognito)
 */
export async function signUp(params: SignUpParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Use API backend for signup instead of Cognito
    const result = await apiClient.post('/auth/signup', {
      email: params.email,
      password: params.password,
      fullName: params.fullName,
      phone: params.phone,
    });
    
    return { success: true };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Sign up failed' 
    };
  }
}

/**
 * Sign in with email and password - uses API backend (not Cognito)
 */
export async function signIn(params: SignInParams): Promise<AuthResult> {
  try {
    // Use API backend for signin instead of Cognito
    const result = await apiClient.post<AuthResult>('/auth/signin', {
      email: params.email,
      password: params.password,
    });

    // Store app token
    apiClient.setToken(result.accessToken);

    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Authentication failed');
  }
}

/**
 * Sign in with OAuth - disabled (Cognito not used)
 */
export async function signInWithOAuth(provider: 'google' | 'linkedin'): Promise<void> {
  throw new Error('OAuth is not available - Cognito is not configured');
}

/**
 * Sign out - clears app token only
 */
export async function signOut(): Promise<void> {
  // Clear app token
  apiClient.setToken(null);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('app_token');
    localStorage.removeItem('cognito_user');
  }
}

/**
 * Get current session - returns null (Cognito not used)
 */
export async function getCurrentSession(): Promise<CognitoUserSession | null> {
  return null;
}

/**
 * Get current user - returns null (Cognito not used)
 */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  return null;
}

/**
 * Refresh token - throws error (Cognito not used)
 */
export async function refreshToken(): Promise<AuthResult> {
  throw new Error('Token refresh not available - Cognito is not configured');
}

/**
 * Forgot password - disabled (Cognito not used)
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Password reset not available - Cognito is not configured' };
}

/**
 * Confirm password reset - disabled (Cognito not used)
 */
export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: 'Password reset not available - Cognito is not configured' };
}
