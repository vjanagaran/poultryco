/**
 * Hybrid Authentication Utilities
 * 
 * NOTE: Cognito/Amplify is NOT used - all authentication is handled via API backend
 * This file is kept for backward compatibility but all functions use API backend only
 */

import { apiClient } from '../api/client';

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

export interface OtpRequestParams {
  email?: string;
  phone?: string;
  channel?: 'whatsapp' | 'sms' | 'email';
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

/**
 * Sign up a new user via API backend
 */
export async function signUp(params: SignUpParams): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post('/auth/signup', {
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
 * Sign in with email and password via API backend
 */
export async function signIn(params: SignInParams): Promise<AuthResult> {
  try {
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
 * Request OTP via Email or Phone (API Backend)
 */
export async function requestOtp(params: OtpRequestParams): Promise<{ success: boolean; error?: string; otp?: string; isNewUser?: boolean }> {
  try {
    const result = await apiClient.post('/auth/otp/request', {
      email: params.email,
      phone: params.phone,
      channel: params.channel || (params.email ? 'email' : 'sms'),
    });
    
    return { 
      success: true,
      isNewUser: result.isNewUser,
      ...(result.otp ? { otp: result.otp } : {}), // Only in development
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message || 'Failed to send OTP' 
    };
  }
}

/**
 * Verify OTP and sign in (API Backend)
 */
export async function verifyOtp(params: { email?: string; phone?: string; otp: string }): Promise<AuthResult> {
  try {
    const result = await apiClient.post<AuthResult>('/auth/otp/verify', {
      email: params.email,
      phone: params.phone,
      otp: params.otp,
    });

    // Store app token
    apiClient.setToken(result.accessToken);

    return result;
  } catch (error: any) {
    throw new Error(error.message || 'OTP verification failed');
  }
}

/**
 * Sign out (API Backend)
 */
export async function signOut(): Promise<void> {
  try {
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Ignore errors - clear token anyway
  }

  // Clear app token
  apiClient.setToken(null);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('app_token');
  }
}

/**
 * Sign in with OAuth - disabled (Cognito not used)
 */
export async function signInWithOAuth(provider: 'google' | 'linkedin'): Promise<void> {
  throw new Error('OAuth is not available - Cognito is not configured');
}

/**
 * Get current session - uses API token only
 */
export async function getCurrentSession(): Promise<{ accessToken: string } | null> {
  const token = apiClient.getToken();
  if (!token) {
    return null;
  }

  // Verify token is still valid
  try {
    await apiClient.get('/auth/me');
    return { accessToken: token };
  } catch (error) {
    // Token invalid, clear it
    apiClient.setToken(null);
    return null;
  }
}

/**
 * Get current user - uses API
 */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  try {
    const result = await apiClient.get<{ user: { id: string; email: string } }>('/auth/me');
    return result.user;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh token - uses API
 */
export async function refreshToken(): Promise<AuthResult> {
  try {
    const result = await apiClient.post<AuthResult>('/auth/refresh', {});
    apiClient.setToken(result.accessToken);
    return result;
  } catch (error: any) {
    throw new Error(error.message || 'Token refresh failed');
  }
}
