'use client';

import { Suspense, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { searchEvents, EventResult } from '@/lib/api/discovery';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { FilterChips } from '@/components/discovery/FilterChips';
import { EventCard } from '@/components/discovery/cards/EventCard';

function EventsContent() {
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
  
  const [events, setEvents] = useState<EventResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const { ref, inView } = useInView();
  
  // Fetch events
  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const { data, count } = await searchEvents({
          query: searchQuery,
          filters,
          page: currentPage,
          limit: 24,
          sortBy,
        });
        
        if (currentPage === 0) {
          setEvents(data);
        } else {
          setEvents(prev => [...prev, ...data]);
        }
        
        setTotalCount(count);
        setHasMore(events.length + data.length < count);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchEvents();
  }, [searchQuery, filters, sortBy, currentPage, events.length, setLoading]);
  
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
          {totalCount} {totalCount === 1 ? 'event' : 'events'} found
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
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 text-sm ${viewMode === 'calendar' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
            >
              Calendar
            </button>
          </div>
        </div>
      </div>
      
      {/* Results Grid */}
      {events.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
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
          <p className="text-gray-500">No events found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}
