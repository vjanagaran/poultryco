'use client';

import { useEffect, useState } from 'react';
import { useDiscoveryStore } from '@/stores/discoveryStore';

interface BottomSheetFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filterType: 'members' | 'businesses' | 'products' | 'organizations' | 'events' | 'jobs';
}

export function BottomSheetFilters({ isOpen, onClose, filterType }: BottomSheetFiltersProps) {
  const { filters, setFilters, sortBy, setSortBy } = useDiscoveryStore();
  const [localFilters, setLocalFilters] = useState(filters);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  
  useEffect(() => {
    if (isOpen) {
      setLocalFilters(filters);
      setLocalSortBy(sortBy);
    }
  }, [isOpen, filters, sortBy]);
  
  const handleApply = () => {
    setFilters(localFilters);
    setSortBy(localSortBy);
    onClose();
  };
  
  const handleReset = () => {
    setLocalFilters({});
    setLocalSortBy('relevant');
  };
  
  if (!isOpen) return null;
  
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50 max-h-[85vh] overflow-hidden lg:hidden">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Filters & Sort</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-4 py-4 space-y-6">
          {/* Sort By */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Sort By</h4>
            <div className="space-y-2">
              {['relevant', 'recent', 'popular'].map((option) => (
                <label key={option} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="sortBy"
                    value={option}
                    checked={localSortBy === option}
                    onChange={(e) => setLocalSortBy(e.target.value as any)}
                    className="w-4 h-4 text-green-600"
                  />
                  <span className="text-sm text-gray-700 capitalize">{option}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Type-specific filters */}
          {filterType === 'members' && (
            <>
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Role</h4>
                <input
                  type="text"
                  placeholder="e.g. Farm Manager"
                  value={localFilters.role || ''}
                  onChange={(e) => setLocalFilters({ ...localFilters, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localFilters.verified || false}
                    onChange={(e) => setLocalFilters({ ...localFilters, verified: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Verified profiles only</span>
                </label>
              </div>
            </>
          )}
          
          {filterType === 'products' && (
            <>
              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localFilters.inStock || false}
                    onChange={(e) => setLocalFilters({ ...localFilters, inStock: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">In stock only</span>
                </label>
              </div>
            </>
          )}
          
          {filterType === 'events' && (
            <>
              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localFilters.isFree || false}
                    onChange={(e) => setLocalFilters({ ...localFilters, isFree: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Free events only</span>
                </label>
              </div>
            </>
          )}
          
          {filterType === 'jobs' && (
            <>
              <div>
                <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={localFilters.isRemote || false}
                    onChange={(e) => setLocalFilters({ ...localFilters, isRemote: e.target.checked })}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm text-gray-700">Remote jobs only</span>
                </label>
              </div>
            </>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex gap-3 px-4 py-3 border-t border-gray-200">
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

