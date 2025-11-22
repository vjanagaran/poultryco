'use client';

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface Zone {
  id: string;
  name: string;
  zone_type: string;
}

interface AnalysisFiltersProps {
  zones: Zone[];
  currentView: string;
}

export function AnalysisFilters({ zones, currentView }: AnalysisFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedZone = searchParams.get('zone');

  const handleZoneChange = (zoneId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (zoneId) {
      params.set('zone', zoneId);
    } else {
      params.delete('zone');
    }
    if (currentView !== 'year') {
      params.set('view', currentView);
    }
    router.push(`/necc/analysis?${params.toString()}`);
  };

  return (
    <>
      {/* View Selection */}
      <div className="flex gap-3 mt-4 flex-wrap">
        {[
          { value: 'year', label: 'Year View' },
          { value: 'month', label: 'This Month' },
          { value: '30days', label: 'Last 30 Days' },
        ].map(v => (
          <Link
            key={v.value}
            href={`/necc/analysis?view=${v.value}${selectedZone ? `&zone=${selectedZone}` : ''}`}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === v.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {v.label}
          </Link>
        ))}
        <Link
          href="/necc/compare"
          className="px-4 py-2 rounded-lg font-medium bg-orange text-white hover:bg-orange-dark"
        >
          Compare Zones
        </Link>
        <Link
          href="/necc/rate"
          className="px-4 py-2 rounded-lg font-medium bg-gray-600 text-white hover:bg-gray-700"
        >
          View Rate Sheet
        </Link>
      </div>

      {/* Zone Filter */}
      {zones.length > 0 && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Zone (optional):
          </label>
          <select
            value={selectedZone || ''}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Zones</option>
            {zones.map(zone => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.zone_type === 'consumption_center' ? 'CC' : 'PC'})
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}

