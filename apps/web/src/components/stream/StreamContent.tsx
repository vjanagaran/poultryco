'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function StreamContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-lg shadow h-32"></div>
          <div className="bg-white rounded-lg shadow h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Post Creation Card */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex-shrink-0"></div>
            <button 
              className="flex-1 text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors"
              onClick={() => alert('Post creation coming soon!')}
            >
              Share an update, ask a question, or post a problem...
            </button>
          </div>
          <div className="flex gap-4 mt-3 ml-13 pl-1">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Problem
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Article
            </button>
          </div>
        </div>

        {/* Stream Posts Placeholder */}
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No posts yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Be the first to share something with the community!
          </p>
          <p className="text-xs text-gray-400">
            Schema: <code className="bg-gray-100 px-2 py-1 rounded">posts</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">post_likes</code>, 
            <code className="bg-gray-100 px-2 py-1 rounded ml-1">post_comments</code>
          </p>
        </div>
      </div>
    </div>
  );
}

