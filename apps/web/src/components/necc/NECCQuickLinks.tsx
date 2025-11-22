'use client';

import Link from 'next/link';
import { Calendar, TrendingUp, MapPin, BarChart3, Table, Layers } from 'lucide-react';

export function NECCQuickLinks() {
  const links = [
    {
      icon: Calendar,
      title: "Today's Prices",
      description: 'Current rates across all zones',
      href: '/necc/today',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      icon: TrendingUp,
      title: 'Price Analysis',
      description: 'Trends and insights',
      href: '/necc/analysis',
      color: 'text-green-600 bg-green-50',
    },
    {
      icon: MapPin,
      title: 'All Zones',
      description: 'Browse all production & consumption centers',
      href: '/necc/zones',
      color: 'text-purple-600 bg-purple-50',
    },
    {
      icon: BarChart3,
      title: 'Compare Zones',
      description: 'Side-by-side zone comparison',
      href: '/necc/compare',
      color: 'text-orange-600 bg-orange-50',
    },
    {
      icon: Table,
      title: 'Rate Sheet',
      description: 'NECC-style price table',
      href: '/necc/rate',
      color: 'text-gray-600 bg-gray-50',
    },
    {
      icon: Layers,
      title: 'About NECC',
      description: 'Learn about NECC pricing',
      href: '/necc/about',
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        🥚 NECC Quick Access
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Explore all NECC egg price tools and resources
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group bg-white rounded-lg p-4 hover:shadow-md transition-all border border-gray-200 hover:border-primary/50"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${link.color} group-hover:scale-110 transition-transform`}>
                <link.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {link.title}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {link.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Source Attribution */}
      <div className="text-center pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          Data sourced from{' '}
          <a 
            href="https://e2necc.com/home/eggprice" 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            NECC (National Egg Coordination Committee)
          </a>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          PoultryCo provides analytics and insights on top of NECC's official data
        </p>
      </div>
    </div>
  );
}

