'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function HomeContent() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-lg shadow h-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow h-48"></div>
            <div className="bg-white rounded-lg shadow h-48"></div>
            <div className="bg-white rounded-lg shadow h-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column - 2/3 width */}
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
            <p className="text-xs text-gray-400 mt-4">
              Schema: <code className="bg-gray-100 px-2 py-1 rounded">market_prices</code>
            </p>
          </div>

          {/* Quick Tools Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Tools</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all">
                <div className="text-3xl mb-2">🧮</div>
                <h3 className="font-semibold text-gray-900">FCR Calculator</h3>
                <p className="text-xs text-gray-500 mt-1">Calculate feed conversion ratio</p>
              </button>
              <button className="p-4 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900">Feed Projection</h3>
                <p className="text-xs text-gray-500 mt-1">Project feed requirements</p>
              </button>
              <button className="p-4 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all">
                <div className="text-3xl mb-2">💰</div>
                <h3 className="font-semibold text-gray-900">Profit Calculator</h3>
                <p className="text-xs text-gray-500 mt-1">Calculate batch profitability</p>
              </button>
              <button className="p-4 border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 rounded-lg text-left transition-all">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900">Mortality Tracker</h3>
                <p className="text-xs text-gray-500 mt-1">Track daily mortality</p>
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Coming soon - Tools will open in modals/pages
            </p>
          </div>

          {/* Placeholder for customizable widgets */}
          <div className="bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="font-semibold text-gray-700 mb-2">Customizable Dashboard</h3>
            <p className="text-sm text-gray-600 mb-3">
              Users will be able to add, remove, and rearrange widgets based on their needs
            </p>
            <p className="text-xs text-gray-400">
              Schema: <code className="bg-gray-100 px-2 py-1 rounded">user_dashboard_widgets</code>
            </p>
          </div>
        </div>

        {/* Sidebar Column - 1/3 width */}
        <div className="lg:col-span-1 space-y-6">
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
            <p className="text-xs text-gray-400 mt-4">
              Schema: Real-time counts from <code className="bg-gray-100 px-2 py-1 rounded">profiles</code>
            </p>
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

          {/* Recent Activity (Placeholder) */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="font-bold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>No recent activity</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Schema: <code className="bg-gray-100 px-2 py-1 rounded">user_activity</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

