'use client';

import { Suspense, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { searchMembers, MemberResult } from '@/lib/api/discovery';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { FilterChips } from '@/components/discovery/FilterChips';
import { MemberCard } from '@/components/discovery/cards/MemberCard';

function MembersContent() {
  const {
    searchQuery,
    filters,
    sortBy,
    viewMode,
    setViewMode,
    currentPage,
    nextPage,
    setLoading,
    isLoading,
  } = useDiscoveryStore();
  
  const [members, setMembers] = useState<MemberResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const { ref, inView } = useInView();
  
  // Fetch members
  useEffect(() => {
    async function fetchMembers() {
      setLoading(true);
      try {
        const { data, count } = await searchMembers({
          query: searchQuery,
          filters,
          page: currentPage,
          limit: 24,
          sortBy,
        });
        
        if (currentPage === 0) {
          setMembers(data);
        } else {
          setMembers(prev => [...prev, ...data]);
        }
        
        setTotalCount(count);
        setHasMore(members.length + data.length < count);
      } catch (error) {
        console.error('Error fetching members:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMembers();
  }, [searchQuery, filters, sortBy, currentPage, members.length, setLoading]);
  
  // Infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      nextPage();
    }
  }, [inView, hasMore, isLoading, nextPage]);
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search Bar */}
      <div className="mb-6">
        <UnifiedSearchBar />
      </div>
      
      {/* Filter Chips */}
      <div className="mb-4">
        <FilterChips />
      </div>
      
      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-600">
          {totalCount} {totalCount === 1 ? 'member' : 'members'} found
        </p>
        
        <div className="flex items-center gap-4">
          <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
            Filters
          </button>
          
          <div className="flex rounded-lg border border-gray-300">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Grid */}
      {members.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
          
          {/* Infinite Scroll Trigger */}
          <div ref={ref} className="h-10 mt-6" />
          
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">No members found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default function MembersPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <MembersContent />
    </Suspense>
  );
}

