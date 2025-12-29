'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as usersApi from '@/lib/api/users';
import type { Profile } from '@/lib/api/users';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  addRole: (roleType: string) => Promise<void>;
  removeRole: (roleId: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData = await usersApi.getCurrentProfile();
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [user, fetchProfile]);

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;

    try {
      const updated = await usersApi.updateProfile(data);
      setProfile(updated);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const addRole = async (roleType: string) => {
    if (!user || !profile) return;

    try {
      // TODO: Implement role API endpoint in backend
      // For now, this is a placeholder
      // await usersApi.addRole(roleType);
      await fetchProfile();
    } catch (error) {
      console.log('Error adding role:', error);
      throw error;
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      // TODO: Implement role API endpoint in backend
      // For now, this is a placeholder
      // await usersApi.removeRole(roleId);
      await fetchProfile();
    } catch (error) {
      console.error('Error removing role:', error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        fetchProfile,
        updateProfile,
        addRole,
        removeRole,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
