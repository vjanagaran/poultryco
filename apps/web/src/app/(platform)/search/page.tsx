"use client";

import { useState } from 'react';
import { EmptyStates, InlineLoading } from '@/components/ui';

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setHasSearched(true);
      // TODO: Implement actual search functionality
      // Will search across profiles, business_profiles, products tables
      setTimeout(() => setIsSearching(false), 1000);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search PoultryCo</h1>
        
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search members, businesses, organizations, tools..."
              className="w-full px-12 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white text-lg transition-colors"
              autoFocus
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          
          {/* Search filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              All
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Members
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Businesses
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Organizations
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              Products
            </button>
          </div>
        </div>

        {/* Search results */}
        <div className="min-h-[400px]">
          {isSearching ? (
            <InlineLoading message="Searching..." />
          ) : hasSearched && searchQuery.trim() ? (
            <EmptyStates.NoResults 
              description={`No results found for "${searchQuery}". Try different keywords or check your spelling.`}
            />
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Start searching
              </h3>
              <p className="text-sm text-gray-600 max-w-sm mx-auto">
                Find members, businesses, organizations, products, and more across the PoultryCo platform
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}