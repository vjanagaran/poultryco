'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, getCurrentSession, signOut as cognitoSignOut, refreshToken } from '@/lib/auth/cognito';
import { apiClient } from '@/lib/api/client';

interface User {
  id: string;
  email: string;
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const session = await getCurrentSession();
        if (session && session.isValid()) {
          // Get user info from API
          const token = apiClient.getToken();
          if (token) {
            try {
              const userData = await apiClient.get<{ user: User }>('/auth/me');
              setUser(userData.user);
            } catch (error) {
              // Token might be expired, try to refresh
              try {
                const refreshed = await refreshToken();
                setUser(refreshed.user);
              } catch (refreshError) {
                // Refresh failed, clear session
                await cognitoSignOut();
                setUser(null);
              }
            }
          } else {
            // No token, try to get from Cognito and validate
            const cognitoUser = await getCurrentUser();
            if (cognitoUser) {
              try {
                const session = await getCurrentSession();
                if (session) {
                  const idToken = session.getIdToken().getJwtToken();
                  const result = await apiClient.post<{ user: User; accessToken: string }>('/auth/cognito/validate', {
                    token: idToken,
                  });
                  apiClient.setToken(result.accessToken);
                  setUser(result.user);
                }
              } catch (error) {
                await cognitoSignOut();
                setUser(null);
              }
            }
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Set up periodic token refresh (every 50 minutes)
    const refreshInterval = setInterval(async () => {
      try {
        const session = await getCurrentSession();
        if (session && session.isValid() && user) {
          await refreshToken();
        }
      } catch (error) {
        console.error('Error refreshing token:', error);
      }
    }, 50 * 60 * 1000); // 50 minutes

    return () => clearInterval(refreshInterval);
  }, [user]);

  const signOut = async () => {
    await cognitoSignOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
