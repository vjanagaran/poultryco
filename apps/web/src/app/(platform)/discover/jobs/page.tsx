'use client';

import { Suspense, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useDiscoveryStore } from '@/stores/discoveryStore';
import { searchJobs, JobResult } from '@/lib/api/discovery';
import { UnifiedSearchBar } from '@/components/discovery/UnifiedSearchBar';
import { FilterChips } from '@/components/discovery/FilterChips';
import { JobCard } from '@/components/discovery/cards/JobCard';

function JobsContent() {
  const {
    searchQuery,
    filters,
    sortBy,
    currentPage,
    nextPage,
    setLoading,
    isLoading,
  } = useDiscoveryStore();
  
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  const { ref, inView } = useInView();
  
  // Fetch jobs
  useEffect(() => {
    async function fetchJobs() {
      setLoading(true);
      try {
        const { data, count } = await searchJobs({
          query: searchQuery,
          filters,
          page: currentPage,
          limit: 20,
          sortBy,
        });
        
        if (currentPage === 0) {
          setJobs(data);
        } else {
          setJobs(prev => [...prev, ...data]);
        }
        
        setTotalCount(count);
        setHasMore(jobs.length + data.length < count);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, [searchQuery, filters, sortBy, currentPage, jobs.length, setLoading]);
  
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
          {totalCount} {totalCount === 1 ? 'job' : 'jobs'} found
        </p>
        
        <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Filters
        </button>
      </div>
      
      {/* Results List */}
      {jobs.length > 0 ? (
        <>
          <div className="space-y-4 max-w-4xl mx-auto">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
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
          <p className="text-gray-500">No jobs found. Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <JobsContent />
    </Suspense>
  );
}
