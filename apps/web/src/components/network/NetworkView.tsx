'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Container } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { ConnectionRequestsList } from '@/components/connections/ConnectionRequestsList';
import { ConnectionsList } from '@/components/connections/ConnectionsList';
import { useConnectionStats } from '@/hooks/useConnectionStats';
// @ts-ignore - lucide-react type compatibility
import { Users, UserPlus, UserCheck, Heart } from 'lucide-react';

export function NetworkView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('connections');
  
  const { data: stats } = useConnectionStats(user?.id);
  
  if (!user) {
    return (
      <Container className="py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">Please log in to view your network.</p>
          </div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-gray-600">Manage your connections and grow your professional network</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Connections</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.connectionsCount || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" /> {/* @ts-ignore - lucide-react type compatibility */}
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.pendingRequestsCount || 0}
                </p>
              </div>
              <UserPlus className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Following</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.followingCount || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Followers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats?.followersCount || 0}
                </p>
              </div>
              <Heart className="h-8 w-8 text-red-600" />
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="connections">
              Connections
            </TabsTrigger>
            <TabsTrigger value="requests">
              Requests {stats?.pendingRequestsCount ? `(${stats.pendingRequestsCount})` : ''}
            </TabsTrigger>
            <TabsTrigger value="following">
              Following & Followers
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections" className="space-y-4">
            <ConnectionsList />
          </TabsContent>
          
          <TabsContent value="requests" className="space-y-4">
            <ConnectionRequestsList />
          </TabsContent>
          
          <TabsContent value="following" className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <p className="text-gray-500 text-center">Following/Followers list coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Container>
  );
}
