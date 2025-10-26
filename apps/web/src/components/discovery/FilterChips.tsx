'use client';

import { useDiscoveryStore } from '@/stores/discoveryStore';

export function FilterChips() {
  const { activeFilters, removeFilter, clearFilters } = useDiscoveryStore();
  
  if (activeFilters.length === 0) return null;
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => removeFilter(filter.key)}
            className="hover:bg-green-200 rounded-full p-0.5 transition-colors"
          >
            ×
          </button>
        </span>
      ))}
      
      {activeFilters.length > 1 && (
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

