import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from './AuthContext';

// Types based on our database schema
export interface Profile {
  id: string;
  full_name: string;
  profile_slug: string | null;
  profile_photo_url: string | null;
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
  verification_level: 'basic' | 'verified' | 'trusted';
  is_public: boolean;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileRole {
  id: string;
  profile_id: string;
  role_type: string;
  is_active: boolean;
  is_primary: boolean;
  sort_order: number;
}

export interface ProfileStats {
  connections_count: number;
  followers_count: number;
  following_count: number;
  skills_count: number;
  endorsements_received_count: number;
  organization_memberships_count: number;
  events_attended_count: number;
}

interface ProfileContextType {
  profile: Profile | null;
  roles: ProfileRole[];
  stats: ProfileStats | null;
  loading: boolean;
  error: string | null;
  
  // Profile operations
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  uploadProfilePhoto: (uri: string) => Promise<string | null>;
  
  // Role operations
  fetchRoles: () => Promise<void>;
  addRole: (roleType: string) => Promise<void>;
  toggleRole: (roleId: string, isActive: boolean) => Promise<void>;
  updateRoleOrder: (roleId: string, sortOrder: number) => Promise<void>;
  
  // Stats
  fetchStats: () => Promise<void>;
  refreshCompleteness: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<ProfileRole[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch profile data
  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('profile_roles')
        .select('*')
        .eq('profile_id', user.id)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;
      setRoles(data || []);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      const { data, error: fetchError } = await supabase
        .from('profile_stats')
        .select('*')
        .eq('profile_id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      setStats(data);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    }
  };

  // Update profile (uses UPSERT to handle new profiles)
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user?.id) return;

    try {
      setError(null);

      // Use upsert to insert if doesn't exist, update if exists
      const { data, error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: user.id,
            email: user.email || '',
            country: 'India', // Default country
            ...updates,
          },
          {
            onConflict: 'id',
          }
        )
        .select()
        .single();

      if (upsertError) throw upsertError;
      setProfile(data);

      // Refresh completeness after update (skip for now due to RLS issues)
      // await refreshCompleteness();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
      throw err;
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (uri: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      // TODO: Implement actual file upload to Supabase Storage
      // For now, return a placeholder
      console.log('Upload photo:', uri);
      return null;
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      return null;
    }
  };

  // Add role
  const addRole = async (roleType: string) => {
    if (!user?.id) return;

    try {
      const nextSortOrder = roles.length;

      const { data, error: insertError } = await supabase
        .from('profile_roles')
        .insert({
          profile_id: user.id,
          role_type: roleType,
          is_active: true,
          is_primary: roles.length === 0,
          sort_order: nextSortOrder,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setRoles([...roles, data]);
      await refreshCompleteness();
    } catch (err: any) {
      console.error('Error adding role:', err);
      throw err;
    }
  };

  // Toggle role active/inactive
  const toggleRole = async (roleId: string, isActive: boolean) => {
    try {
      const { error: updateError } = await supabase
        .from('profile_roles')
        .update({ is_active: isActive })
        .eq('id', roleId);

      if (updateError) throw updateError;

      setRoles(roles.map(role => 
        role.id === roleId ? { ...role, is_active: isActive } : role
      ));
    } catch (err: any) {
      console.error('Error toggling role:', err);
      throw err;
    }
  };

  // Update role order
  const updateRoleOrder = async (roleId: string, sortOrder: number) => {
    try {
      const { error: updateError } = await supabase
        .from('profile_roles')
        .update({ sort_order: sortOrder })
        .eq('id', roleId);

      if (updateError) throw updateError;

      setRoles(roles.map(role => 
        role.id === roleId ? { ...role, sort_order: sortOrder } : role
      ).sort((a, b) => a.sort_order - b.sort_order));
    } catch (err: any) {
      console.error('Error updating role order:', err);
      throw err;
    }
  };

  // Refresh profile completeness
  const refreshCompleteness = async () => {
    if (!user?.id) return;

    try {
      // Call the update_profile_completeness function
      const { error: refreshError } = await supabase.rpc('update_profile_completeness', {
        p_profile_id: user.id
      });

      if (refreshError) {
        console.warn('Could not refresh completeness:', refreshError);
      }

      // Fetch updated profile
      await fetchProfile();
      await fetchStats();
    } catch (err: any) {
      console.error('Error refreshing completeness:', err);
    }
  };

  // Load profile on mount or user change
  useEffect(() => {
    if (user?.id) {
      fetchProfile();
      fetchRoles();
      fetchStats();
    } else {
      setProfile(null);
      setRoles([]);
      setStats(null);
      setLoading(false);
    }
  }, [user?.id]);

  const value: ProfileContextType = {
    profile,
    roles,
    stats,
    loading,
    error,
    fetchProfile,
    updateProfile,
    uploadProfilePhoto,
    fetchRoles,
    addRole,
    toggleRole,
    updateRoleOrder,
    fetchStats,
    refreshCompleteness,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

