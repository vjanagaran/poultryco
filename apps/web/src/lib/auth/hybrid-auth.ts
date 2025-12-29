/**
 * Hybrid Authentication Utilities
 * 
 * Strategy:
 * - API Backend: OTP request/verify, logout
 * - AWS Amplify: Token refresh (automatic), token storage, OAuth (Google Sign-In)
 */

import { signIn as amplifySignIn, signOut as amplifySignOut, fetchAuthSession, signInWithRedirect, getCurrentUser } from 'aws-amplify/auth';
import { apiClient } from '../api/client';
import './amplify-config'; // Initialize Amplify

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

export interface OtpVerifyParams {
  email?: string;
  phone?: string;
  code: string;
  fullName?: string;
  deviceFingerprint?: string;
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
 * Sign up a new user via API (handles SECRET_HASH)
 */
export async function signUp(params: SignUpParams): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post('/auth/cognito/signup', {
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
 * Sign in with email and password via API (handles SECRET_HASH)
 * Then use Amplify for token management
 */
export async function signIn(params: SignInParams): Promise<AuthResult> {
  try {
    // Sign in via API backend (handles SECRET_HASH)
    const result = await apiClient.post<AuthResult>('/auth/cognito/signin', {
      email: params.email,
      password: params.password,
    });

    // Store app token
    apiClient.setToken(result.accessToken);

    // Also sign in with Amplify for token management
    // Note: Amplify will handle token refresh automatically
    try {
      await amplifySignIn({
        username: params.email,
        password: params.password,
      });
    } catch (amplifyError) {
      // If Amplify sign-in fails, we still have the API token
      // This is okay - Amplify is mainly for token refresh
      // In some cases, Amplify may not be needed if API handles everything
      console.warn('Amplify sign-in optional - API token is valid:', amplifyError);
    }

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
 * Verify OTP and login/create profile (API Backend)
 */
export async function verifyOtp(params: OtpVerifyParams): Promise<AuthResult> {
  try {
    // Generate device fingerprint (device ID + browser, no IP)
    const deviceFingerprint = params.deviceFingerprint || await generateDeviceFingerprint();

    const result = await apiClient.post<AuthResult>('/auth/otp/verify', {
      email: params.email,
      phone: params.phone,
      code: params.code,
      fullName: params.fullName,
      deviceFingerprint,
    });

    // Store app token
    apiClient.setToken(result.accessToken);

    return result;
  } catch (error: any) {
    throw new Error(error.message || 'OTP verification failed');
  }
}

/**
 * Generate device fingerprint (device ID + browser, no IP)
 */
async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server';
  }

  // Collect device and browser information
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx?.fillText('Device fingerprint', 2, 2);
  const canvasFingerprint = canvas.toDataURL();

  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    canvas: canvasFingerprint.substring(0, 50), // First 50 chars
  };

  // Create hash from fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex.substring(0, 32); // Return first 32 chars
}

/**
 * Sign in with OAuth (Google) via Amplify
 */
export async function signInWithOAuth(provider: 'google' | 'linkedin'): Promise<void> {
  try {
    await signInWithRedirect({ provider: provider === 'google' ? 'Google' : 'LinkedIn' });
  } catch (error: any) {
    throw new Error(error.message || 'OAuth sign-in failed');
  }
}

/**
 * Get current session using Amplify (for token refresh)
 */
export async function getCurrentSession() {
  try {
    const session = await fetchAuthSession();
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh token using Amplify (automatic, faster)
 * Falls back to API if Amplify fails
 */
export async function refreshToken(): Promise<AuthResult> {
  try {
    // Amplify handles token refresh automatically
    const session = await fetchAuthSession({ forceRefresh: true });
    
    if (!session.tokens?.idToken) {
      throw new Error('No valid session');
    }

    // Validate with API and get app JWT
    const idToken = session.tokens.idToken.toString();
    const result = await apiClient.post<AuthResult>('/auth/cognito/validate', {
      token: idToken,
    });

    apiClient.setToken(result.accessToken);
    return result;
  } catch (error: any) {
    // Fallback to API refresh
    try {
      const result = await apiClient.post<AuthResult>('/auth/refresh');
      apiClient.setToken(result.accessToken);
      return result;
    } catch (apiError: any) {
      throw new Error(apiError.message || 'Token refresh failed');
    }
  }
}

/**
 * Sign out (API Backend - invalidates tokens)
 * Also clears Amplify session
 */
export async function signOut(): Promise<void> {
  try {
    // Invalidate tokens via API
    await apiClient.post('/auth/logout');
  } catch (error) {
    // Continue even if API call fails
    console.warn('Logout API call failed:', error);
  }

  // Clear Amplify session
  try {
    await amplifySignOut();
  } catch (error) {
    console.warn('Amplify sign-out failed:', error);
  }

  // Clear app token
  apiClient.setToken(null);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('app_token');
    localStorage.removeItem('cognito_user');
  }
}

/**
 * Forgot password - initiate (via Cognito directly)
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  // This can use Amplify's forgotPassword or keep using amazon-cognito-identity-js
  // For now, keeping it simple - can be enhanced later
  return { success: false, error: 'Forgot password not yet implemented with Amplify' };
}

/**
 * Confirm password reset (via Cognito directly)
 */
export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  // This can use Amplify's confirmResetPassword or keep using amazon-cognito-identity-js
  // For now, keeping it simple - can be enhanced later
  return { success: false, error: 'Password reset not yet implemented with Amplify' };
}

