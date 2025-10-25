'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Container } from '@/components/ui';
import { ProfileHeader } from '@/components/profile/sections/ProfileHeader';
import { ProfileStrengthCard } from '@/components/profile/sections/ProfileStrengthCard';
import { AboutSection } from '@/components/profile/sections/AboutSection';
import { RolesSection } from '@/components/profile/sections/RolesSection';
import { ExperienceSection } from '@/components/profile/sections/ExperienceSection';
import { EducationSection } from '@/components/profile/sections/EducationSection';
import { SkillsSection } from '@/components/profile/sections/SkillsSection';

export function ProfileView() {
  const { user } = useAuth();
  const { profile, loading, fetchProfile } = useProfile();
  const [isOwner, setIsOwner] = useState(true); // For now, always viewing own profile

  useEffect(() => {
    if (user && !profile) {
      fetchProfile();
    }
  }, [user, profile, fetchProfile]);

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
            <p className="text-red-600">Failed to load profile. Please try again.</p>
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
            {isOwner && <ProfileStrengthCard profile={profile} />}
          </div>
        </div>
      </div>
    </Container>
  );
}

