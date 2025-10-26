'use client';

import { useState, useEffect, useRef } from 'react';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { useDebouncedCallback } from 'use-debounce';

interface SearchSuggestion {
  query: string;
  type: 'recent' | 'popular';
}

const popularSearches: SearchSuggestion[] = [
  { query: 'Broiler feed', type: 'popular' },
  { query: 'Veterinary services', type: 'popular' },
  { query: 'Farm equipment', type: 'popular' },
  { query: 'Nutrition expert', type: 'popular' },
];

export function UnifiedSearchBar() {
  const { searchQuery, setSearchQuery, searchType } = useDiscoveryStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load recent searches from localStorage
  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(recent.slice(0, 5));
  }, []);
  
  // Debounced search
  const debouncedSearch = useDebouncedCallback((value: string) => {
    setSearchQuery(value);
    
    // Save to recent searches if not empty
    if (value.trim()) {
      const updated = [value, ...recentSearches.filter(s => s !== value)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    }
  }, 300);
  
  const handleInputChange = (value: string) => {
    setLocalQuery(value);
    debouncedSearch(value);
  };
  
  const handleClear = () => {
    setLocalQuery('');
    setSearchQuery('');
    inputRef.current?.focus();
  };
  
  const handleSelectSuggestion = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
    setShowSuggestions(false);
    
    // Save to recent
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };
  
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const suggestions: SearchSuggestion[] = [
    ...recentSearches.map(q => ({ query: q, type: 'recent' as const })),
    ...popularSearches,
  ];
  
  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder={`Search ${searchType === 'all' ? 'everything' : searchType}...`}
          className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        {localQuery && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {recentSearches.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Recent Searches</p>
              {recentSearches.map((query, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSelectSuggestion(query)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                >
                  <span>🕐</span>
                  <span className="text-sm text-gray-900">{query}</span>
                </button>
              ))}
            </div>
          )}
          
          {popularSearches.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Popular Searches</p>
              {popularSearches.map((item, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => handleSelectSuggestion(item.query)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md text-left"
                >
                  <span>📈</span>
                  <span className="text-sm text-gray-900">{item.query}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

