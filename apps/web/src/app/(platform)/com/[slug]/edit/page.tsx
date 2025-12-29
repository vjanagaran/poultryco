import { Metadata } from 'next';
import { BusinessEditContent } from '@/components/business/BusinessEditContent';
import { getBusinessBySlug } from '@/lib/api/businesses';
import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Business Profile | PoultryCo',
  description: 'Update your business profile information.',
};

export const dynamic = 'force-dynamic';

export default async function BusinessEditPage({ params }: Props) {
  const { slug } = await params;
  
  try {
    // Fetch business data - component will handle auth/permissions
    const business = await getBusinessBySlug(slug);
    
    if (!business) {
      redirect('/dashboard');
    }
    
    // Transform API response to match component expectations
    const businessData = {
      ...business,
      business_name: business.name,
      business_slug: business.slug,
      logo_url: business.logoUrl,
      cover_photo_url: business.coverPhotoUrl,
      owner_id: business.ownerId,
    };
    
    return <BusinessEditContent business={businessData} />;
  } catch (error) {
    console.error('Error fetching business:', error);
    redirect('/dashboard');
  }
}

