'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Container } from '@/components/ui';
import { ProfileHeader } from '@/components/profile/sections/ProfileHeader';
import { ProfileStrengthCard } from '@/components/profile/sections/ProfileStrengthCard';
import { AboutSection } from '@/components/profile/sections/AboutSection';
import { RolesSection } from '@/components/profile/sections/RolesSection';
import { ExperienceSection } from '@/components/profile/sections/ExperienceSection';
import { EducationSection } from '@/components/profile/sections/EducationSection';
import { SkillsSection } from '@/components/profile/sections/SkillsSection';

interface ProfileViewProps {
  profileSlug?: string;
  isOwnProfile: boolean;
}

export function ProfileView({ profileSlug, isOwnProfile }: ProfileViewProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      
      try {
        let query = supabase
          .from('profiles')
          .select(`
            *,
            roles:profile_roles(*),
            experiences:profile_experience(*),
            education:profile_education(*),
            skills:profile_skills(*)
          `);

        if (isOwnProfile) {
          // Viewing own profile - use user ID
          if (!user) {
            window.location.href = '/login';
            return;
          }
          query = query.eq('id', user.id);
        } else {
          // Viewing someone else's profile by slug
          if (!profileSlug) {
            setLoading(false);
            return;
          }
          query = query.eq('profile_slug', profileSlug);
        }

        const { data, error } = await query.single();

        if (error) throw error;

        setProfile(data);
        
        // Check if current user is the profile owner
        if (user && data.id === user.id) {
          setIsOwner(true);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, profileSlug, isOwnProfile]);

  if (loading) {
    return (
      <Container className="py-8">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-lg shadow-lg h-64"></div>
            <div className="bg-white rounded-lg shadow-lg h-96"></div>
          </div>
        </div>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container className="py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">Profile not found.</p>
            <a href="/members" className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium">
              Browse Members →
            </a>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Profile Header with Photo, Name, Headline */}
        <ProfileHeader profile={profile} isOwner={isOwner} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <AboutSection profile={profile} isOwner={isOwner} />

            {/* Roles Section */}
            <RolesSection profile={profile} isOwner={isOwner} />

            {/* Experience Section */}
            <ExperienceSection profile={profile} isOwner={isOwner} />

            {/* Education Section */}
            <EducationSection profile={profile} isOwner={isOwner} />

            {/* Skills Section */}
            <SkillsSection profile={profile} isOwner={isOwner} />
          </div>

          {/* Right Column - Profile Strength & Suggestions */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileStrengthCard profile={profile} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </Container>
  );
}

