import { Metadata } from 'next';
import { BusinessEditContent } from '@/components/business/BusinessEditContent';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
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
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get business and check ownership
  const { data: business, error } = await supabase
    .from('business_profiles')
    .select(`
      *,
      contact:business_profiles_contact(*),
      farm_details:business_farm_details(*),
      supplier_details:business_supplier_details(*)
    `)
    .eq('business_slug', slug)
    .single();

  if (error || !business) {
    redirect('/dashboard');
  }

  // Check if user is owner or admin
  const isOwner = business.owner_id === user.id;
  const { data: teamMember } = await supabase
    .from('business_team_members')
    .select('is_admin')
    .eq('business_profile_id', business.id)
    .eq('profile_id', user.id)
    .single();

  const isAdmin = teamMember?.is_admin || false;

  if (!isOwner && !isAdmin) {
    redirect(`/com/${slug}`);
  }

  return <BusinessEditContent business={business} />;
}

