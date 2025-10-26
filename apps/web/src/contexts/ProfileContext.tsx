'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface Profile {
  id: string;
  full_name: string;
  profile_slug: string;
  profile_photo_url: string | null;
  cover_photo_url: string | null;
  headline: string | null;
  bio: string | null;
  location_state: string;
  location_district: string | null;
  location_city: string | null;
  country: string;
  phone: string;
  phone_verified: boolean;
  email: string;
  email_verified: boolean;
  whatsapp_number: string | null;
  profile_strength: number;
  verification_level: string;
  is_public: boolean;
  last_active_at: string | null;
  last_profile_update_at: string | null;
  created_at: string;
  updated_at: string;
  roles?: any[];
  experiences?: any[];
  education?: any[];
  skills?: any[];
}

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
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          roles:profile_roles(*),
          experiences:profile_experience(*),
          education:profile_education(*),
          skills:profile_skills(*)
        `)
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) throw error;

      // Refetch profile
      await fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const addRole = async (roleType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profile_roles')
        .insert({
          profile_id: user.id,
          role_type: roleType,
          is_active: true,
          is_primary: profile?.roles?.length === 0,
        });

      if (error) throw error;

      // Refetch profile
      await fetchProfile();
    } catch (error) {
      console.error('Error adding role:', error);
      throw error;
    }
  };

  const removeRole = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from('profile_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;

      // Refetch profile
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

