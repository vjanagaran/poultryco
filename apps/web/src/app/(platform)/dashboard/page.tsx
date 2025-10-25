import { Metadata } from 'next';
import DashboardContent from '@/components/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard | PoultryCo',
  description: 'Your PoultryCo dashboard',
};

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return <DashboardContent />;
}

