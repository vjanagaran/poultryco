import { Metadata } from 'next';
import MemberDirectory from '@/components/members/MemberDirectory';

export const metadata: Metadata = {
  title: 'Member Directory | PoultryCo',
  description: 'Browse and connect with poultry professionals from around the world.',
};

export const dynamic = 'force-dynamic';

export default function MembersPage() {
  return <MemberDirectory />;
}

