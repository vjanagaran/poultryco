/**
 * AWS Cognito Authentication Utilities
 * Replaces Supabase authentication
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  CognitoUserSession,
} from 'amazon-cognito-identity-js';
import { apiClient } from '../api/client';

const USER_POOL_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!;
const CLIENT_ID = process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID!;

if (!USER_POOL_ID || !CLIENT_ID) {
  console.warn('AWS Cognito credentials not configured');
}

const poolData = {
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
};

export const userPool = USER_POOL_ID && CLIENT_ID ? new CognitoUserPool(poolData) : null;

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

/**
 * Sign up a new user (proxied through backend to handle SECRET_HASH)
 */
export async function signUp(params: SignUpParams): Promise<{ success: boolean; error?: string }> {
  try {
    const result = await apiClient.post('/auth/cognito/signup', {
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
 * Sign in with email and password (proxied through backend to handle SECRET_HASH)
 */
export async function signIn(params: SignInParams): Promise<AuthResult> {
  try {
    const result = await apiClient.post<AuthResult>('/auth/cognito/signin', {
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
 * Sign in with OAuth (Google, LinkedIn)
 */
export async function signInWithOAuth(provider: 'google' | 'linkedin'): Promise<void> {
  if (!userPool) {
    throw new Error('Cognito not configured');
  }

  const domain = process.env.NEXT_PUBLIC_AWS_COGNITO_DOMAIN;
  if (!domain) {
    throw new Error('Cognito domain not configured');
  }

  const redirectUri = typeof window !== 'undefined'
    ? `${window.location.origin}/auth/callback`
    : '/auth/callback';

  const clientId = CLIENT_ID;
  const responseType = 'code';
  const scope = 'email openid profile';
  const providerName = provider === 'google' ? 'Google' : 'LinkedIn';

  const authUrl = `https://${domain}/oauth2/authorize?` +
    `client_id=${clientId}&` +
    `response_type=${responseType}&` +
    `scope=${scope}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `identity_provider=${providerName}`;

  if (typeof window !== 'undefined') {
    window.location.href = authUrl;
  }
}

/**
 * Sign out
 */
export async function signOut(): Promise<void> {
  if (!userPool) {
    return;
  }

  const cognitoUser = userPool.getCurrentUser();
  if (cognitoUser) {
    cognitoUser.signOut();
  }

  // Clear app token
  apiClient.setToken(null);

  if (typeof window !== 'undefined') {
    localStorage.removeItem('app_token');
    localStorage.removeItem('cognito_user');
  }
}

/**
 * Get current session
 */
export async function getCurrentSession(): Promise<CognitoUserSession | null> {
  if (!userPool) {
    return null;
  }

  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      resolve(null);
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session || !session.isValid()) {
        resolve(null);
        return;
      }
      resolve(session);
    });
  });
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const session = await getCurrentSession();
  if (!session) {
    return null;
  }

  const idToken = session.getIdToken();
  const payload = idToken.getPayload();

  return {
    id: payload.sub,
    email: payload.email || '',
  };
}

/**
 * Refresh token
 */
export async function refreshToken(): Promise<AuthResult> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error('No active session');
  }

  return new Promise((resolve, reject) => {
    const cognitoUser = userPool!.getCurrentUser();
    if (!cognitoUser) {
      reject(new Error('No user found'));
      return;
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session) {
        reject(err || new Error('Session not found'));
        return;
      }

      session.refreshSession(session.getRefreshToken(), async (refreshErr, refreshedSession) => {
        if (refreshErr || !refreshedSession) {
          reject(refreshErr || new Error('Failed to refresh session'));
          return;
        }

        try {
          const idToken = refreshedSession.getIdToken().getJwtToken();
          const result = await apiClient.post<AuthResult>('/auth/cognito/validate', {
            token: idToken,
          });

          apiClient.setToken(result.accessToken);
          resolve(result);
        } catch (error: any) {
          reject(error);
        }
      });
    });
  });
}

/**
 * Forgot password - initiate
 */
export async function forgotPassword(email: string): Promise<{ success: boolean; error?: string }> {
  if (!userPool) {
    return { success: false, error: 'Cognito not configured' };
  }

  return new Promise((resolve) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve({ success: true });
      },
      onFailure: (err) => {
        resolve({ success: false, error: err.message || 'Failed to initiate password reset' });
      },
    });
  });
}

/**
 * Confirm password reset
 */
export async function confirmPasswordReset(
  email: string,
  code: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  if (!userPool) {
    return { success: false, error: 'Cognito not configured' };
  }

  return new Promise((resolve) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve({ success: true });
      },
      onFailure: (err) => {
        resolve({ success: false, error: err.message || 'Failed to reset password' });
      },
    });
  });
}

