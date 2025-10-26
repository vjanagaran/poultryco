import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BusinessProfileView } from '@/components/business/BusinessProfileView';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  const { data: business } = await supabase
    .from('business_profiles')
    .select('business_name, tagline, logo_url')
    .eq('business_slug', slug)
    .single();

  if (!business) {
    return {
      title: 'Business Not Found | PoultryCo',
    };
  }

  return {
    title: `${business.business_name} | PoultryCo`,
    description: business.tagline || `View ${business.business_name} on PoultryCo`,
    openGraph: {
      images: business.logo_url ? [business.logo_url] : [],
    },
  };
}

export default async function BusinessProfilePage({ params }: Props) {
  const { slug } = await params;
  
  return <BusinessProfileView businessSlug={slug} />;
}

