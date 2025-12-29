import { Metadata } from 'next';
import { ProfileView } from '@/components/profile/ProfileView';
import { getProfileBySlug } from '@/lib/api/users';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const profile = await getProfileBySlug(slug);

    if (!profile) {
      return {
        title: 'Profile Not Found | PoultryCo',
      };
    }

    return {
      title: `${profile.full_name} | PoultryCo`,
      description: profile.headline || `${profile.full_name}'s profile on PoultryCo`,
    };
  } catch (error) {
    return {
      title: 'Profile Not Found | PoultryCo',
    };
  }
}

export default async function ProfilePage({ params }: Props) {
  const { slug } = await params;
  
  return <ProfileView profileSlug={slug} isOwnProfile={false} />;
}

