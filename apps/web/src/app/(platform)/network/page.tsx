import { Metadata } from 'next';
import { NetworkView } from '@/components/network/NetworkView';

export const metadata: Metadata = {
  title: 'My Network | PoultryCo',
  description: 'Manage your connections, view requests, and grow your professional network on PoultryCo',
};

// Force dynamic rendering for this page as it uses React Query
export const dynamic = 'force-dynamic';

export default function NetworkPage() {
  return <NetworkView />;
}
