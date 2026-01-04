'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signOut as hybridSignOut } from '@/lib/auth/hybrid-auth';
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
    // Check for existing session - using API token only (Cognito not used)
    const checkSession = async () => {
      try {
        // Check for app token
        const token = apiClient.getToken();
        if (token) {
          try {
            const userData = await apiClient.get<{ user: User }>('/auth/me');
            setUser(userData.user);
          } catch (error) {
            // Token might be expired or invalid, clear it
            apiClient.setToken(null);
            setUser(null);
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
  }, []);

  const signOut = async () => {
    await hybridSignOut();
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
