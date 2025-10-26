'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface DiscoveryNavItem {
  label: string;
  href: string;
  description: string;
}

const navItems: DiscoveryNavItem[] = [
  {
    label: 'Network',
    href: '/discover/members',
    description: 'Connect with poultry professionals',
  },
  {
    label: 'Business',
    href: '/discover/businesses',
    description: 'Discover companies and suppliers',
  },
  {
    label: 'Marketplace',
    href: '/discover/products',
    description: 'Browse products and services',
  },
  {
    label: 'Community',
    href: '/discover/organizations',
    description: 'Join industry organizations',
  },
  {
    label: 'Events & Webinars',
    href: '/discover/events',
    description: 'Attend conferences and training',
  },
  {
    label: 'Jobs',
    href: '/discover/jobs',
    description: 'Find career opportunities',
  },
];

export function DiscoveryNav() {
  const pathname = usePathname();
  
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

