'use client';

import { useRouter } from "next/navigation";
import { Share2, Download, ArrowLeftRight, FileText, MapPin, ChevronDown } from "lucide-react";
import { useState } from "react";

interface Zone {
  id: string;
  name: string;
  slug: string;
  zone_type: 'production_center' | 'consumption_center';
  state?: string;
  city?: string;
}

interface ZoneActionToolbarProps {
  currentZone: Zone;
  allZones: Zone[];
  zoneName: string;
  periodLabel: string;
}

export function ZoneActionToolbar({ 
  currentZone, 
  allZones,
  zoneName,
  periodLabel 
}: ZoneActionToolbarProps) {
  const router = useRouter();
  const [showZoneDropdown, setShowZoneDropdown] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const text = `NECC Egg Prices - ${zoneName} (${periodLabel})`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url });
      } catch (err) {
        // User cancelled or error
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
    alert('Link copied to clipboard!');
  };

  const handleDownload = () => {
    // TODO: Implement CSV/Image download
    alert('Download feature coming soon!');
  };

  const handleZoneChange = (slug: string) => {
    setShowZoneDropdown(false);
    router.push(`/necc/zones/${slug}${window.location.search}`);
  };

  return (
    <div className="flex items-center justify-between gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Left: Zone Selector */}
      <div className="relative flex-1 max-w-xs">
        <button
          onClick={() => setShowZoneDropdown(!showZoneDropdown)}
          className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg text-left transition-colors"
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">{currentZone.name}</div>
              <div className="text-xs text-gray-500 truncate">
                {currentZone.zone_type === 'production_center' ? 'Production' : 'Consumption'} Center
              </div>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${showZoneDropdown ? 'rotate-180' : ''}`} />
        </button>

        {/* Zone Dropdown */}
        {showZoneDropdown && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setShowZoneDropdown(false)}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
              <div className="p-2">
                <input
                  type="text"
                  placeholder="Search zones..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="py-1">
                {/* Group by type */}
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase bg-gray-50">
                  Production Centers
                </div>
                {allZones
                  .filter(z => z.zone_type === 'production_center')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(zone => (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneChange(zone.slug)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                        zone.id === currentZone.id ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{zone.name}</div>
                      {zone.city && (
                        <div className="text-xs text-gray-500">{zone.city}, {zone.state}</div>
                      )}
                    </button>
                  ))}
                
                <div className="px-3 py-1 text-xs font-semibold text-gray-500 uppercase bg-gray-50 mt-2">
                  Consumption Centers
                </div>
                {allZones
                  .filter(z => z.zone_type === 'consumption_center')
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(zone => (
                    <button
                      key={zone.id}
                      onClick={() => handleZoneChange(zone.slug)}
                      className={`w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                        zone.id === currentZone.id ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
                      }`}
                    >
                      <div className="font-medium">{zone.name}</div>
                      {zone.city && (
                        <div className="text-xs text-gray-500">{zone.city}, {zone.state}</div>
                      )}
                    </button>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Right: Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium transition-colors"
          title="Download"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Download</span>
        </button>

        <button
          onClick={() => router.push('/necc/compare')}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          title="Compare Zones"
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span className="hidden sm:inline">Compare</span>
        </button>

        <button
          onClick={() => router.push('/necc/rate')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          title="Rate Sheet"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Rate Sheet</span>
        </button>
      </div>
    </div>
  );
}

