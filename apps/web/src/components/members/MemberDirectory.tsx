'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { searchMembers } from '@/lib/api/discovery';
import Link from 'next/link';

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  headline: string | null;
  bio: string | null;
  profilePhoto: string | null;
  state: string | null;
  city: string | null;
  verificationLevel: string;
  connectionsCount?: number;
}

export default function MemberDirectory() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  useEffect(() => {
    fetchMembers();
  }, [searchQuery, selectedRole, selectedState, page]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      const result = await searchMembers({
        query: searchQuery || undefined,
        filters: {
          state: selectedState || undefined,
          role: selectedRole || undefined,
        },
        page: page - 1,
        limit: PAGE_SIZE,
      });

      const transformedData = result.data.map((member: any) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        full_name: `${member.firstName} ${member.lastName}`,
        slug: member.slug,
        headline: member.headline,
        bio: null, // TODO: Add bio to API response
        profilePhoto: member.profilePhoto,
        state: member.state,
        city: member.city,
        verificationLevel: member.verificationLevel,
        connectionsCount: member.connectionsCount,
      }));

      if (page === 1) {
        setMembers(transformedData);
      } else {
        setMembers(prev => [...prev, ...transformedData]);
      }

      setHasMore(transformedData.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setMembers([]);
    fetchMembers();
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Member Directory</h1>
              <p className="text-gray-600 mt-1">
                Connect with {members.length}+ poultry professionals
              </p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
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
            </form>

            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All States</option>
              {/* TODO: Populate from API */}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {/* TODO: Populate from API */}
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No members found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <Link
                  key={member.id}
                  href={`/me/${member.slug}`}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex-shrink-0 overflow-hidden">
                      {member.profilePhoto ? (
                        <img
                          src={member.profilePhoto}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                          {member.firstName.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {member.firstName} {member.lastName}
                      </h3>
                      {member.headline && (
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {member.headline}
                        </p>
                      )}
                      {(member.city || member.state) && (
                        <p className="text-xs text-gray-500 mt-1">
                          📍 {[member.city, member.state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
