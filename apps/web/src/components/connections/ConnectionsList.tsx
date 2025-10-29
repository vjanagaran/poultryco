'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
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
    username: string;
    headline?: string;
    profile_photo_url?: string;
    location_city?: string;
    location_state?: string;
  };
}

export function ConnectionsList() {
  const supabase = createClient();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch connections
  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['connections'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];
      
      // Get connections where user is either requester or target
      const { data: connectionsAsRequester, error: error1 } = await supabase
        .from('network_connections')
        .select(`
          id,
          created_at,
          target:profiles!network_connections_target_id_fkey (
            id,
            full_name,
            username,
            headline,
            profile_photo_url,
            location_city,
            location_state
          )
        `)
        .eq('requester_id', user.user.id)
        .eq('status', 'accepted');
      
      const { data: connectionsAsTarget, error: error2 } = await supabase
        .from('network_connections')
        .select(`
          id,
          created_at,
          requester:profiles!network_connections_requester_id_fkey (
            id,
            full_name,
            username,
            headline,
            profile_photo_url,
            location_city,
            location_state
          )
        `)
        .eq('target_id', user.user.id)
        .eq('status', 'accepted');
      
      if (error1 || error2) throw error1 || error2;
      
      // Normalize the data
      const allConnections = [
        ...(connectionsAsRequester || []).map(c => ({ ...c, profile: (c as any).target })),
        ...(connectionsAsTarget || []).map(c => ({ ...c, profile: (c as any).requester }))
      ];
      
      return allConnections.map(conn => ({
        ...conn,
        profile: conn.profile as any
      })) as Connection[];
    }
  });
  
  // Remove connection
  const removeConnectionMutation = useMutation({
    mutationFn: async (profileId: string) => {
      const { error } = await supabase.rpc('remove_connection', {
        other_profile_id: profileId
      });
      
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
        variant: 'destructive',
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
                  href={`/me/${connection.profile.username}`}
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
                        href={`/me/${connection.profile.username}`}
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
                        <Link href={`/messages?user=${connection.profile.id}`}>
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
