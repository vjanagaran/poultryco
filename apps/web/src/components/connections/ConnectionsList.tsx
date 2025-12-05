'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getConnections, removeConnection } from '@/lib/api/connections';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
// @ts-ignore - lucide-react type compatibility
import { Search, MessageCircle, UserX } from 'lucide-react';

interface Connection {
  id: string;
  created_at: string;
  profile: {
    id: string;
    full_name: string;
    profile_slug: string;
    headline?: string;
    profile_photo_url?: string;
    location_city?: string;
    location_state?: string;
  };
}

export function ConnectionsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch connections
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      if (!user) return [];
      
      const result = await getConnections();
      if (!result.success || !result.data) return [];
      
      // Map API response to Connection type
      return result.data.map((conn: any) => {
        // Determine the other profile
        const otherProfile = conn.profile_id_1 === user.id 
          ? conn.profile_id_2 
          : conn.profile_id_1;
        
        return {
          id: conn.id,
          created_at: conn.created_at || conn.requested_at,
          profile: conn.profile || {
            id: otherProfile,
            full_name: 'Unknown User',
            profile_slug: 'unknown',
          }
        };
      }) as Connection[];
    },
    enabled: !!user,
  });
  
  // Remove connection
  const removeConnectionMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const result = await removeConnection(connectionId);
      if (!result.success) {
        throw new Error(result.error || 'Failed to remove connection');
      }
      return connectionId;
        .eq('profile_id_2', maxId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Connection removed',
        description: 'You are no longer connected',
      });
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStats'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove connection',
      });
    }
  });
  
  // Filter connections based on search
  const filteredConnections = connections.filter(connection => {
    const searchLower = searchQuery.toLowerCase();
    return (
      connection.profile.full_name.toLowerCase().includes(searchLower) ||
      connection.profile.headline?.toLowerCase().includes(searchLower) ||
      connection.profile.location_city?.toLowerCase().includes(searchLower) ||
      connection.profile.location_state?.toLowerCase().includes(searchLower)
    );
  });
  
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center text-gray-500">Loading connections...</div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search connections by name, headline, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Connections List */}
      {filteredConnections.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          {searchQuery ? 'No connections found matching your search' : 'You have no connections yet'}
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredConnections.map((connection) => (
            <div key={connection.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <Link 
                  href={`/me/${connection.profile.profile_slug}`}
                  className="flex-shrink-0"
                >
                  <div className="relative w-16 h-16">
                    {connection.profile.profile_photo_url ? (
                      <Image
                        src={connection.profile.profile_photo_url}
                        alt={connection.profile.full_name}
                        fill
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {connection.profile.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link 
                        href={`/me/${connection.profile.profile_slug}`}
                        className="font-semibold text-gray-900 hover:text-primary transition-colors"
                      >
                        {connection.profile.full_name}
                      </Link>
                      {connection.profile.headline && (
                        <p className="text-sm text-gray-600 mt-1">
                          {connection.profile.headline}
                        </p>
                      )}
                      {(connection.profile.location_city || connection.profile.location_state) && (
                        <p className="text-sm text-gray-500 mt-1">
                          📍 {[connection.profile.location_city, connection.profile.location_state].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <Link href={`/messages?to=${connection.profile.id}`}>
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to remove this connection?')) {
                            removeConnectionMutation.mutate(connection.profile.id);
                          }
                        }}
                        disabled={removeConnectionMutation.isPending}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Summary */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600 text-center">
          {filteredConnections.length} {filteredConnections.length === 1 ? 'connection' : 'connections'}
          {searchQuery && ` matching "${searchQuery}"`}
        </p>
      </div>
    </div>
  );
}
