import { Metadata } from 'next';
import { ProfileView } from '@/components/profile/ProfileView';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'My Profile | PoultryCo',
  description: 'View and edit your PoultryCo profile.',
};

export default function MyProfilePage() {
  return (
    <ErrorBoundary>
      <ProfileView isOwnProfile={true} />
    </ErrorBoundary>
  );
}
