'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [ownedBusinesses, setOwnedBusinesses] = useState<any[]>([]);

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
          // Try to match by profile_slug first, then fallback to id if profileSlug is a UUID
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileSlug);
          if (isUUID) {
            query = query.eq('id', profileSlug);
          } else {
            query = query.eq('profile_slug', profileSlug);
          }
        }

        const { data, error } = await query.maybeSingle();

        if (error) throw error;

        console.log('Fetched profile data:', {
          profile_photo_url: data.profile_photo_url,
          cover_photo_url: data.cover_photo_url,
          full_name: data.full_name
        });

        setProfile(data);
        
        // Check if current user is the profile owner
        if (user && data.id === user.id) {
          setIsOwner(true);
          
          // Fetch owned business profiles
          const { data: businesses, error: bizError } = await supabase
            .from('business_profiles')
            .select('id, business_name, business_slug, logo_url')
            .eq('owner_id', user.id);
          
          if (!bizError && businesses) {
            setOwnedBusinesses(businesses);
          }
        }
      } catch (error) {
        console.log('Error fetching profile:', error);
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
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-64"></div>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-96"></div>
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
            
            {/* Business Profiles - Show existing or create new */}
            {isOwner && (
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl border border-green-200 p-6">
                <div className="text-center">
                  <div className="text-4xl mb-3">🏢</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {ownedBusinesses.length > 0 ? 'Your Business Profiles' : 'Showcase Your Business'}
                  </h3>
                  
                  {ownedBusinesses.length > 0 ? (
                    <>
                      <div className="space-y-2 mb-4">
                        {ownedBusinesses.map((business) => (
                          <div key={business.id} className="bg-white rounded-lg p-3 flex items-center gap-3 border border-gray-200">
                            {business.logo_url && (
                              <img 
                                src={business.logo_url} 
                                alt={business.business_name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            )}
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900 text-sm">{business.business_name}</p>
                            </div>
                            <Link
                              href={`/com/${business.business_slug}/edit`}
                              className="text-xs px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            >
                              Edit
                            </Link>
                          </div>
                        ))}
                      </div>
                      <Link
                        href="/com/create"
                        className="inline-block w-full px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-center"
                      >
                        + Add Another Business
                      </Link>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mb-4">
                        Create a business profile to list products, services, and connect with buyers.
                      </p>
                      <Link
                        href="/com/create"
                        className="inline-block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                      >
                        Create Business Profile →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}

