'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrganizationBySlug } from '@/lib/api/organizations';
import { useAuth } from '@/contexts/AuthContext';
import { OrganizationHeader } from './sections/OrganizationHeader';
import { OrganizationAboutSection } from './sections/OrganizationAboutSection';
import { OrganizationLeadershipSection } from './sections/OrganizationLeadershipSection';
import { OrganizationMembershipSection } from './sections/OrganizationMembershipSection';
import { OrganizationResourcesSection } from './sections/OrganizationResourcesSection';
import { OrganizationAnnouncementsSection } from './sections/OrganizationAnnouncementsSection';

export interface OrganizationProfile {
  id: string;
  organization_name: string;
  display_name?: string;
  organization_slug: string;
  organization_type: string;
  about?: string;
  mission?: string;
  vision?: string;
  founded_year?: number;
  registration_number?: string;
  website_url?: string;
  logo_url?: string;
  cover_photo_url?: string;
  owner_id: string;
  is_verified: boolean;
  member_count?: number;
  
  // Contact info
  contact?: {
    headquarters_address?: string;
    headquarters_state?: string;
    headquarters_city?: string;
    country: string;
    phone?: string;
    email?: string;
  };
  
  // Relations
  leadership?: any[];
  offices?: any[];
  members?: any[];
  resources?: any[];
  announcements?: any[];
}

interface OrganizationProfileViewProps {
  slug: string;
}

export function OrganizationProfileView({ slug }: OrganizationProfileViewProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<OrganizationProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function fetchOrganization() {
      try {
        // Fetch organization via API
        const orgData = await getOrganizationBySlug(slug);
        
        // Transform API response to match expected format
        const transformed = {
          ...orgData,
          organization_name: orgData.name,
          organization_slug: orgData.slug,
          logo_url: orgData.logoUrl,
          cover_photo_url: orgData.coverPhotoUrl,
          organization_type: orgData.organizationTypeId || '',
          // TODO: Fetch related data (contact, leadership, etc.) from API
          contact: null,
          leadership: [],
          offices: [],
          members: [],
          resources: [],
          announcements: [],
        };

        setOrganization(transformed as OrganizationProfile);
        setIsOwner(user?.id === orgData.ownerId);
      } catch (error) {
        console.error('Error fetching organization:', error);
        router.push('/directory');
      } finally {
        setLoading(false);
      }
    }

    fetchOrganization();
  }, [slug, router, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization...</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Organization Not Found</h2>
          <p className="text-gray-600 mb-4">The organization you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/directory')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Browse Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <OrganizationHeader organization={organization} isOwner={isOwner} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <OrganizationAboutSection organization={organization} isOwner={isOwner} />
            <OrganizationAnnouncementsSection organization={organization} isOwner={isOwner} />
            <OrganizationResourcesSection organization={organization} isOwner={isOwner} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <OrganizationLeadershipSection organization={organization} isOwner={isOwner} />
            <OrganizationMembershipSection organization={organization} isOwner={isOwner} currentUserId={user?.id || null} />
          </div>
        </div>
      </div>
    </div>
  );
}

