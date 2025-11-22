'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Calendar } from "lucide-react";

export type AllTimeView = 'historical' | 'yoy';

interface AllTimeViewSelectorProps {
  currentView: AllTimeView;
  zoneSlug: string;
}

export function AllTimeViewSelector({ currentView, zoneSlug }: AllTimeViewSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleViewChange = (view: AllTimeView) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', view);
    router.push(`/necc/zones/${zoneSlug}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
      <button
        onClick={() => handleViewChange('historical')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
          currentView === 'historical'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <TrendingUp className="w-4 h-4" />
        <span>Historical Trend</span>
      </button>
      
      <button
        onClick={() => handleViewChange('yoy')}
        className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
          currentView === 'yoy'
            ? 'bg-white text-primary shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>Year-over-Year</span>
      </button>
    </div>
  );
}

