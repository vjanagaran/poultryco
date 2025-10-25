import { Metadata } from 'next';
import ProfileWizard from '@/components/profile/ProfileWizard';

export const metadata: Metadata = {
  title: 'Complete Your Profile | PoultryCo',
  description: 'Complete your professional profile to connect with the poultry community.',
};

export const dynamic = 'force-dynamic';

export default function ProfileEditPage() {
  return <ProfileWizard />;
}

