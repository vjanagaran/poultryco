'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Container } from '@/components/ui';
import { BusinessHeader } from './sections/BusinessHeader';
import { BusinessAboutSection } from './sections/BusinessAboutSection';
import { BusinessContactSection } from './sections/BusinessContactSection';
import { BusinessTeamSection } from './sections/BusinessTeamSection';
import { BusinessProductsSection } from './sections/BusinessProductsSection';
import { BusinessLocationsSection } from './sections/BusinessLocationsSection';
import { BusinessCertificationsSection } from './sections/BusinessCertificationsSection';

interface BusinessProfileViewProps {
  businessSlug: string;
}

export interface BusinessProfile {
  id: string;
  business_name: string;
  business_slug: string;
  display_name?: string;
  logo_url?: string;
  cover_photo_url?: string;
  tagline?: string;
  about?: string;
  business_type: string;
  industry_category?: string;
  company_size?: string;
  founded_year?: number;
  website_url?: string;
  owner_id: string;
  is_verified: boolean;
  verification_date?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  contact?: {
    headquarters_address?: string;
    headquarters_state?: string;
    headquarters_city?: string;
    country: string;
    phone?: string;
    email?: string;
    whatsapp_business?: string;
  };
  locations?: Array<{
    id: string;
    location_type: string;
    location_name?: string;
    address: string;
    address_line1?: string;
    address_line2?: string;
    state: string;
    district?: string;
    city?: string;
    pincode?: string;
    postal_code?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
    operational_hours?: string;
    is_primary: boolean;
  }>;
  team?: Array<{
    id: string;
    role_title: string;
    department?: string;
    is_admin: boolean;
    show_on_page: boolean;
    profile: {
      id: string;
      full_name: string;
      profile_photo_url?: string;
      headline?: string;
    };
  }>;
  contact_persons?: Array<{
    id: string;
    contact_type: string;
    designation?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
    is_primary: boolean;
    profile: {
      id: string;
      full_name: string;
      profile_photo_url?: string;
      profile_slug: string;
    };
  }>;
  products?: Array<{
    id: string;
    product_name: string;
    description?: string;
    category?: string;
    price_range?: string;
    images?: Array<{
      image_url: string;
      is_primary: boolean;
    }>;
  }>;
  certifications?: Array<{
    id: string;
    certification_name: string;
    certification_type: string;
    issuing_authority: string;
    issue_date: string;
    expiry_date?: string;
    certificate_file_url?: string;
  }>;
  farm_details?: {
    farm_type: string[];
    total_capacity?: number;
    farming_system?: string;
    organic_certified: boolean;
  };
  supplier_details?: {
    supply_categories: string[];
    home_delivery_available: boolean;
    technical_support_available: boolean;
  };
  owner: {
    id: string;
    full_name: string;
    profile_photo_url?: string;
  };
}

export function BusinessProfileView({ businessSlug }: BusinessProfileViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchBusiness = async () => {
      const supabase = createClient();
      
      try {
        // Step 1: Fetch basic business profile first
        const { data: businessData, error: businessError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('business_slug', businessSlug)
          .single();

        if (businessError) {
          console.error('Business profile error:', businessError);
          throw businessError;
        }

        if (!businessData) {
          console.log('No business found with slug:', businessSlug);
          setBusiness(null);
          setLoading(false);
          return;
        }

        console.log('Business data loaded:', businessData);

        // Step 2: Fetch related data
        const [
          { data: contactData },
          { data: locationsData },
          { data: teamData },
          { data: contactPersonsData },
          { data: productsData },
          { data: certificationsData },
          { data: farmDetailsData },
          { data: supplierDetailsData },
          { data: ownerData }
        ] = await Promise.all([
          supabase.from('business_profiles_contact').select('*').eq('business_profile_id', businessData.id).single(),
          supabase.from('business_locations').select('*').eq('business_profile_id', businessData.id),
          supabase.from('business_team_members').select('*, profile:profiles(id, full_name, profile_photo_url, headline)').eq('business_profile_id', businessData.id),
          supabase.from('business_contact_persons').select('*, profile:profiles(id, full_name, profile_photo_url, profile_slug)').eq('business_profile_id', businessData.id),
          supabase.from('business_products').select('id, product_name, description, category, price_range, images:product_images(image_url, is_primary)').eq('business_profile_id', businessData.id),
          supabase.from('business_certifications').select('*').eq('business_profile_id', businessData.id),
          supabase.from('business_farm_details').select('*').eq('business_profile_id', businessData.id).single(),
          supabase.from('business_supplier_details').select('*').eq('business_profile_id', businessData.id).single(),
          supabase.from('profiles').select('id, full_name, profile_photo_url').eq('id', businessData.owner_id).single()
        ]);

        // Combine all data
        const completeBusinessData = {
          ...businessData,
          contact: contactData,
          locations: locationsData || [],
          team: teamData || [],
          contact_persons: contactPersonsData || [],
          products: productsData || [],
          certifications: certificationsData || [],
          farm_details: farmDetailsData,
          supplier_details: supplierDetailsData,
          owner: ownerData
        };

        console.log('Complete business data:', completeBusinessData);
        setBusiness(completeBusinessData as BusinessProfile);
        
        // Check if current user is the owner or admin
        if (user && businessData.owner_id === user.id) {
          setIsOwner(true);
        } else if (user && teamData && teamData.length > 0) {
          const isAdmin = teamData.some(
            (member: any) => member.profile.id === user.id && member.is_admin
          );
          setIsOwner(isAdmin);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
        // Show detailed error in development
        if (process.env.NODE_ENV === 'development') {
          alert(`Error loading business: ${JSON.stringify(error)}`);
        }
        setBusiness(null); // Explicitly set to null to show "not found" message
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [user, businessSlug]);

  if (loading) {
    return (
      <Container className="py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-64"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-48"></div>
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-96"></div>
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-64"></div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  if (!business) {
    return (
      <Container className="py-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">Business profile not found.</p>
            <a href="/members" className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium">
              Browse Directory →
            </a>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Business Header with Logo, Cover, Name, Actions */}
        <BusinessHeader business={business} isOwner={isOwner} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <BusinessAboutSection business={business} isOwner={isOwner} />

            {/* Products Section */}
            {business.products && business.products.length > 0 && (
              <BusinessProductsSection business={business} isOwner={isOwner} />
            )}

            {/* Team Section */}
            {business.team && business.team.length > 0 && (
              <BusinessTeamSection business={business} isOwner={isOwner} />
            )}

            {/* Locations Section */}
            {business.locations && business.locations.length > 0 && (
              <BusinessLocationsSection business={business} isOwner={isOwner} />
            )}

            {/* Certifications Section */}
            {business.certifications && business.certifications.length > 0 && (
              <BusinessCertificationsSection business={business} isOwner={isOwner} />
            )}
          </div>

          {/* Right Column - Contact & Info */}
          <div className="lg:col-span-1 space-y-6">
            <BusinessContactSection business={business} isOwner={isOwner} />
          </div>
        </div>
      </div>
    </Container>
  );
}

