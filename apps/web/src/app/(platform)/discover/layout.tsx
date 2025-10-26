import { DiscoveryNav } from '@/components/discovery/DiscoveryNav';

export default function DiscoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DiscoveryNav />
      {children}
    </div>
  );
}

