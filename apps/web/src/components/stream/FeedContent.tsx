'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function FeedContent() {
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
          <div className="bg-white rounded-lg shadow h-64"></div>
          <div className="bg-white rounded-lg shadow h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Market Prices Widget */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Today&apos;s Market Prices
              </h2>
              <span className="text-xs text-gray-500">Updated 10 min ago</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Broiler (Chennai)</span>
                <span className="font-bold text-green-600">₹125/kg</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Layer Feed</span>
                <span className="font-bold text-green-600">₹1,850/bag</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Egg (Namakkal)</span>
                <span className="font-bold text-green-600">₹4.85/pc</span>
              </div>
            </div>
          </div>

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

          {/* Feed Posts Placeholder */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"></div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Dr. Rajesh Kumar</h3>
                    <p className="text-sm text-gray-500">Veterinarian • Chennai • 2 days ago</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  🩺 Important reminder for all poultry farmers: With the summer season approaching, 
                  please ensure proper ventilation in your sheds. Heat stress can significantly impact 
                  bird health and productivity. Let me know if you need any guidance!
                </p>
                <div className="flex gap-6 pt-4 border-t border-gray-100">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span className="text-sm">Like (24)</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span className="text-sm">Comment (8)</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">Quick Tools</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <span>🧮</span>
                <span>FCR Calculator</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <span>📊</span>
                <span>Feed Projection</span>
              </button>
              <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                <span>💰</span>
                <span>Profit Calculator</span>
              </button>
            </div>
          </div>

          {/* Community Stats */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">Community Growth</h3>
            <div className="space-y-3">
              <div>
                <div className="text-2xl font-bold text-green-600">5,247</div>
                <div className="text-sm text-gray-600">Total Members</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">23</div>
                <div className="text-sm text-gray-600">States Represented</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">847</div>
                <div className="text-sm text-gray-600">Verified Experts</div>
              </div>
            </div>
          </div>

          {/* Platform Status */}
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg shadow-sm p-4 border border-blue-200">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">🚧</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Building in Public</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Features activate as we ship them. Your feedback shapes what we build next!
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1 text-xs">
                <span className="font-medium text-gray-700">Platform Development</span>
                <span className="text-gray-600">65%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Launch: January 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

