'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface RealtimeMetric {
  activeUsers: number;
  recentSignups: Array<{
    id: string;
    full_name: string;
    created_at: string;
  }>;
  recentActivity: Array<{
    type: string;
    user: string;
    timestamp: string;
  }>;
}

export function RealtimeMetrics() {
  const [metrics, setMetrics] = useState<RealtimeMetric>({
    activeUsers: 0,
    recentSignups: [],
    recentActivity: [],
  });

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial active users count
    const getActiveUsers = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_active_at', fiveMinutesAgo);
      
      setMetrics(prev => ({ ...prev, activeUsers: count || 0 }));
    };

    getActiveUsers();
    
    // Set up real-time subscription for new profiles
    const profileSubscription = supabase
      .channel('admin-new-profiles')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          setMetrics(prev => ({
            ...prev,
            recentSignups: [
              {
                id: payload.new.id,
                full_name: payload.new.full_name,
                created_at: payload.new.created_at,
              },
              ...prev.recentSignups.slice(0, 4),
            ],
          }));
        }
      )
      .subscribe();

    // Clean up subscription
    return () => {
      supabase.removeChannel(profileSubscription);
    };
  }, []);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Real-time Activity</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Live</span>
        </div>
      </div>
      
      {/* Active Users */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Active Now</span>
          <span className="text-2xl font-bold text-green-600">{metrics.activeUsers}</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">Users active in last 5 minutes</p>
      </div>
      
      {/* Recent Signups */}
      {metrics.recentSignups.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Latest Signups</h4>
          {metrics.recentSignups.map((signup) => (
            <div key={signup.id} className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-900">{signup.full_name}</span>
              <span className="text-gray-500">joined</span>
              <span className="text-xs text-gray-400">
                {new Date(signup.created_at).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
