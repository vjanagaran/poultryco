import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProfileView } from '@/components/profile/ProfileView';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const cookieStore = await cookies();
  const supabase = await createClient(cookieStore);
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, headline')
    .eq('profile_slug', slug)
    .single();

  if (!profile) {
    return {
      title: 'Profile Not Found | PoultryCo',
    };
  }

  return {
    title: `${profile.full_name} | PoultryCo`,
    description: profile.headline || `${profile.full_name}'s profile on PoultryCo`,
  };
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  
  return <ProfileView profileSlug={slug} isOwnProfile={false} />;
}

